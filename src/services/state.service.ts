
import { Injectable, signal, computed, inject, effect, WritableSignal } from '@angular/core';
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
import { doc, writeBatch } from 'firebase/firestore';

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

export interface HeroSlide {
  id: string;
  img: string;
  title: string;
  subtitle: string;
  productId?: string;
}

export interface ShippingSettings {
  flatRate: number;
  freeShippingThreshold: number;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private productService: ProductService = inject(ProductService);
  private authService: AuthService = inject(AuthService);
  private firestore: FirestoreService = inject(FirestoreService);
  
  private initialized: Promise<void>;
  private resolveInitialized!: () => void;

  constructor() {
    this.initialized = new Promise(resolve => this.resolveInitialized = resolve);
    this.init();
    
    // Setup from localStorage (for non-persistent data)
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
    
    // Effects for syncing auth and user data
    this.setupEffects();
  }

  public ensureInitialized(): Promise<void> {
    return this.initialized;
  }

  private async init() {
    // Wait for products to be ready before initializing orders that depend on them
    await this.productService.ensureInitialized();
    await this.loadAllData();
    this.resolveInitialized();
  }
  
  private async loadAllData() {
    // Load collections with fallback
    await this.loadCollection('users', this.users, this.getMockUsers);
    await this.loadCollection('addresses', this.allAddresses, this.getMockAddresses);
    await this.loadCollection('orders', this.orders, this.getMockOrders);
    await this.loadCollection('coupons', this.coupons, this.getMockCoupons);
    await this.loadCollection('popups', this.popups, this.getMockPopups);
    await this.loadCollection('heroSlides', this.heroSlides, this.getMockHeroSlides);
    await this.loadCollection('categories', this.categories, this.getMockCategories);
    await this.loadCollection('faqs', this.faqs, this.getMockFaqs);
    await this.loadCollection('reviews', this.userReviews, () => []);
    await this.loadCollection('transactions', this.transactions, () => []);
    
    // Load single doc settings with fallback
    await this.loadDoc('settings', 'shipping', this.shippingSettings, () => ({ flatRate: 40, freeShippingThreshold: 499 }));
    await this.loadDoc('settings', 'smallBanner', this.smallBanner, this.getMockSmallBanner);
    await this.loadDoc('settings', 'contactInfo', this.contactInfo, this.getMockContactInfo);
    
    try {
      const docId = 'homePageSections';
      const collection = 'settings';
      const mockFn = () => ({ value: ['categories', 'small-banner', 'slider', 'deals', 'trending'] });
      await this.firestore.seedDocument(collection, docId, mockFn());
      const doc = await this.firestore.getDocument<{ value: string[] }>(collection, docId);
      if (doc && doc.value) {
        this.homePageSections.set(doc.value);
        console.log(`Successfully loaded ${collection}/${docId} from Firestore.`);
      } else {
        throw new Error('Doc not found or value field missing after seeding');
      }
    } catch (e) {
      console.warn(`Firestore failed to load '${'settings'}/${'homePageSections'}'. Falling back to mocks.`, e);
      this.homePageSections.set(['categories', 'small-banner', 'slider', 'deals', 'trending']);
    }
  }
  
  private async loadCollection<T extends {id: string}>(name: string, signal: WritableSignal<T[]>, mockFn: () => T[]) {
    try {
      await this.firestore.seedCollection(name, mockFn());
      const data = await this.firestore.getCollection<T>(name);
      signal.set(data);
      console.log(`Successfully loaded ${name} from Firestore.`);
    } catch (e) {
      console.warn(`Firestore failed to load '${name}'. Falling back to mocks.`, e);
      signal.set(mockFn());
    }
  }

  private async loadDoc<T extends object>(collection: string, docId: string, signal: WritableSignal<T>, mockFn: () => T) {
    try {
        await this.firestore.seedDocument(collection, docId, mockFn());
        const doc = await this.firestore.getDocument<T>(collection, docId);
        if (doc) {
            signal.set(doc);
            console.log(`Successfully loaded ${collection}/${docId} from Firestore.`);
        } else {
             throw new Error('Doc not found after seeding');
        }
    } catch (e) {
        console.warn(`Firestore failed to load '${collection}/${docId}'. Falling back to mocks.`, e);
        signal.set(mockFn());
    }
  }

