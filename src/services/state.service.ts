import { Injectable, signal, computed, inject, effect, WritableSignal, Signal } from '@angular/core';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { Order, OrderItem, OrderStatus, ReturnStatus } from '../models/order.model';
import { Review } from '../models/review.model';
import { Category } from '../models/category.model';
import { ProductService } from './product.service';
import { Faq } from '../models/faq.model';
import { Popup } from '../models/popup.model';
import { Transaction } from '../models/transaction.model';
import { Coupon } from '../models/coupon.model';
import { AuthService } from './auth.service';
import { User as FirebaseUser } from 'firebase/auth';
import { environment } from '../environments/environment';
import { FirestoreService } from './firestore.service';
import { doc, writeBatch, collection } from 'firebase/firestore';

export interface ReturnRequest {
  reason: string;
  comment: string;
  photoUrl?: string;
  status: ReturnStatus;
  requestDate?: string;
  returnType?: string;
  refundMethod?: string;
}

interface CartItem {
    product: Product;
    size: string;
    quantity: number;
    customization?: {
      photoPreviewUrl: string;
      fileName: string;
    }
}

export interface ActiveFilters {
  priceRanges: string[];
  discounts: number[];
}

export interface ShippingSettings {
  flatRate: number;
  freeShippingThreshold: number;
}

export interface HeroSlide {
  id: string;
  img: string;
  title: string;
  subtitle: string;
  productId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private productService: ProductService = inject(ProductService);
  private authService: AuthService = inject(AuthService);
  private firestore: FirestoreService = inject(FirestoreService);
  
  private unsubscribers: (() => void)[] = [];
  private secondaryDataLoaded = false;
  
  // --- STATE SIGNALS ---
  heroSlides = signal<HeroSlide[]>([]);
  users = signal<User[]>([]);
  currentUser = signal<User | null>(null);
  originalAdmin = signal<User | null>(null);
  orders = signal<Order[]>([]);
  allAddresses = signal<Address[]>([]);
  coupons = signal<Coupon[]>([]);
  popups = signal<Popup[]>([]);
  _categories = signal<Category[]>([]);
  faqs = signal<Faq[]>([]);
  userReviews = signal<Review[]>([]);
  transactions = signal<Transaction[]>([]);
  shippingSettings = signal<ShippingSettings>({ flatRate: 0, freeShippingThreshold: 0 });
  contactInfo = signal<any>({});
  homePageSections = signal<string[]>([]);
  smallBanner = signal<{img: string, link: string} | null>(null);
  
  // Local/Session State
  currentView = signal<string>('home');
  protectedViews = new Set(['profile', 'address', 'payment', 'orders', 'address-form', 'admin', 'profile-edit', 'manual-payment', 'admin-bulk-updater', 'admin-flash-sales', 'wallet', 'wishlist', 'partner-program', 'coupons', 'return-request', 'manage-addresses']);
  lastNavigatedView = signal<string>('home');
  currentAdminView = signal<string>('dashboard');
  productToEdit = signal<Product | null>(null);
  isSidebarOpen = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  currentLanguage = signal<string>('en');
  selectedProductId = signal<string | null>(null);
  selectedCategory = signal<string | null>(null);
  searchQuery = signal<string>('');
  activeFilters = signal<ActiveFilters>({ priceRanges: [], discounts: [] });
  sortOption = signal<string>('recommended');
  recentlyViewed = signal<string[]>([]);
  cartItems = signal<CartItem[]>([]);
  appliedCoupon = signal<Coupon | null>(null);
  selectedAddressId = signal<string | null>(null);
  addressToEdit = signal<Address | null>(null);
  selectedPaymentMethod = signal<string>('COD');
  latestOrderId = signal<string | null>(null);
  selectedOrderItemForReturn = signal<{ orderId: string, itemId: string } | null>(null);
  productViewCounts = signal<Map<string, Map<string, number>>>(new Map());
  comparisonList = signal<string[]>([]);
  isInitialDataLoaded = signal(false);

