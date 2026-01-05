
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { Order, OrderItem, OrderStatus } from '../models/order.model';
import { Review } from '../models/review.model';
import { Category } from '../models/category.model';
import { ProductService } from './product.service';
import { Faq } from '../models/faq.model';
import { Popup } from '../models/popup.model';
import { Transaction } from '../models/transaction.model';
import { Coupon } from '../models/coupon.model';
import { AuthService, MockAuthUser } from './auth.service';

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
  
  constructor() {
    // This effect syncs the application's user state with the mock auth service's state.
    effect(() => {
      const authUser = this.authService.currentUser();
      if (authUser) {
        // When a user logs in, find their profile in our app's user list.
        let appUser = this.users().find(u => u.email === authUser.email);
        if (!appUser) {
          // If it's a new user (e.g., first-time sign-in), create a profile for them.
          appUser = this.createNewAppUserFromAuthUser(authUser);
          this.users.update(users => [...users, appUser!]);
        }
        this.currentUser.set(appUser);
      } else {
        // When the auth user is null, log them out of the app state.
        this.currentUser.set(null);
      }
    });
  }

  // --- STATE ---

  // Authentication & Users
  users = signal<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@crazybasket.com', mobile: '8279458045', password: 'password', isVerified: true, walletBalance: 1000, isBlacklisted: false, userType: 'B2C', ipAddress: '127.0.0.1', deviceId: 'DEV_ADMIN', referralCode: 'ADMIN', photoUrl: 'https://picsum.photos/seed/admin/200/200' },
    { id: '2', name: 'John Doe', email: 'user@example.com', mobile: '9876543210', password: 'password', isVerified: true, walletBalance: 250, isBlacklisted: false, userType: 'B2C', ipAddress: '192.168.1.10', deviceId: 'DEV_JOHN', referralCode: 'JOHN', photoUrl: 'https://picsum.photos/seed/john/200/200' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com', mobile: '1234567890', password: 'password', isVerified: true, walletBalance: 0, isBlacklisted: false, userType: 'B2B', ipAddress: '192.168.1.10', deviceId: 'DEV_JANE', referredBy: '2', referralCode: 'JANE', photoUrl: 'https://picsum.photos/seed/jane/200/200' },
    { id: '4', name: 'Peter Jones', email: 'peter@example.com', mobile: '1122334455', password: 'password', isVerified: true, walletBalance: 50, isBlacklisted: false, userType: 'B2C', ipAddress: '203.0.113.45', deviceId: 'DEV_PETER', referredBy: '2', referralCode: 'PETER', photoUrl: 'https://picsum.photos/seed/peter/200/200' }
  ]);
  currentUser = signal<User | null>(null);
  originalAdmin = signal<User | null>(null); // For impersonation
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.email === 'admin@crazybasket.com' && !this.isImpersonating());
  isImpersonating = computed(() => !!this.originalAdmin());
  isB2B = computed(() => this.currentUser()?.userType === 'B2B');
  
  // Navigation
  currentView = signal<string>('home');
  protectedViews = new Set(['profile', 'address', 'payment', 'orders', 'address-form', 'admin', 'profile-edit', 'outfitRecommender', 'manual-payment', 'admin-bulk-updater', 'admin-flash-sales', 'wallet', 'productComparison', 'wishlist', 'partner-program']);
  lastNavigatedView = signal<string>('home');

  // Admin Panel Navigation
  currentAdminView = signal<string>('dashboard');
  productToEdit = signal<Product | null>(null);

  // UI
  isSidebarOpen = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  
  // Catalog
  selectedProductId = signal<string | null>(null);
  selectedCategory = signal<string | null>('Men');
  searchQuery = signal<string>('');
  activeFilters = signal<ActiveFilters>({ priceRanges: [], discounts: [] });
  sortOption = signal<string>('recommended');
  recentlyViewed = signal<string[]>([]);
  comparisonList = signal<string[]>([]);

  // Cart, Coupons & Shipping
  cartItems = signal<CartItem[]>([]);
  wishlist = signal<Set<string>>(new Set(['5', '8']));
  appliedCoupon = signal<Coupon | null>(null);
  coupons = signal<Coupon[]>(this.getMockCoupons());
  shippingSettings = signal<ShippingSettings>({ flatRate: 40, freeShippingThreshold: 499 });

  // Checkout
  userAddresses = signal<Address[]>(this.getMockAddresses());
  selectedAddressId = signal<string | null>(this.getMockAddresses().find(a => a.isDefault)?.id || null);
  addressToEdit = signal<Address | null>(null);
  selectedPaymentMethod = signal<string>('COD');
  
  // Orders & Reviews
  orders = signal<Order[]>([]);
  latestOrderId = signal<string | null>(null);
  userReviews = signal<Review[]>([]);
  transactions = signal<Transaction[]>([]);

  // Behavioral Tracking
  productViewCounts = signal<Map<string, Map<string, number>>>(new Map()); // userId -> <productId, count>

  // Content Management
  homePageSections = signal<string[]>(['categories', 'small-banner', 'slider', 'deals', 'trending']);
  popups = signal<Popup[]>([
    { id: 'pop1', title: 'Monsoon Madness Sale!', imageUrl: 'https://picsum.photos/id/1015/400/200', link: 'productList', isActive: true },
    { id: 'pop2', title: 'New Arrivals for Kids', imageUrl: 'https://picsum.photos/id/103/400/200', link: 'productList', isActive: false }
  ]);
  
  heroSlides = signal<HeroSlide[]>([
    { img: 'https://picsum.photos/id/1015/1200/400', title: 'Biggest Fashion Sale', subtitle: 'UP TO 70% OFF', productId: '1' },
    { img: 'https://picsum.photos/id/1016/1200/400', title: 'New Arrivals', subtitle: 'FRESH & TRENDY' },
    { img: 'https://picsum.photos/id/1018/1200/400', title: 'Winter Collection', subtitle: 'STAY WARM & STYLISH', productId: '13' },
    { img: 'https://picsum.photos/id/1025/1200/400', title: 'Kids Wear Special', subtitle: 'FUN & COMFY' },
    { img: 'https://picsum.photos/id/1043/1200/400', title: 'Ethnic Wear Fiesta', subtitle: 'TRADITIONAL VIBES', productId: '14' },
    { img: 'https://picsum.photos/id/1050/1200/400', title: 'Footwear Frenzy', subtitle: 'STARTING AT ₹499' }
  ]);
  
  smallBanner = signal<HeroSlide>({
    img: 'https://picsum.photos/id/10/1200/200',
    title: 'Default Small Banner',
    subtitle: '',
    productId: '1'
  });

  categories = signal<Category[]>([
    { id: 'cat1', name: 'Men', img: 'https://picsum.photos/id/1025/200/200', bgColor: 'bg-blue-100' },
    { id: 'cat2', name: 'Women', img: 'https://picsum.photos/id/1027/200/200', bgColor: 'bg-pink-100' },
    { id: 'cat3', name: 'Kids', img: 'https://picsum.photos/id/103/200/200', bgColor: 'bg-yellow-100' },
    { id: 'cat4', name: 'Home & Living', img: 'https://picsum.photos/id/1061/200/200', bgColor: 'bg-green-100' },
    { id: 'cat5', name: 'Beauty', img: 'https://picsum.photos/id/1074/200/200', bgColor: 'bg-purple-100' }
  ]);
  
  contactInfo = signal({
    address: '123 Fashion Ave, Style City, 560001',
    email: 'support@crazybasket.com',
    phone: '+91 98765 43210',
    upiId: 'yourname@oksbi',
    qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=yourname@oksbi%26pn=Crazy%20Basket'
  });

  faqs = signal<Faq[]>([
    { id: 'faq1', question: 'What is your return policy?', answer: 'You can return any item within 30 days of purchase for a full refund. The item must be unused and in its original packaging.' },
    { id: 'faq2', question: 'How do I track my order?', answer: 'Once your order is shipped, you will receive an email with a tracking number. You can use this number on our shipping partner\'s website to track your order.' },
    { id: 'faq3', question: 'Do you offer international shipping?', answer: 'Currently, we only ship within India. We are working on expanding our services to other countries in the future.' }
  ]);


  // --- COMPUTED VALUES ---
  activePopup = computed(() => this.popups().find(p => p.isActive));

  cartItemsWithPrices = computed(() => {
    const isB2B = this.isB2B();
    return this.cartItems().map(item => {
      const displayPrice = (isB2B && item.product.b2bPrice) ? item.product.b2bPrice : item.product.price;
      return { ...item, displayPrice };
    });
  });
  
  cartItemCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  wishlistItemCount = computed(() => this.wishlist().size);
  
  cartSubtotal = computed(() => this.cartItemsWithPrices().reduce((acc, item) => acc + (item.displayPrice * item.quantity), 0));
  cartMRP = computed(() => this.cartItems().reduce((acc, item) => acc + (item.product.originalPrice * item.quantity), 0));
  cartDiscountOnMRP = computed(() => this.cartItemsWithPrices().reduce((acc, item) => acc + ((item.product.originalPrice - item.displayPrice) * item.quantity), 0));
  
  couponDiscount = computed(() => {
    const coupon = this.appliedCoupon();
    const subtotal = this.cartSubtotal();
    if (!coupon || subtotal === 0) return 0;
    
    if (coupon.type === 'flat') {
      return Math.min(coupon.value, subtotal); // Cannot get more discount than cart value
    } else { // percent
      return Math.round((subtotal * coupon.value) / 100);
    }
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

  // Admin Dashboard Computed
  totalSales = computed(() => this.orders().reduce((acc, order) => acc + order.totalAmount, 0));
  pendingOrdersCount = computed(() => this.orders().filter(o => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Pending Verification').length);
  totalUsersCount = computed(() => this.users().length);

  // --- METHODS ---

  private createNewAppUserFromAuthUser(authUser: MockAuthUser): User {
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
        photoUrl: authUser.photoURL || `https://picsum.photos/seed/${newId}/200/200`
    };
    return newUser;
  }

  navigateTo(view: string, data?: { productId?: string; category?: string; searchQuery?: string, addressToEdit?: Address, productToEdit?: Product }) {
    if (view === 'admin' && !this.isAdmin()) {
      this.showToast('Access Denied: You are not an admin.');
      return;
    }
    if (this.protectedViews.has(view) && !this.isAuthenticated()) {
      this.lastNavigatedView.set(view);
      this.currentView.set('login');
      this.showToast('Please log in to continue');
      return;
    }
    
    this.lastNavigatedView.set(this.currentView());
    
    if (data?.productId) this.selectedProductId.set(data.productId);
    if (data?.addressToEdit) this.addressToEdit.set(data.addressToEdit); else this.addressToEdit.set(null);
    if (data?.productToEdit) this.productToEdit.set(data.productToEdit); else this.productToEdit.set(null);
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
    this.productToEdit.set(null); // Reset product to edit when changing admin views
    this.currentAdminView.set(view);
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  updateUser(updatedInfo: { name: string, mobile: string, photoUrl?: string }) {
    const currentUser = this.currentUser();
    if (!currentUser) {
      this.showToast('You must be logged in to update your profile.');
      return;
    }
    const updatedUser: User = { ...currentUser, ...updatedInfo };
    this.users.update(users => users.map(u => u.id === currentUser.id ? updatedUser : u));
    this.currentUser.set(updatedUser);
    this.showToast('Profile updated successfully!');
    this.navigateTo('profile');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        if(this.isImpersonating()) {
          this.stopImpersonating(); // Clean up impersonation on logout
        }
        this.cartItems.set([]);
        this.orders.set([]);
        this.showToast('You have been logged out.');
        this.navigateTo('home');
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.showToast('Logout failed. Please try again.');
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

  toggleBlacklist(userId: string) {
    this.users.update(users => users.map(u => u.id === userId ? { ...u, isBlacklisted: !u.isBlacklisted } : u));
    const user = this.users().find(u => u.id === userId);
    this.showToast(user!.isBlacklisted ? `User ${user!.name} has been blacklisted.` : `User ${user!.name} has been un-blacklisted.`);
  }

  updateUserType(userId: string, type: 'B2C' | 'B2B') {
    this.users.update(users => users.map(u => u.id === userId ? { ...u, userType: type } : u));
    this.showToast(`User type updated.`);
  }

  updateUserWallet(userId: string, amount: number, type: 'add' | 'subtract') {
    this.users.update(users => users.map(user => {
      if (user.id === userId) {
        const newBalance = type === 'add'
          ? user.walletBalance + amount
          : Math.max(0, user.walletBalance - amount);
        return { ...user, walletBalance: newBalance };
      }
      return user;
    }));
    // Also update current user if they are the one being updated
    if(this.currentUser()?.id === userId) {
      this.currentUser.update(u => u ? {...u, walletBalance: type === 'add' ? u.walletBalance + amount : Math.max(0, u.walletBalance - amount)} : null);
    }
    this.showToast(`Wallet updated for user.`);
  }

  addTransaction(txData: Omit<Transaction, 'id'>) {
      this.transactions.update(txs => [txData, ...txs]);
  }

  // Tracking
  trackProductView(productId: string) {
    this.addRecentlyViewed(productId);
    const user = this.currentUser();
    if (!user) return;

    this.productViewCounts.update(allViews => {
      const userViews = allViews.get(user.id) || new Map<string, number>();
      const currentCount = userViews.get(productId) || 0;
      userViews.set(productId, currentCount + 1);
      allViews.set(user.id, userViews);
      return new Map(allViews);
    });
  }

  addRecentlyViewed(productId: string) {
    this.recentlyViewed.update(current => {
      const newRecentlyViewed = [productId, ...current.filter(id => id !== productId)];
      return newRecentlyViewed.slice(0, 5);
    });
  }

  // Cart Methods
  addToCart(product: Product, size: string, customization?: { photoPreviewUrl: string; fileName: string; }) {
    const existingItem = this.cartItems().find(item => item.product.id === product.id && item.size === size && !item.customization);
    if (existingItem && !customization) {
      this.updateCartItemQuantity(product.id, size, existingItem.quantity + 1);
    } else {
      this.cartItems.update(items => [...items, { product, size, quantity: 1, customization }]);
    }
    this.showToast(`${product.name} added to bag!`);
  }

  removeFromCart(productId: string, size: string) {
    const itemToRemove = this.cartItems().find(item => item.product.id === productId && item.size === size);
    this.cartItems.update(items => items.filter(item => !(item.product.id === productId && item.size === size)));
    if (itemToRemove) {
      this.showToast(`${itemToRemove.product.name} removed from bag.`);
    }
  }

  updateCartItemQuantity(productId: string, size: string, quantity: number) { if (quantity <= 0) { this.removeFromCart(productId, size); return; } this.cartItems.update(items => items.map(item => item.product.id === productId && item.size === size ? { ...item, quantity } : item )); }
  
  applyCoupon(code: string) {
    const coupon = this.coupons().find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
      this.appliedCoupon.set(null);
      this.showToast('Invalid coupon code.');
      return;
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      this.appliedCoupon.set(null);
      this.showToast('This coupon has expired.');
      return;
    }
    if (coupon.usedCount >= coupon.maxUses) {
      this.appliedCoupon.set(null);
      this.showToast('This coupon has reached its usage limit.');
      return;
    }
    
    this.appliedCoupon.set(coupon);
    this.showToast(`Coupon "${coupon.code}" applied successfully!`);
  }

  toggleWishlist(productId: string) {
    this.wishlist.update(current => {
        if (current.has(productId)) {
            current.delete(productId);
            this.showToast('Removed from wishlist.');
        } else {
            current.add(productId);
            this.showToast('Added to wishlist.');
        }
        return new Set(current);
    });
  }

  // Filter & Sort Methods
  setSortOption(option: string) { this.sortOption.set(option); }
  setFilters(filters: ActiveFilters) { this.activeFilters.set(filters); }
  resetFilters() { this.activeFilters.set({ priceRanges: [], discounts: [] }); }

  // Comparison Methods
  toggleComparison(productId: string) {
    this.comparisonList.update(current => {
      const index = current.indexOf(productId);
      if (index > -1) {
        this.showToast('Removed from comparison.');
        return current.filter(id => id !== productId);
      } else {
        if (current.length >= 4) {
          this.showToast('You can compare a maximum of 4 items.');
          return current;
        }
        this.showToast('Added to comparison.');
        return [...current, productId];
      }
    });
  }
  clearComparison() { this.comparisonList.set([]); }

  // Address Methods
  addAddress(address: Omit<Address, 'id' | 'isDefault'>) {
      const newAddress: Address = { ...address, id: `addr_${Date.now()}`, isDefault: false };
      this.userAddresses.update(addresses => [...addresses, newAddress]);
      this.showToast('Address added successfully!');
      this.navigateTo('address');
  }
  updateAddress(updatedAddress: Address) {
      this.userAddresses.update(addresses => addresses.map(a => a.id === updatedAddress.id ? updatedAddress : a));
      this.showToast('Address updated successfully!');
      this.navigateTo('address');
  }
  deleteAddress(addressId: string) {
      this.userAddresses.update(addresses => addresses.filter(a => a.id !== addressId));
      if (this.selectedAddressId() === addressId) { this.selectedAddressId.set(null); }
      this.showToast('Address deleted.');
  }

  // Order & Review Methods
  addReview(review: { productId: string, rating: number, comment: string }) {
    const author = this.currentUser()?.name || 'Anonymous';
    const newReview: Review = { ...review, author, date: new Date() };
    this.userReviews.update(reviews => [...reviews, newReview]);
    this.showToast('Thank you for your review!');
  }

  deleteReview(reviewToDelete: Review) {
    this.userReviews.update(reviews => reviews.filter(r => r !== reviewToDelete));
    this.showToast('Review deleted.');
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    let commissionCredited = false;
    let commissionDetails: any = {};
    const originalOrders = this.orders();

    const updatedOrders = originalOrders.map(order => {
        if (order.id === orderId && order.status !== 'Delivered' && status === 'Delivered') {
            const customer = this.users().find(u => u.id === order.userId);
            if (customer && customer.referredBy) {
                const referrer = this.users().find(u => u.id === customer.referredBy);
                if (referrer) {
                    const isFirstDeliveredOrder = !originalOrders.some(o => o.userId === customer.id && o.id !== orderId && o.status === 'Delivered');
                    const commissionRate = isFirstDeliveredOrder ? 0.10 : 0.05;
                    const commissionAmount = Math.round(order.totalAmount * commissionRate);
                    commissionDetails = { referrer, customer, order, commissionAmount };
                    commissionCredited = true;
                }
            }
        }
        return order.id === orderId ? { ...order, status } : order;
    });

    this.orders.set(updatedOrders);

    if (commissionCredited) {
        const { referrer, customer, order, commissionAmount } = commissionDetails;
        this.updateUserWallet(referrer.id, commissionAmount, 'add');
        this.addTransaction({
            userId: referrer.id,
            type: 'Credit',
            amount: commissionAmount,
            description: `Referral commission from ${customer.name}'s order #${order.id.slice(-6)}`,
            date: new Date()
        });
        this.showToast(`Credited ₹${commissionAmount} to ${referrer.name} for referral.`);
    } else {
        this.showToast(`Order #${orderId} status updated to ${status}.`);
    }
  }

  placeOrder() {
    const address = this.userAddresses().find(a => a.id === this.selectedAddressId());
    const user = this.currentUser();
    if (!address) { this.showToast('Please select a shipping address.'); return; }
    if (!user) { this.showToast('You must be logged in to place an order.'); return; }
    const paymentMethod = this.selectedPaymentMethod();
    const total = this.cartTotal();
    if (paymentMethod === 'Wallet' && user.walletBalance < total) {
      this.showToast('Insufficient wallet balance.'); return;
    }
    const orderId = `CB${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      date: new Date(),
      items: this.cartItemsWithPrices().map((item, index) => ({
        id: `${orderId}_${index}`, product: item.product, size: item.size, quantity: item.quantity, price: item.displayPrice
      })),
      totalAmount: total, shippingAddress: address, paymentMethod: paymentMethod, status: 'Confirmed',
    };
    if (paymentMethod === 'Wallet') {
      this.updateUserWallet(user.id, total, 'subtract');
      this.addTransaction({ userId: user.id, type: 'Debit', amount: total, description: `Paid for Order #${orderId.slice(-6)}`, date: new Date() });
    }
    const applied = this.appliedCoupon();
    if (applied) {
      this.coupons.update(coupons => coupons.map(c => c.id === applied.id ? { ...c, usedCount: c.usedCount + 1 } : c));
    }
    this.orders.update(orders => [newOrder, ...orders]);
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.latestOrderId.set(orderId);
    this.navigateTo('orderConfirmation');
  }

  placeManualUpiOrder(transactionId: string) {
    const address = this.userAddresses().find(a => a.id === this.selectedAddressId());
    const user = this.currentUser();
    if (!address) { this.showToast('Please select a shipping address.'); return; }
    if (!user) { this.showToast('You must be logged in to place an order.'); return; }
    const orderId = `CB${Date.now()}`;
    const newOrder: Order = {
      id: orderId, userId: user.id, date: new Date(),
      items: this.cartItemsWithPrices().map((item, index) => ({
        id: `${orderId}_${index}`, product: item.product, size: item.size, quantity: item.quantity, price: item.displayPrice
      })),
      totalAmount: this.cartTotal(), shippingAddress: address, paymentMethod: 'UPI (Manual)', status: 'Pending Verification', transactionId: transactionId,
    };
    const applied = this.appliedCoupon();
    if (applied) {
      this.coupons.update(coupons => coupons.map(c => c.id === applied.id ? { ...c, usedCount: c.usedCount + 1 } : c));
    }
    this.orders.update(orders => [newOrder, ...orders]);
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.latestOrderId.set(orderId);
    this.navigateTo('orderConfirmation');
  }

  // --- Admin Content Methods ---
  updateShippingSettings(settings: ShippingSettings) {
    this.shippingSettings.set(settings);
    this.showToast('Shipping settings updated.');
  }

  addCoupon(couponData: Omit<Coupon, 'id' | 'usedCount'>) {
    const newCoupon: Coupon = { ...couponData, id: `C${Date.now()}`, usedCount: 0 };
    this.coupons.update(coupons => [newCoupon, ...coupons]);
    this.showToast('Coupon added successfully.');
  }

  deleteCoupon(couponId: string) {
    this.coupons.update(coupons => coupons.filter(c => c.id !== couponId));
    this.showToast('Coupon deleted.');
  }

  updateHomePageSections(sections: string[]) { this.homePageSections.set(sections); this.showToast('Homepage layout updated.'); }
  addPopup(popup: Omit<Popup, 'id'>) {
    const newPopup: Popup = { ...popup, id: `pop_${Date.now()}` };
    if (newPopup.isActive) { this.popups.update(popups => popups.map(p => ({...p, isActive: false}))); }
    this.popups.update(popups => [...popups, newPopup]); this.showToast('Popup added.');
  }
  updatePopup(updatedPopup: Popup) {
    if (updatedPopup.isActive) { this.popups.update(popups => popups.map(p => ({...p, isActive: false}))); }
    this.popups.update(popups => popups.map(p => p.id === updatedPopup.id ? updatedPopup : p)); this.showToast('Popup updated.');
  }
  deletePopup(popupId: string) { this.popups.update(popups => popups.filter(p => p.id !== popupId)); this.showToast('Popup deleted.'); }
  addBanner(banner: Omit<HeroSlide, 'id'>) { this.heroSlides.update(slides => [...slides, banner]); this.showToast('Banner added successfully!'); }
  updateSmallBanner(banner: HeroSlide) { this.smallBanner.set(banner); this.showToast('Small banner updated successfully!'); }
  deleteBanner(index: number) { this.heroSlides.update(slides => { const newSlides = [...slides]; newSlides.splice(index, 1); return newSlides; }); this.showToast('Banner deleted successfully!'); }
  addCategory(category: Omit<Category, 'id'>) { const newCategory: Category = { ...category, id: `cat_${Date.now()}`}; this.categories.update(cats => [...cats, newCategory]); this.showToast('Category added.'); }
  updateCategory(updatedCategory: Category) {
    const oldCategory = this.categories().find(c => c.id === updatedCategory.id);
    if (oldCategory && oldCategory.name !== updatedCategory.name) { this.productService.updateCategoryName(oldCategory.name, updatedCategory.name); }
    this.categories.update(cats => cats.map(c => c.id === updatedCategory.id ? updatedCategory : c)); this.showToast('Category updated.');
  }
  deleteCategory(categoryId: string) { this.categories.update(cats => cats.filter(c => c.id !== categoryId)); this.showToast('Category deleted.'); }
  updateContactInfo(newInfo: { address: string; email: string; phone: string; upiId: string; qrCodeImage: string; }) { this.contactInfo.set(newInfo); this.showToast('Contact information updated.'); }
  addFaq(faq: { question: string; answer: string; }) { const newFaq: Faq = { ...faq, id: `faq_${Date.now()}` }; this.faqs.update(faqs => [...faqs, newFaq]); this.showToast('FAQ added.'); }
  updateFaq(updatedFaq: Faq) { this.faqs.update(faqs => faqs.map(f => f.id === updatedFaq.id ? updatedFaq : f)); this.showToast('FAQ updated.'); }
  deleteFaq(faqId: string) { this.faqs.update(faqs => faqs.filter(f => f.id !== faqId)); this.showToast('FAQ deleted.'); }

  private getMockAddresses(): Address[] {
    return [
      { id: 'addr1', name: 'John Doe', mobile: '9876543210', pincode: '560001', locality: 'MG Road', address: '123, Commerce House, Cunningham Road', city: 'Bengaluru', state: 'Karnataka', isDefault: true },
      { id: 'addr2', name: 'John Doe', mobile: '9876543210', pincode: '110001', locality: 'Connaught Place', address: '45, Regal Building', city: 'New Delhi', state: 'Delhi', isDefault: false }
    ];
  }
  
  private getMockCoupons(): Coupon[] {
    return [
      { id: 'C1', code: 'SALE100', type: 'flat', value: 100, expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), maxUses: 50, usedCount: 12 },
      { id: 'C2', code: 'NEW20', type: 'percent', value: 20, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), maxUses: 100, usedCount: 5 }
    ];
  }
}