  // --- STATE SIGNALS (initialized empty, filled in init) ---
  users = signal<User[]>([]);
  currentUser = signal<User | null>(null);
  originalAdmin = signal<User | null>(null);
  orders = signal<Order[]>([]);
  allAddresses = signal<Address[]>([]);
  coupons = signal<Coupon[]>([]);
  popups = signal<Popup[]>([]);
  heroSlides = signal<HeroSlide[]>([]);
  categories = signal<Category[]>([]);
  faqs = signal<Faq[]>([]);
  userReviews = signal<Review[]>([]);
  transactions = signal<Transaction[]>([]);
  shippingSettings = signal<ShippingSettings>({ flatRate: 0, freeShippingThreshold: 0 });
  smallBanner = signal<HeroSlide>({} as HeroSlide);
  contactInfo = signal<any>({});
  homePageSections = signal<string[]>([]);
  
  // Local/Session State
  currentView = signal<string>('home');
  protectedViews = new Set(['profile', 'address', 'payment', 'orders', 'address-form', 'admin', 'profile-edit', 'outfitRecommender', 'manual-payment', 'admin-bulk-updater', 'admin-flash-sales', 'wallet', 'productComparison', 'wishlist', 'partner-program', 'coupons', 'return-request', 'manage-addresses']);
  lastNavigatedView = signal<string>('home');
  currentAdminView = signal<string>('dashboard');
  productToEdit = signal<Product | null>(null);
  isSidebarOpen = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  currentLanguage = signal<string>('en');
  selectedProductId = signal<string | null>(null);
  selectedCategory = signal<string | null>('Men');
  searchQuery = signal<string>('');
  activeFilters = signal<ActiveFilters>({ priceRanges: [], discounts: [] });
  sortOption = signal<string>('recommended');
  recentlyViewed = signal<string[]>([]);
  comparisonList = signal<string[]>([]);
  cartItems = signal<CartItem[]>([]);
  appliedCoupon = signal<Coupon | null>(null);
  selectedAddressId = signal<string | null>(null);
  addressToEdit = signal<Address | null>(null);
  selectedPaymentMethod = signal<string>('COD');
  latestOrderId = signal<string | null>(null);
  selectedOrderItemForReturn = signal<{ orderId: string, itemId: string } | null>(null);
  productViewCounts = signal<Map<string, Map<string, number>>>(new Map());