  // --- COMPUTED VALUES ---
  readonly categories: Signal<Category[]>;
  readonly isAuthenticated: Signal<boolean>;
  readonly isAdmin: Signal<boolean>;
  readonly isImpersonating: Signal<boolean>;
  readonly isB2B: Signal<boolean>;
  readonly wishlist: Signal<Set<string>>;
  readonly wishlistItemCount: Signal<number>;
  readonly activePopup: Signal<Popup | undefined>;
  readonly currentUserAddresses: Signal<Address[]>;
  readonly cartItemsWithPrices: Signal<(CartItem & { displayPrice: number; })[]>;
  readonly cartItemCount: Signal<number>;
  readonly cartSubtotal: Signal<number>;
  readonly cartMRP: Signal<number>;
  readonly cartDiscountOnMRP: Signal<number>;
  readonly couponDiscount: Signal<number>;
  readonly shippingCost: Signal<number>;
  readonly cartTotal: Signal<number>;
  readonly isCodAvailableInCart: Signal<boolean>;
  readonly totalSales: Signal<number>;
  readonly pendingOrdersCount: Signal<number>;
  readonly totalUsersCount: Signal<number>;

  constructor() {
    this.categories = computed(() => {
      const cats = this._categories();
      const seen = new Set<string>();
      return cats.filter(cat => {
          const duplicate = seen.has(cat.name);
          seen.add(cat.name);
          return !duplicate;
      });
    });
    this.isAuthenticated = computed(() => !!this.currentUser());
    this.isAdmin = computed(() => this.authService.isAdmin() && !this.isImpersonating());
    this.isImpersonating = computed(() => !!this.originalAdmin());
    this.isB2B = computed(() => this.currentUser()?.userType === 'B2B');
    this.wishlist = computed(() => new Set(this.currentUser()?.wishlist || []));
    this.wishlistItemCount = computed(() => this.wishlist().size);
    this.activePopup = computed(() => this.popups().find(p => p.isActive));
    this.currentUserAddresses = computed(() => {
      const user = this.currentUser();
      if (!user) return [];
      return this.allAddresses().filter(addr => addr.userId === user.id);
    });
    this.cartItemsWithPrices = computed(() => {
      const isB2B = this.isB2B();
      return this.cartItems().map(item => {
        const displayPrice = (isB2B && item.product.b2bPrice) ? item.product.b2bPrice : item.product.price;
        return { ...item, displayPrice };
      });
    });
    this.cartItemCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
    this.cartSubtotal = computed(() => this.cartItemsWithPrices().reduce((acc, item) => acc + (item.displayPrice * item.quantity), 0));
    this.cartMRP = computed(() => this.cartItems().reduce((acc, item) => acc + (item.product.originalPrice * item.quantity), 0));
    this.cartDiscountOnMRP = computed(() => this.cartItemsWithPrices().reduce((acc, item) => acc + ((item.product.originalPrice - item.displayPrice) * item.quantity), 0));
    this.couponDiscount = computed(() => {
      const coupon = this.appliedCoupon();
      const subtotal = this.cartSubtotal();
      if (!coupon || subtotal === 0) return 0;
      if (coupon.type === 'flat') return Math.min(coupon.value, subtotal);
      else return Math.round((subtotal * coupon.value) / 100);
    });
    this.shippingCost = computed(() => {
      const subtotal = this.cartSubtotal();
      if (subtotal === 0) return 0;
      const settings = this.shippingSettings();
      return subtotal >= settings.freeShippingThreshold ? 0 : settings.flatRate;
    });
    this.cartTotal = computed(() => {
      const subtotal = this.cartSubtotal();
      if (subtotal === 0) return 0;
      return Math.max(0, subtotal - this.couponDiscount() + this.shippingCost());
    });
    this.isCodAvailableInCart = computed(() => this.cartItems().every(item => item.product.isCodAvailable));
    this.totalSales = computed(() => this.orders().reduce((acc, order) => acc + order.totalAmount, 0));
    this.pendingOrdersCount = computed(() => this.orders().filter(o => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Pending Verification').length);
    this.totalUsersCount = computed(() => this.users().length);

    this.init();
    
    if (typeof localStorage !== 'undefined') {
      const storedLang = localStorage.getItem('crazyBasketLang');
      if (storedLang) { this.currentLanguage.set(storedLang); }
      const storedRecentlyViewed = localStorage.getItem('crazyBasketRecentlyViewed');
      if (storedRecentlyViewed) {
        try {
          this.recentlyViewed.set(JSON.parse(storedRecentlyViewed));
        } catch (e) {
          console.error('Failed to parse recently viewed items from localStorage:', e);
        }
      }
    }
    
    effect(() => {
      const authUser = this.authService.currentUser();
      if (authUser?.email) {
        let appUser: User | undefined;
        if (environment.adminEmails.includes(authUser.email)) {
          appUser = this.users().find(u => u.email === authUser.email);
        } else {
          appUser = this.users().find(u => u.id === authUser.uid);
        }
        
        if (appUser) {
          const currentProvider = authUser.providerData[0]?.providerId;
          if (currentProvider && appUser.provider !== currentProvider) {
            const updatedUser: User = { ...appUser, provider: currentProvider };
            this.users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
            this.firestore.setDocument('users', updatedUser.id, { provider: currentProvider }).catch(e => console.error("Failed to update user provider in DB", e));
            appUser = updatedUser;
          }
        } else {
          appUser = this.createNewAppUserFromAuthUser(authUser);
          this.users.update(users => [...users, appUser!]);
          this.firestore.setDocument('users', appUser.id, appUser).catch(e => console.error("Failed to create user in DB", e));
        }

        this.currentUser.set(appUser);
      } else {
        this.currentUser.set(null);
      }
    });

    effect(() => {
      const user = this.currentUser();
      if (user) {
        const addresses = this.currentUserAddresses();
        const defaultAddress = addresses.find(a => a.isDefault);
        this.selectedAddressId.set(defaultAddress?.id || (addresses.length > 0 ? addresses[0].id : null));
      } else {
        this.selectedAddressId.set(null);
      }
    });

    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('crazyBasketRecentlyViewed', JSON.stringify(this.recentlyViewed()));
      }
    });

