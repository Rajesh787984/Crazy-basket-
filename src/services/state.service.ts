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

// ✅ FIXED: Interface definition to handle new return fields
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
        const
        