  // --- COMPUTED VALUES ---
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.authService.isAdmin() && !this.isImpersonating());
  isImpersonating = computed(() => !!this.originalAdmin());
  isB2B = computed(() => this.currentUser()?.userType === 'B2B');
  wishlist = computed(() => new Set(this.currentUser()?.wishlist || []));
  wishlistItemCount = computed(() => this.wishlist().size);
  activePopup = computed(() => this.popups().find(p => p.isActive));
  currentUserAddresses = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.allAddresses().filter(addr => addr.userId === user.id);
  });
  cartItemsWithPrices = computed(() => {
    const isB2B = this.isB2B();
    return this.cartItems().map(item => {
      const displayPrice = (isB2B && item.product.b2bPrice) ? item.product.b2bPrice : item.product.price;
      return { ...item, displayPrice };
    });
  });
  cartItemCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  cartSubtotal = computed(() => this.cartItemsWithPrices().reduce((acc, item) => acc + (item.displayPrice * item.quantity), 0));
  cartMRP = computed(() => this.cartItems().reduce((acc, item) => acc + (item.product.originalPrice * item.quantity), 0));
  cartDiscountOnMRP = computed(() => this.cartItemsWithPrices().reduce((acc, item) => acc + ((item.product.originalPrice - item.displayPrice) * item.quantity), 0));
  couponDiscount = computed(() => {
    const coupon = this.appliedCoupon();
    const subtotal = this.cartSubtotal();
    if (!coupon || subtotal === 0) return 0;
    if (coupon.type === 'flat') return Math.min(coupon.value, subtotal);
    else return Math.round((subtotal * coupon.value) / 100);
  });
  shippingCost = computed(() => {
    const subtotal = this.cartSubtotal();
    if (subtotal === 0) return 0;
    const settings = this.shippingSettings();
    return subtotal >= settings.freeShippingThreshold ? 0 : settings.flatRate;
  });
  cartTotal = computed(() => {
    const subtotal = this.cartSubtotal();
    if (subtotal === 0) return 0;
    return Math.max(0, subtotal - this.couponDiscount() + this.shippingCost());
  });
  isCodAvailableInCart = computed(() => this.cartItems().every(item => item.product.isCodAvailable));
  totalSales = computed(() => this.orders().reduce((acc, order) => acc + order.totalAmount, 0));
  pendingOrdersCount = computed(() => this.orders().filter(o => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Pending Verification').length);
  totalUsersCount = computed(() => this.users().length);
  
  // --- METHODS ---
  private setupEffects() {
     effect(() => {
      const authUser = this.authService.currentUser();
      if (authUser?.email) {
        let appUser: User | undefined;
        if (environment.adminEmails.includes(authUser.email)) {
          appUser = this.users().find(u => u.email === authUser.email);
        } else {
          appUser = this.users().find(u => u.id === authUser.uid);
        }
        if (!appUser) {
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
    };
    return newUser;
  }

  navigateTo(view: string, data?: { productId?: string; category?: string; searchQuery?: string, addressToEdit?: Address, productToEdit?: Product, orderItem?: { orderId: string, itemId: string } }) {
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
  
  // Cart, Wishlist, etc. (mostly local state)
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
  removeFromCart(productId: string, size: string) { this.cartItems.update(items => items.filter(item => !(item.product.id === productId && item.size === size))); }
  updateCartItemQuantity(productId: string, size: string, quantity: number) { if (quantity <= 0) { this.removeFromCart(productId, size); return; } this.cartItems.update(items => items.map(item => item.product.id === productId && item.size === size ? { ...item, quantity } : item )); }
  applyCoupon(code: string) {
    const coupon = this.coupons().find(c => c.code.toUpperCase() === code.toUpperCase() && new Date(c.expiryDate) >= new Date() && c.usedCount < c.maxUses);
    if (coupon) {
      this.appliedCoupon.set(coupon);
      this.showToast(`Coupon "${coupon.code}" applied!`);
    } else {
      this.appliedCoupon.set(null);
      this.showToast('Invalid or expired coupon code.');
    }
  }
  async toggleWishlist(productId: string) {
    const user = this.currentUser();
    if (!user) { this.showToast('Please log in.'); return; }
    
    const currentWishlist = user.wishlist || [];
    const newWishlist = currentWishlist.includes(productId) ? currentWishlist.filter(id => id !== productId) : [...currentWishlist, productId];
    
    this.currentUser.update(u => u ? { ...u, wishlist: newWishlist } : null);
    this.users.update(users => users.map(u => u.id === user.id ? { ...u, wishlist: newWishlist } : u));
    
    this.showToast(currentWishlist.includes(productId) ? 'Removed from wishlist.' : 'Added to wishlist.');
    
    try {
      await this.firestore.setDocument('users', user.id, { wishlist: newWishlist });
    } catch (e) { console.error('Failed to update wishlist in Firestore:', e); }
  }
  setSortOption(option: string) { this.sortOption.set(option); }
  setFilters(filters: ActiveFilters) { this.activeFilters.set(filters); }
  resetFilters() { this.activeFilters.set({ priceRanges: [], discounts: [] }); }
  toggleComparison(productId: string) { this.comparisonList.update(current => { const index = current.indexOf(productId); if (index > -1) { this.showToast('Removed from comparison.'); return current.filter(id => id !== productId); } else { if (current.length >= 4) { this.showToast('Max 4 items.'); return current; } this.showToast('Added to comparison.'); return [...current, productId]; } }); }
  clearComparison() { this.comparisonList.set([]); }
  
  // Address Methods (Async)
  async addAddress(address: Omit<Address, 'id' | 'isDefault' | 'userId'>) {
      const user = this.currentUser();
      if (!user) { this.showToast('You must be logged in.'); return; }
      
      const isFirstAddress = this.currentUserAddresses().length === 0;
      const newAddress: Address = { ...address, userId: user.id, id: `addr_${Date.now()}`, isDefault: isFirstAddress };
      
      this.allAddresses.update(addresses => [...addresses, newAddress]);
      this.showToast('Address added successfully!');

      try { await this.firestore.setDocument('addresses', newAddress.id, newAddress); } catch (e) { console.error(e); }

      this.navigateTo(this.lastNavigatedView() === 'manage-addresses' ? 'manage-addresses' : 'address');
  }
  async updateAddress(updatedAddress: Address) {
      this.allAddresses.update(addresses => addresses.map(a => a.id === updatedAddress.id ? updatedAddress : a));
      this.showToast('Address updated successfully!');
      try { await this.firestore.setDocument('addresses', updatedAddress.id, updatedAddress); } catch (e) { console.error(e); }
      this.navigateTo(this.lastNavigatedView() === 'manage-addresses' ? 'manage-addresses' : 'address');
  }
  async deleteAddress(addressId: string) {
      this.allAddresses.update(addresses => addresses.filter(a => a.id !== addressId));
      if (this.selectedAddressId() === addressId) { this.selectedAddressId.set(null); }
      this.showToast('Address deleted.');
      try { await this.firestore.deleteDocument('addresses', addressId); } catch (e) { console.error(e); }
  }
  async setDefaultAddress(addressId: string) {
    const userId = this.currentUser()?.id;
    if (!userId) return;
    
    const batch = writeBatch(this.firestore.getDb());
    this.allAddresses.update(addresses => 
      addresses.map(a => {
        if (a.userId === userId) {
          const isDefault = a.id === addressId;
          const docRef = doc(this.firestore.getDb(), 'addresses', a.id);
          batch.update(docRef, { isDefault });
          return { ...a, isDefault };
        }
        return a;
      })
    );
    try { await batch.commit(); this.showToast('Default address updated.'); } catch (e) { console.error(e); }
  }

  // Order & Review Methods (Async)
  async addReview(review: { productId: string, rating: number, comment: string }) {
    const author = this.currentUser()?.name || 'Anonymous';
    const newReview: Review = { ...review, author, date: new Date(), id: `rev_${Date.now()}` };
    this.userReviews.update(reviews => [...reviews, newReview]);
    this.showToast('Thank you for your review!');
    try { await this.firestore.setDocument('reviews', newReview.id, newReview); } catch(e) { console.error(e); }
  }
  async deleteReview(reviewToDelete: Review) {
    this.userReviews.update(reviews => reviews.filter(r => r.id !== reviewToDelete.id));
    this.showToast('Review deleted.');
    try { await this.firestore.deleteDocument('reviews', reviewToDelete.id); } catch(e) { console.error(e); }
  }
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    // ... logic for referral commission calculation
    this.orders.update(orders => orders.map(order => order.id === orderId ? { ...order, status } : order));
    this.showToast(`Order status updated to ${status}.`);
    try { await this.firestore.setDocument('orders', orderId, { status }); } catch(e) { console.error(e); }
  }
  async requestReturn(orderId: string, itemId: string, reason: string, comment: string, photoUrl?: string) {
    this.orders.update(orders => orders.map(order => {
        if (order.id === orderId) {
            const updatedItems = order.items.map(item => item.id === itemId ? { ...item, returnRequest: { reason, comment, photoUrl, status: 'Pending' as const } } : item);
            const updatedOrder = { ...order, items: updatedItems };
            this.firestore.setDocument('orders', orderId, updatedOrder).catch(console.error);
            return updatedOrder;
        }
        return order;
    }));
    this.showToast('Return requested successfully.');
    this.navigateTo('orders');
  }
  async updateReturnStatus(orderId: string, itemId: string, status: ReturnStatus) {
      let orderToUpdate: Order | undefined, itemToUpdate: OrderItem | undefined;
      this.orders.update(orders => orders.map(order => {
          if (order.id === orderId) {
              const updatedItems = order.items.map(item => {
                  if (item.id === itemId && item.returnRequest) {
                      itemToUpdate = item;
                      return { ...item, returnRequest: { ...item.returnRequest, status } };
                  }
                  return item;
              });
              orderToUpdate = { ...order, items: updatedItems };
              this.firestore.setDocument('orders', orderId, orderToUpdate).catch(console.error);
              return orderToUpdate;
          }
          return order;
      }));
      // ... refund logic ...
      this.showToast(`Return status updated to ${status}.`);
  }
  async placeOrder() {
    const currentUser = this.currentUser();
    const selectedAddress = this.allAddresses().find(a => a.id === this.selectedAddressId());
    if (!currentUser || !selectedAddress || this.cartItems().length === 0) {
      this.showToast('Cannot place order. User, address or cart is missing.');
      return;
    }
    
    // Create a deep plain copy of cart items to avoid circular references
    const plainCartItems = JSON.parse(JSON.stringify(this.cartItemsWithPrices()));

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      userId: currentUser.id,
      date: new Date(),
      items: plainCartItems.map((item: any, index: number) => ({
        id: `item_${Date.now()}_${index}`,
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        price: item.displayPrice,
        customization: item.customization,
      })),
      totalAmount: this.cartTotal(),
      shippingAddress: selectedAddress,
      paymentMethod: this.selectedPaymentMethod(),
      status: 'Confirmed'
    };

    // If paying with wallet, deduct balance
    if (this.selectedPaymentMethod() === 'Wallet') {
        if (currentUser.walletBalance < this.cartTotal()) {
            this.showToast('Insufficient wallet balance.');
            return;
        }
        this.updateUserWallet(currentUser.id, this.cartTotal(), 'subtract');
        this.addTransaction({
          userId: currentUser.id,
          date: new Date(),
          type: 'Debit',
          amount: this.cartTotal(),
          description: `Order #${newOrder.id}`
        });
    }

    this.orders.update(orders => [newOrder, ...orders]);
    this.latestOrderId.set(newOrder.id);
    
    try { 
      await this.firestore.setDocument('orders', newOrder.id, newOrder);
    } catch (e) { 
      console.error("Failed to place order in Firestore:", e);
      this.showToast('Order placed locally (Firestore connection failed).');
    }
    
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.navigateTo('orderConfirmation');
  }
  async placeManualUpiOrder(transactionId: string) {
    const currentUser = this.currentUser();
    const selectedAddress = this.allAddresses().find(a => a.id === this.selectedAddressId());
    if (!currentUser || !selectedAddress || this.cartItems().length === 0) {
      this.showToast('Cannot place order. User, address or cart is missing.');
      return;
    }

    const plainCartItems = JSON.parse(JSON.stringify(this.cartItemsWithPrices()));
    
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      userId: currentUser.id,
      date: new Date(),
      items: plainCartItems.map((item: any, index: number) => ({
        id: `item_${Date.now()}_${index}`,
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        price: item.displayPrice,
        customization: item.customization,
      })),
      totalAmount: this.cartTotal(),
      shippingAddress: selectedAddress,
      paymentMethod: 'UPI (Manual)',
      status: 'Pending Verification',
      transactionId: transactionId
    };

    this.orders.update(orders => [newOrder, ...orders]);
    this.latestOrderId.set(newOrder.id);
    
    try { 
      await this.firestore.setDocument('orders', newOrder.id, newOrder);
    } catch (e) { 
      console.error("Failed to place manual UPI order in Firestore:", e);
      this.showToast('Order placed locally (Firestore connection failed).');
    }
    
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.navigateTo('orderConfirmation');
  }
  
  // Admin Methods (Async)
  async updateShippingSettings(settings: ShippingSettings) {
    this.shippingSettings.set(settings);
    this.showToast('Shipping settings updated.');
    try { await this.firestore.setDocument('settings', 'shipping', settings); } catch(e) { console.error(e); }
  }
  async addCoupon(couponData: Omit<Coupon, 'id' | 'usedCount'>) {
    const newCoupon: Coupon = { ...couponData, id: `C${Date.now()}`, usedCount: 0 };
    this.coupons.update(coupons => [newCoupon, ...coupons]);
    this.showToast('Coupon added successfully.');
    try { await this.firestore.setDocument('coupons', newCoupon.id, newCoupon); } catch(e) { console.error(e); }
  }
  async deleteCoupon(couponId: string) {
    this.coupons.update(coupons => coupons.filter(c => c.id !== couponId));
    this.showToast('Coupon deleted.');
    try { await this.firestore.deleteDocument('coupons', couponId); } catch(e) { console.error(e); }
  }
  async updateHomePageSections(sections: string[]) {
    this.homePageSections.set(sections);
    this.showToast('Homepage layout updated.');
    try { await this.firestore.setDocument('settings', 'homePageSections', { value: sections }); } catch(e) { console.error(e); }
  }
  
  async addBanner(bannerData: Omit<HeroSlide, 'id'>) {
    const newBanner: HeroSlide = { ...bannerData, id: `banner_${Date.now()}` };
    this.heroSlides.update(banners => [...banners, newBanner]);
    this.showToast('Banner added successfully.');
    try {
        await this.firestore.setDocument('heroSlides', newBanner.id, newBanner);
    } catch(e) { console.error(e); }
  }

  async deleteBanner(index: number) {
      const bannerToDelete = this.heroSlides()[index];
      if (!bannerToDelete) return;

      this.heroSlides.update(banners => banners.filter((_, i) => i !== index));
      this.showToast('Banner deleted.');
      try {
          await this.firestore.deleteDocument('heroSlides', bannerToDelete.id);
      } catch(e) { console.error(e); }
  }

  async updateSmallBanner(banner: HeroSlide) {
      this.smallBanner.set(banner);
      this.showToast('Small banner updated.');
      try { await this.firestore.setDocument('settings', 'smallBanner', banner); } catch(e) { console.error(e); }
  }

  async addCategory(categoryData: Omit<Category, 'id'>) {
      const newCategory: Category = { ...categoryData, id: `cat_${Date.now()}` };
      this.categories.update(cats => [newCategory, ...cats]);
      this.showToast('Category added.');
      try { await this.firestore.setDocument('categories', newCategory.id, newCategory); } catch(e) { console.error(e); }
  }

  async updateCategory(updatedCategory: Category) {
      this.categories.update(cats => cats.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      this.showToast('Category updated.');
      try { await this.firestore.setDocument('categories', updatedCategory.id, updatedCategory); } catch(e) { console.error(e); }
  }

  async deleteCategory(categoryId: string) {
      this.categories.update(cats => cats.filter(c => c.id !== categoryId));
      this.showToast('Category deleted.');
      try { await this.firestore.deleteDocument('categories', categoryId); } catch(e) { console.error(e); }
  }

  async addPopup(popupData: Omit<Popup, 'id'>) {
      const newPopup: Popup = { ...popupData, id: `pop_${Date.now()}` };
      this.popups.update(popups => [newPopup, ...popups]);
      this.showToast('Popup added.');
      try { await this.firestore.setDocument('popups', newPopup.id, newPopup); } catch(e) { console.error(e); }
  }

  async updatePopup(updatedPopup: Popup) {
      this.popups.update(popups => popups.map(p => p.id === updatedPopup.id ? updatedPopup : p));
      this.showToast('Popup updated.');
      try { await this.firestore.setDocument('popups', updatedPopup.id, updatedPopup); } catch(e) { console.error(e); }
  }

  async deletePopup(popupId: string) {
      this.popups.update(popups => popups.filter(p => p.id !== popupId));
      this.showToast('Popup deleted.');
      try { await this.firestore.deleteDocument('popups', popupId); } catch(e) { console.error(e); }
  }

  async updateContactInfo(info: { address: string; email: string; phone: string; upiId: string; qrCodeImage: string; }) {
      this.contactInfo.set(info);
      this.showToast('Contact info updated.');
      try { await this.firestore.setDocument('settings', 'contactInfo', info); } catch(e) { console.error(e); }
  }

  async addFaq(faqData: { question: string, answer: string }) {
      const newFaq: Faq = { ...faqData, id: `faq_${Date.now()}` };
      this.faqs.update(faqs => [newFaq, ...faqs]);
      this.showToast('FAQ added.');
      try { await this.firestore.setDocument('faqs', newFaq.id, newFaq); } catch(e) { console.error(e); }
  }

  async updateFaq(updatedFaq: Faq) {
      this.faqs.update(faqs => faqs.map(f => f.id === updatedFaq.id ? updatedFaq : f));
      this.showToast('FAQ updated.');
      try { await this.firestore.setDocument('faqs', updatedFaq.id, updatedFaq); } catch(e) { console.error(e); }
  }

  async deleteFaq(faqId: string) {
      this.faqs.update(faqs => faqs.filter(f => f.id !== faqId));
      this.showToast('FAQ deleted.');
      try { await this.firestore.deleteDocument('faqs', faqId); } catch(e) { console.error(e); }
  }

  // --- MOCK DATA GETTERS (for fallback) ---
  private getMockUsers = (): User[] => [
    { id: '1', name: 'Admin User', email: 'admin@crazybasket.com', mobile: '8279458045', isVerified: true, walletBalance: 1000, isBlacklisted: false, userType: 'B2C', ipAddress: '127.0.0.1', deviceId: 'DEV_ADMIN', referralCode: 'ADMIN', photoUrl: 'https://picsum.photos/seed/admin/200/200', wishlist: [] },
    { id: '2', name: 'John Doe', email: 'user@example.com', mobile: '9876543210', isVerified: true, walletBalance: 250, isBlacklisted: false, userType: 'B2C', ipAddress: '192.168.1.10', deviceId: 'DEV_JOHN', referralCode: 'JOHN', photoUrl: 'https://picsum.photos/seed/john/200/200', wishlist: ['5', '8'] },
  ];
  private getMockAddresses = (): Address[] => [
      { id: 'addr1', userId: '2', name: 'John Doe', mobile: '9876543210', pincode: '560001', locality: 'MG Road', address: '123, Commerce House, Cunningham Road', city: 'Bengaluru', state: 'Karnataka', isDefault: true },
      { id: 'addr2', userId: '3', name: 'Jane Smith', mobile: '1234567890', pincode: '110001', locality: 'Connaught Place', address: '45, Regal Building', city: 'New Delhi', state: 'Delhi', isDefault: false }
  ];
  private getMockCoupons = (): Coupon[] => [
      { id: 'C1', code: 'SALE100', type: 'flat', value: 100, expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), maxUses: 50, usedCount: 12 },
  ];
  private getMockOrders = (): Order[] => {
    // This is dependent on products, which are now loaded async.
    // So we ensure products are loaded before calling this.
    const allProducts = this.productService.getAllProducts();
    if (allProducts.length === 0) return [];
    // ... full mock order generation logic
    return []; // Simplified for brevity
  };
  private getMockPopups = (): Popup[] => [
    { id: 'pop1', title: 'Monsoon Madness Sale!', imageUrl: 'https://picsum.photos/id/1015/400/200', link: 'productList', isActive: true },
    { id: 'pop2', title: 'New Arrivals for Kids', imageUrl: 'https://picsum.photos/id/103/400/200', link: 'productList', isActive: false }
  ];
  private getMockHeroSlides = (): HeroSlide[] => [
     { id: 'slide1', img: 'https://picsum.photos/id/1015/1200/400', title: 'Biggest Fashion Sale', subtitle: 'UP TO 70% OFF', productId: '1' },
  ];
  private getMockSmallBanner = (): HeroSlide => ({ id: 'small_banner_1', img: 'https://picsum.photos/id/10/1200/200', title: 'Default Small Banner', subtitle: '', productId: '1' });
  private getMockCategories = (): Category[] => [
    { id: 'cat1', name: 'Men', img: 'https://picsum.photos/id/1025/200/200', bgColor: 'bg-blue-100' },
    { id: 'cat2', name: 'Women', img: 'https://picsum.photos/id/1027/200/200', bgColor: 'bg-pink-100' },
  ];
  private getMockContactInfo = () => ({
    address: '123 Fashion Ave, Style City, 560001',
    email: 'support@crazybasket.com',
    phone: '+91 98765 43210',
    upiId: 'yourname@oksbi',
    qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=yourname@oksbi%26pn=Crazy%20Basket'
  });
  private getMockFaqs = (): Faq[] => [
    { id: 'faq1', question: 'What is your return policy?', answer: 'You can return any item within 30 days of purchase.' },
  ];
}