    effect(() => {
      const user = this.currentUser();
      if (user?.isBlacklisted && this.isAuthenticated()) {
        console.warn('Blacklisted user session detected. Forcing logout.');
        this.logout();
      }
    });
  }

  private init(): void {
    this.loadInitialData();
  }
  
  private async loadInitialData() {
    console.log('Loading critical initial data...');
    this.setupInitialCategories();
    this.setupInitialProducts();

    const criticalDataPromises = [
      this.loadCollection('categories', this._categories),
      this.loadCollection('banners', this.heroSlides),
      this.loadDoc('settings', 'shipping', this.shippingSettings, () => ({ flatRate: 40, freeShippingThreshold: 499 })),
      this.loadDoc('settings', 'contactInfo', this.contactInfo, this.getMockContactInfo),
      this.loadDoc('settings', 'smallBanner', this.smallBanner, () => ({ img: 'https://picsum.photos/id/10/1200/200', link: 'home' })),
      (async () => {
        const newLayout = ['slider', 'deals', 'recentlyViewed', 'trending'];
        this.homePageSections.set(newLayout);
        try {
          await this.firestore.setDocument('settings', 'homePageSections', { value: newLayout });
        } catch (e) {
          console.error(`Failed to update 'settings/homePageSections'.`, e);
        }
      })()
    ];
    
    await Promise.all(criticalDataPromises);
    this.setupInitialBanners();
    
    console.log('Critical initial data loaded.');
    this.isInitialDataLoaded.set(true);
  }

  private async loadSecondaryData() {
    console.log('Loading secondary data in the background...');
    const ordersLoadedPromise = new Promise<void>(resolve => {
        let initialLoad = true;
        const unsubscribe = this.firestore.listenToCollection<Order>('orders', (data) => {
            const ordersWithDates = data.map(order => ({
              ...order,
              date: (order.date as any).toDate ? (order.date as any).toDate() : new Date(order.date)
            }));
            this.orders.set(ordersWithDates);

            if (initialLoad) {
                console.log(`Successfully loaded initial collection 'orders' from Firestore listener.`);
                initialLoad = false;
                resolve();
            } else {
                 console.log(`[Real-time update] Collection 'orders' updated.`);
            }
        });
        this.unsubscribers.push(unsubscribe);
    });

    const dataLoadingPromises = [
      this.loadCollection('users', this.users),
      this.loadCollection('addresses', this.allAddresses),
      ordersLoadedPromise,
      this.loadCollection('coupons', this.coupons),
      this.loadCollection('popups', this.popups),
      this.loadCollection('faqs', this.faqs),
      this.loadCollection('reviews', this.userReviews),
      this.loadCollection('transactions', this.transactions),
    ];
    
    await Promise.all(dataLoadingPromises);
    console.log('Secondary data loaded.');
  }
  
  private async loadCollection<T extends {id: string}>(name: string, signal: WritableSignal<T[]>) {
    try {
      const data = await this.firestore.getCollection<T>(name);
      if (name === 'categories') {
        const desiredOrder = ["Men", "Women", "Customize Gift", "Electronics"];
        (data as unknown as Category[]).sort((a, b) => {
          const indexA = desiredOrder.indexOf(a.name);
          const indexB = desiredOrder.indexOf(b.name);

          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          
          return indexA - indexB;
        });
      }
      signal.set(data);
      console.log(`Successfully loaded collection '${name}' from Firestore.`);
    } catch (e) {
      console.error(`Failed to load collection '${name}' from Firestore. Setting to empty array.`, e);
      signal.set([]);
    }
  }

  private async loadDoc<T extends object>(collection: string, docId: string, signal: WritableSignal<T>, defaultValueFn: () => T) {
    try {
        const doc = await this.firestore.getDocument<T>(collection, docId);
        if (doc) {
            signal.set(doc);
            console.log(`Successfully loaded document '${collection}/${docId}' from Firestore.`);
        } else {
             console.warn(`Document '${collection}/${docId}' not found in Firestore. Using default value.`);
             signal.set(defaultValueFn());
        }
    } catch (e) {
        console.error(`Failed to load document '${collection}/${docId}' from Firestore. Using default value.`, e);
        signal.set(defaultValueFn());
    }
  }

  private async setupInitialCategories() {
    let categories = this.categories();
    const batch = writeBatch(this.firestore.getDb());
    let changesMade = false;

    const categoriesToDelete = ['Beauty', 'Kids'];
    for (const catName of categoriesToDelete) {
        const catsToDelete = categories.filter(c => c.name.toLowerCase() === catName.toLowerCase());
        if (catsToDelete.length > 0) {
            for (const cat of catsToDelete) {
                const docRef = doc(this.firestore.getDb(), 'categories', cat.id);
                batch.delete(docRef);
                changesMade = true;
                console.log(`Scheduled deletion for category: ${cat.name} (ID: ${cat.id})`);
            }
        }
    }
    
    const categoriesToEnsure = [
        { name: 'Men', img: 'https://picsum.photos/id/1005/200/200', bgColor: 'bg-blue-100' },
        { name: 'Women', img: 'https://picsum.photos/id/1027/200/200', bgColor: 'bg-pink-100' },
        { name: 'Customize Gift', img: 'https://picsum.photos/id/1074/200/200', bgColor: 'bg-purple-100' },
        { name: 'Electronics', img: 'https://picsum.photos/id/2/200/200', bgColor: 'bg-gray-200' }
    ];

    for (const catToEnsure of categoriesToEnsure) {
        const exists = categories.some(c => c.name === catToEnsure.name);
        if (!exists) {
            const newId = `cat_${Date.now()}_${catToEnsure.name.replace(' ', '_').toLowerCase()}`;
            const newCategoryDoc = doc(this.firestore.getDb(), 'categories', newId);
            batch.set(newCategoryDoc, { name: catToEnsure.name, img: catToEnsure.img, bgColor: catToEnsure.bgColor });
            changesMade = true;
            console.log(`Scheduled creation for category: ${catToEnsure.name}`);
        }
    }

    if (changesMade) {
      try {
        await batch.commit();
        console.log('Successfully configured categories in Firestore.');
        await this.loadCollection('categories', this._categories); 
        this.showToast('Default categories have been configured.');
      } catch (error) {
        console.error('Category setup failed:', error);
      }
    }
  }

  private async setupInitialProducts() {
    await this.productService.productsLoaded;
    const allProducts = this.productService.getAllProducts();
    let changesMade = false;

    const hasMen = allProducts.some(p => p.category === 'Men');
    if (!hasMen) {
        const menProducts: Omit<Product, 'id'>[] = [
            {
                name: "Graphic Print T-Shirt", brand: "Urban Threads", price: 799, originalPrice: 1299, discount: 38, rating: 4.5, reviews: 320,
                images: ['https://picsum.photos/seed/menstee1/400/500', 'https://picsum.photos/seed/menstee2/400/500'],
                sizes: [{ name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: false }],
                details: ['100% Cotton', 'Regular Fit', 'Graphic print on front'],
                fit: 'Regular Fit', fabric: 'Cotton', category: 'Men', isCodAvailable: true, allowPhotoUpload: false, preorderAvailable: false,
                color: 'Black', pattern: 'Graphic Print', idealFor: 'Men', sleeve: 'Short Sleeve', closure: 'Pullover', fabricCare: 'Machine wash', returnWindowDays: 7
            },
            {
                name: "Slim Fit Denim Jeans", brand: "Denim Co.", price: 1899, originalPrice: 2999, discount: 37, rating: 4.7, reviews: 890,
                images: ['https://picsum.photos/seed/mensjeans1/400/500', 'https://picsum.photos/seed/mensjeans2/400/500'],
                sizes: [{ name: '30', inStock: true }, { name: '32', inStock: true }, { name: '34', inStock: true }, { name: '36', inStock: false }],
                details: ['98% Cotton, 2% Elastane', 'Slim Fit', 'Mid-rise'],
                fit: 'Slim Fit', fabric: 'Denim', category: 'Men', isCodAvailable: true, allowPhotoUpload: false, preorderAvailable: false,
                color: 'Blue', pattern: 'Solid', idealFor: 'Men', sleeve: 'N/A', closure: 'Button and Zip', fabricCare: 'Machine wash', returnWindowDays: 7
            }
        ];
        for (const p of menProducts) { await this.productService.addProduct(p); }
        changesMade = true;
    }

    const hasWomen = allProducts.some(p => p.category === 'Women');
    if (!hasWomen) {
        const womenProducts: Omit<Product, 'id'>[] = [
            {
                name: "Floral A-Line Dress", brand: "Femina", price: 1499, originalPrice: 2499, discount: 40, rating: 4.6, reviews: 540,
                images: ['https://picsum.photos/seed/womendress1/400/500', 'https://picsum.photos/seed/womendress2/400/500'],
                sizes: [{ name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: false }],
                details: ['Viscose Rayon', 'A-Line style', 'Floral print'],
                fit: 'Regular Fit', fabric: 'Viscose Rayon', category: 'Women', isCodAvailable: true, allowPhotoUpload: false, preorderAvailable: false,
                color: 'Red', pattern: 'Floral', idealFor: 'Women', sleeve: 'Sleeveless', closure: 'Zip', fabricCare: 'Hand wash', returnWindowDays: 7
            },
            {
                name: "High-Waist Trousers", brand: "Chic Wear", price: 1299, originalPrice: 1999, discount: 35, rating: 4.4, reviews: 410,
                images: ['https://picsum.photos/seed/womenpants1/400/500', 'https://picsum.photos/seed/womenpants2/400/500'],
                sizes: [{ name: '28', inStock: true }, { name: '30', inStock: true }, { name: '32', inStock: true }],
                details: ['Polyester Blend', 'High-waist fit', 'Comes with a belt'],
                fit: 'Regular Fit', fabric: 'Polyester', category: 'Women', isCodAvailable: false, allowPhotoUpload: false, preorderAvailable: false,
                color: 'Beige', pattern: 'Solid', idealFor: 'Women', sleeve: 'N/A', closure: 'Hook and Eye', fabricCare: 'Machine wash', returnWindowDays: 7
            }
        ];
        for (const p of womenProducts) { await this.productService.addProduct(p); }
        changesMade = true;
    }

    const hasCustomizeGift = allProducts.some(p => p.category === 'Customize Gift');
    if (!hasCustomizeGift) {
        const giftProducts: Omit<Product, 'id'>[] = [
            {
                name: 'Personalized Photo Mug', brand: 'GiftCo', price: 499, originalPrice: 799, discount: 37, rating: 4.8, reviews: 150,
                images: ['https://picsum.photos/seed/mug1/400/500', 'https://picsum.photos/seed/mug2/400/500'],
                sizes: [{ name: '11oz', inStock: true }],
                details: ['Ceramic photo mug', 'Upload your own photo', 'Dishwasher and microwave safe'],
                fit: 'Standard', fabric: 'Ceramic', category: 'Customize Gift', isCodAvailable: true, allowPhotoUpload: true, preorderAvailable: false,
                color: 'White', pattern: 'Custom', idealFor: 'Unisex', sleeve: 'N/A', closure: 'N/A', fabricCare: 'Hand wash recommended', returnWindowDays: 7
            },
            {
                name: 'Custom Printed T-Shirt', brand: 'StyleMe', price: 699, originalPrice: 999, discount: 30, rating: 4.6, reviews: 210,
                images: ['https://picsum.photos/seed/tshirt1/400/500', 'https://picsum.photos/seed/tshirt2/400/500'],
                sizes: [{ name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: false }],
                details: ['100% cotton t-shirt', 'High-quality print of your photo', 'Comfortable and durable'],
                fit: 'Regular Fit', fabric: 'Cotton', category: 'Customize Gift', isCodAvailable: true, allowPhotoUpload: true, preorderAvailable: false,
                color: 'Black', pattern: 'Custom', idealFor: 'Unisex', sleeve: 'Short Sleeve', closure: 'Pullover', fabricCare: 'Machine wash cold', returnWindowDays: 7
            }
        ];
        for (const p of giftProducts) { await this.productService.addProduct(p); }
        changesMade = true;
    }

    const hasElectronics = allProducts.some(p => p.category === 'Electronics');
    if (!hasElectronics) {
        const electronicProducts: Omit<Product, 'id'>[] = [
            {
                name: 'Wireless Bluetooth Earbuds', brand: 'SoundWave', price: 1999, originalPrice: 3999, discount: 50, rating: 4.5, reviews: 1250,
                images: ['https://picsum.photos/seed/buds1/400/500', 'https://picsum.photos/seed/buds2/400/500'],
                sizes: [{ name: 'One Size', inStock: true }],
                details: ['True Wireless Stereo earbuds', 'Up to 24 hours of playtime with charging case', 'IPX5 water-resistant'],
                fit: 'In-Ear', fabric: 'Plastic', category: 'Electronics', isCodAvailable: true, allowPhotoUpload: false, preorderAvailable: false,
                color: 'White', pattern: 'Solid', idealFor: 'Unisex', sleeve: 'N/A', closure: 'N/A', fabricCare: 'Wipe with dry cloth', returnWindowDays: 7
            },
            {
                name: 'Smartwatch Fitness Tracker', brand: 'FitTrack', price: 2499, originalPrice: 4999, discount: 50, rating: 4.7, reviews: 980,
                images: ['https://picsum.photos/seed/watch1/400/500', 'https://picsum.photos/seed/watch2/400/500'],
                sizes: [{ name: 'One Size', inStock: true }],
                details: ['1.8" AMOLED display', 'Heart rate and SpO2 monitoring', '100+ sports modes'],
                fit: 'Wrist', fabric: 'Silicone/Metal', category: 'Electronics', isCodAvailable: false, allowPhotoUpload: false, preorderAvailable: false,
                color: 'Black', pattern: 'Solid', idealFor: 'Unisex', sleeve: 'N/A', closure: 'Buckle', fabricCare: 'Wipe with dry cloth', returnWindowDays: 7
            }
        ];
        for (const p of electronicProducts) { await this.productService.addProduct(p); }
        changesMade = true;
    }

    if (changesMade) {
        this.showToast('Added sample products for new categories.');
    }
  }
  
  private async setupInitialBanners() {
    await this.productService.productsLoaded; 
    const allProducts = this.productService.getAllProducts();
    if (this.heroSlides().length === 0 && allProducts.length > 5) {
      console.log('No hero banners found. Creating default banners...');
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());

      const defaultBannersData: Omit<HeroSlide, 'id'>[] = [
        { img: 'https://picsum.photos/id/1018/1200/400', title: 'New Season Arrivals', subtitle: 'Check out the latest trends', productId: shuffled[0].id },
        { img: 'https://picsum.photos/id/1025/1200/400', title: 'Flat 50% Off', subtitle: 'On select styles', productId: shuffled[1].id },
        { img: 'https://picsum.photos/id/1040/1200/400', title: 'Customize Your Gifts', subtitle: 'Personalized presents for everyone', productId: shuffled[2].id },
        { img: 'https://picsum.photos/id/20/1200/400', title: 'Electronics Hub', subtitle: 'Gadgets you will love', productId: shuffled[3].id },
        { img: 'https://picsum.photos/id/30/1200/400', title: 'Work From Home Style', subtitle: 'Comfort meets fashion', productId: shuffled[4].id },
        { img: 'https://picsum.photos/id/40/1200/400', title: 'Weekend Vibes', subtitle: 'Get ready for your getaway', productId: shuffled[5].id }
      ];

      const batch = writeBatch(this.firestore.getDb());
      const newBannersForState: HeroSlide[] = [];

      defaultBannersData.forEach((bannerData, index) => {
        const newId = `banner_${Date.now()}_${index}`;
        const docRef = doc(this.firestore.getDb(), 'banners', newId);
        batch.set(docRef, bannerData);
        newBannersForState.push({ ...bannerData, id: newId });
      });
      
      try {
        await batch.commit();
        this.heroSlides.set(newBannersForState);
        this.showToast('Default banners have been configured.');
      } catch (error) {
        console.error('Failed to create default banners:', error);
      }
    }
  }

  setLanguage(code: string) {
    this.currentLanguage.set(code);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('crazyBasketLang', code);
    }
    this.showToast(`Language preference saved.`);
  }

  private createNewAppUserFromAuthUser(authUser: FirebaseUser): User {
    const newId = authUser.uid;
    const name = authUser.displayName || authUser.email!.split('@')[0];
    const newUser: User = {
        id: newId,
        name,
        email: authUser.email!,
        mobile: authUser.phoneNumber || '',
        isVerified: authUser.emailVerified,
        walletBalance: 0,
        isBlacklisted: false,
        userType: 'B2C',
        ipAddress: 'N/A', 
        deviceId: 'N/A',
        referralCode: name.toUpperCase().substring(0, 5) + Date.now().toString().slice(-4),
        photoUrl: authUser.photoURL || `https://picsum.photos/seed/${newId}/200/200`,
        wishlist: [],
        provider: authUser.providerData[0]?.providerId || 'unknown',
    };
    return newUser;
  }

  navigateTo(view: string, data?: { productId?: string; category?: string; searchQuery?: string, addressToEdit?: Address, productToEdit?: Product, orderItem?: { orderId: string, itemId: string } }) {
    if (!this.secondaryDataLoaded) {
      this.loadSecondaryData(); 
      this.secondaryDataLoaded = true;
    }
    
    if (this.protectedViews.has(view) && !this.isAuthenticated()) {
      this.lastNavigatedView.set(view);
      this.currentView.set('login');
      this.showToast('Please log in to continue');
      return;
    }
    if (view === 'admin' && !this.isAdmin()) {
      this.showToast('Access Denied: You are not an admin.');
      return;
    }
    this.lastNavigatedView.set(this.currentView());
    if (data?.productId) this.selectedProductId.set(data.productId);
    if (data?.addressToEdit) this.addressToEdit.set(data.addressToEdit); else this.addressToEdit.set(null);
    if (data?.productToEdit) this.productToEdit.set(data.productToEdit); else this.productToEdit.set(null);
    if (data?.orderItem) this.selectedOrderItemForReturn.set(data.orderItem); else this.selectedOrderItemForReturn.set(null);
    if (data?.category !== undefined) {
      this.selectedCategory.set(data.category);
      this.searchQuery.set('');
      this.resetFilters();
    }
    if (data?.searchQuery !== undefined) {
      this.selectedCategory.set(null);
      this.searchQuery.set(data.searchQuery);
    }
    this.currentView.set(view);
    this.closeSidebar();
  }
  
  navigateToAdminView(view: string) {
    this.productToEdit.set(null);
    this.currentAdminView.set(view);
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  closeSidebar() { this.isSidebarOpen.set(false); }

  async updateUser(updatedInfo: { name: string, mobile: string, photoUrl?: string }) {
    const currentUser = this.currentUser();
    if (!currentUser) { this.showToast('You must be logged in.'); return; }
    
    const updatedUser: User = { ...currentUser, ...updatedInfo };
    this.users.update(users => users.map(u => u.id === currentUser.id ? updatedUser : u));
    this.currentUser.set(updatedUser);

    try {
      await this.firestore.setDocument('users', currentUser.id, updatedInfo);
    } catch(e) { console.error(e); this.showToast('Failed to save profile.'); }
    
    this.showToast('Profile updated successfully!');
    this.navigateTo('profile');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        if(this.isImpersonating()) this.stopImpersonating();
        this.cartItems.set([]);
        this.showToast('You have been logged out.');
        this.navigateTo('home');
      }
    });
  }

  impersonateUser(userId: string) {
    const admin = this.currentUser();
    const targetUser = this.users().find(u => u.id === userId);
    if (this.isAdmin() && targetUser && admin) {
      this.originalAdmin.set(admin);
      this.currentUser.set(targetUser);
      this.navigateTo('home');
      this.showToast(`Now impersonating ${targetUser.name}`);
    } else {
      this.showToast('Impersonation failed.');
    }
  }

  stopImpersonating() {
    const admin = this.originalAdmin();
    if (admin) {
      this.currentUser.set(admin);
      this.originalAdmin.set(null);
      this.navigateTo('admin');
      this.showToast('Returned to admin view.');
    }
  }

  async toggleBlacklist(userId: string) {
    let isBlacklisted = false;
    this.users.update(users => users.map(u => {
      if (u.id === userId) {
        isBlacklisted = !u.isBlacklisted;
        return { ...u, isBlacklisted };
      }
      return u;
    }));
    try {
      await this.firestore.setDocument('users', userId, { isBlacklisted });
      const user = this.users().find(u => u.id === userId);
      this.showToast(isBlacklisted ? `User ${user!.name} blacklisted.` : `User ${user!.name} un-blacklisted.`);
    } catch(e) { console.error(e); this.showToast('Operation failed.'); }
  }

  async updateUserType(userId: string, type: 'B2C' | 'B2B') {
    this.users.update(users => users.map(u => u.id === userId ? { ...u, userType: type } : u));
    try {
      await this.firestore.setDocument('users', userId, { userType: type });
      this.showToast(`User type updated.`);
    } catch(e) { console.error(e); this.showToast('Update failed.'); }
  }

  async updateUserWallet(userId: string, amount: number, type: 'add' | 'subtract') {
    let newBalance = 0;
    this.users.update(users => users.map(user => {
      if (user.id === userId) {
        newBalance = type === 'add' ? user.walletBalance + amount : Math.max(0, user.walletBalance - amount);
        return { ...user, walletBalance: newBalance };
      }
      return user;
    }));
    if(this.currentUser()?.id === userId) {
      this.currentUser.update(u => u ? {...u, walletBalance: newBalance} : null);
    }
    try {
      await this.firestore.setDocument('users', userId, { walletBalance: newBalance });
      this.showToast(`Wallet updated for user.`);
    } catch(e) { console.error(e); this.showToast('Wallet update failed.'); }
  }

  async addTransaction(txData: Omit<Transaction, 'id'>) {
    const newTx: Transaction = { ...txData, id: `tx_${Date.now()}` };
    this.transactions.update(txs => [newTx, ...txs]);
    try {
      await this.firestore.setDocument('transactions', newTx.id, newTx);
    } catch(e) { console.error(e); }
  }
  
  toggleComparison(productId: string) {
    this.comparisonList.update(list => {
      const index = list.indexOf(productId);
      if (index > -1) {
        return list.filter(id => id !== productId);
      } else {
        if (list.length < 4) {
          return [...list, productId];
        } else {
          this.showToast('You can only compare up to 4 items at a time.');
          return list;
        }
      }
    });
  }

  clearComparison() {
    this.comparisonList.set([]);
  }

  trackProductView(productId: string) { this.addRecentlyViewed(productId); }
  addRecentlyViewed(productId: string) { this.recentlyViewed.update(current => [productId, ...current.filter(id => id !== productId)].slice(0, 5)); }
  addToCart(product: Product, size: string, customization?: { photoPreviewUrl: string; fileName: string; }) {
    const existingItem = this.cartItems().find(item => item.product.id === product.id && item.size === size && !item.customization);
    if (existingItem && !customization) {
      this.updateCartItemQuantity(product.id, size, existingItem.quantity + 1);
    } else {
      this.cartItems.update(items => [...items, { product, size, quantity: 1, customization }]);
    }
    this.showToast(`${product.name} added to bag!`);
  }
  removeFromCart
