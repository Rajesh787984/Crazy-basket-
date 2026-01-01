
import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Address } from '../models/address.model';
import { Order, OrderItem, OrderStatus } from '../models/order.model';
import { Review } from '../models/review.model';
import { Category } from '../models/category.model';
import { ProductService } from './product.service';
import { Faq } from '../models/faq.model';

interface CartItem {
    product: Product;
    size: string;
    quantity: number;
}

export interface ActiveFilters {
  priceRanges: string[];
  discounts: number[];
}

export interface HeroSlide {
  img: string;
  title: string;
  subtitle: string;
}


@Injectable({
  providedIn: 'root'
})
export class StateService {
  private productService = inject(ProductService);
  // --- STATE ---

  // Authentication & Users
  private users = signal<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@crazybasket.com', mobile: '8279458045', password: 'password', insiderPoints: 2500, isVerified: true },
    { id: '2', name: 'John Doe', email: 'user@example.com', mobile: '9876543210', password: 'password', insiderPoints: 1500, isVerified: true }
  ]);
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.mobile === '8279458045');
  
  // Navigation
  currentView = signal<string>('home');
  protectedViews = new Set(['profile', 'address', 'payment', 'orders', 'myntra-insider', 'address-form', 'admin', 'profile-edit', 'outfitRecommender', 'manual-payment']);
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

  // Cart & Wishlist
  cartItems = signal<CartItem[]>([]);
  appliedCoupon = signal<string | null>(null);

  // Checkout
  userAddresses = signal<Address[]>(this.getMockAddresses());
  selectedAddressId = signal<string | null>(this.getMockAddresses().find(a => a.isDefault)?.id || null);
  addressToEdit = signal<Address | null>(null);
  selectedPaymentMethod = signal<string>('COD');
  
  // Orders & Reviews
  orders = signal<Order[]>([]);
  latestOrderId = signal<string | null>(null);
  userReviews = signal<Review[]>([]);

  // Content Management
  heroSlides = signal<HeroSlide[]>([
    { img: 'https://picsum.photos/id/1015/1200/400', title: 'Biggest Fashion Sale', subtitle: 'UP TO 70% OFF' },
    { img: 'https://picsum.photos/id/1016/1200/400', title: 'New Arrivals', subtitle: 'FRESH & TRENDY' },
    { img: 'https://picsum.photos/id/1018/1200/400', title: 'Winter Collection', subtitle: 'STAY WARM & STYLISH' },
    { img: 'https://picsum.photos/id/1025/1200/400', title: 'Kids Wear Special', subtitle: 'FUN & COMFY' },
    { img: 'https://picsum.photos/id/1043/1200/400', title: 'Ethnic Wear Fiesta', subtitle: 'TRADITIONAL VIBES' },
    { img: 'https://picsum.photos/id/1050/1200/400', title: 'Footwear Frenzy', subtitle: 'STARTING AT ₹499' }
  ]);
  
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
  cartItemCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  cartMRP = computed(() => this.cartItems().reduce((acc, item) => acc + (item.product.originalPrice * item.quantity), 0));
  cartDiscount = computed(() => this.cartItems().reduce((acc, item) => acc + ((item.product.originalPrice - item.product.price) * item.quantity), 0));
  couponDiscount = computed(() => this.appliedCoupon() === 'MYNTRA100' ? 100 : 0);
  cartTotal = computed(() => Math.max(0, this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0) - this.couponDiscount()));

  // Admin Dashboard Computed
  totalSales = computed(() => this.orders().reduce((acc, order) => acc + order.totalAmount, 0));
  pendingOrdersCount = computed(() => this.orders().filter(o => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Pending Verification').length);
  totalUsersCount = computed(() => this.users().length);

  // --- METHODS ---

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
    if (data?.category) {
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

  // Auth Methods
  requestLoginOtp(mobile: string): boolean {
    if (mobile === '8279458045') {
      this.showToast('Admin OTP Sent: 787984');
      return true;
    }
    const user = this.users().find(u => u.mobile === mobile);
    if (user) {
      this.showToast('OTP Sent: 123456');
      return true;
    }
    this.showToast('No account found with this mobile number.');
    return false;
  }
  
  loginWithOtp(mobile: string, otp: string): boolean {
    const isSpecialAdminLogin = mobile === '8279458045' && otp === '787984';
    const isRegularLogin = otp === '123456';

    if (!isSpecialAdminLogin && !isRegularLogin) {
      this.showToast('Invalid OTP.');
      return false;
    }

    const user = this.users().find(u => u.mobile === mobile);
    if (user) {
      this.currentUser.set(user);
      this.showToast('Login successful!');
      this.navigateTo(this.lastNavigatedView() !== 'login' ? this.lastNavigatedView() : 'home');
      return true;
    }
    
    this.showToast('Login failed. User not found.');
    return false;
  }
  
  signup(name: string, email: string, mobile: string):boolean {
      if (this.users().some(u => u.email === email)) {
          this.showToast('User with this email already exists.');
          return false;
      }
      if (this.users().some(u => u.mobile === mobile)) {
          this.showToast('User with this mobile number already exists.');
          return false;
      }
      const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          mobile,
          insiderPoints: 0,
          isVerified: false
      };
      this.users.update(users => [...users, newUser]);
      this.currentUser.set(newUser);
      this.showToast('Account created! A verification link has been sent to your email.');
      this.navigateTo('home');
      return true;
  }

  updateUser(updatedInfo: { name: string, mobile: string }) {
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
    this.currentUser.set(null);
    this.cartItems.set([]);
    this.orders.set([]);
    this.navigateTo('home');
    this.showToast('You have been logged out.');
  }

  // Cart Methods
  addToCart(product: Product, size: string) {
    const existingItem = this.cartItems().find(item => item.product.id === product.id && item.size === size);
    if (existingItem) {
      this.updateCartItemQuantity(product.id, size, existingItem.quantity + 1);
    } else {
      this.cartItems.update(items => [...items, { product, size, quantity: 1 }]);
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
  applyCoupon(code: string) { if (code.toUpperCase() === 'MYNTRA100') { this.appliedCoupon.set('MYNTRA100'); this.showToast('Coupon applied successfully!'); } else { this.appliedCoupon.set(null); this.showToast('Invalid coupon code.'); } }

  // Filter & Sort Methods
  setSortOption(option: string) { this.sortOption.set(option); }
  setFilters(filters: ActiveFilters) { this.activeFilters.set(filters); }
  resetFilters() { this.activeFilters.set({ priceRanges: [], discounts: [] }); }

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
      if (this.selectedAddressId() === addressId) {
          this.selectedAddressId.set(null);
      }
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
    this.orders.update(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    this.showToast(`Order #${orderId} status updated to ${status}.`);
  }

  placeOrder() {
    const address = this.userAddresses().find(a => a.id === this.selectedAddressId());
    if (!address) { this.showToast('Please select a shipping address.'); return; }
    const orderId = `CB${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      date: new Date(),
      items: this.cartItems().map(item => ({...item, price: item.product.price })),
      totalAmount: this.cartTotal(),
      shippingAddress: address,
      paymentMethod: this.selectedPaymentMethod(),
      status: 'Confirmed'
    };
    this.orders.update(orders => [newOrder, ...orders]);
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.latestOrderId.set(orderId);
    this.navigateTo('orderConfirmation');
  }

  placeManualUpiOrder(transactionId: string) {
    const address = this.userAddresses().find(a => a.id === this.selectedAddressId());
    if (!address) { this.showToast('Please select a shipping address.'); return; }
    const orderId = `CB${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      date: new Date(),
      items: this.cartItems().map(item => ({...item, price: item.product.price })),
      totalAmount: this.cartTotal(),
      shippingAddress: address,
      paymentMethod: 'UPI (Manual)',
      status: 'Pending Verification',
      transactionId: transactionId
    };
    this.orders.update(orders => [newOrder, ...orders]);
    this.cartItems.set([]);
    this.appliedCoupon.set(null);
    this.latestOrderId.set(orderId);
    this.navigateTo('orderConfirmation');
  }


  // --- Admin Content Methods ---
  addBanner(banner: HeroSlide) {
    this.heroSlides.update(slides => [...slides, banner]);
    this.showToast('Banner added successfully!');
  }

  deleteBanner(index: number) {
    this.heroSlides.update(slides => {
      const newSlides = [...slides];
      newSlides.splice(index, 1);
      return newSlides;
    });
    this.showToast('Banner deleted successfully!');
  }

  addCategory(category: Omit<Category, 'id'>) {
    const newCategory: Category = { ...category, id: `cat_${Date.now()}`};
    this.categories.update(cats => [...cats, newCategory]);
    this.showToast('Category added.');
  }

  updateCategory(updatedCategory: Category) {
    const oldCategory = this.categories().find(c => c.id === updatedCategory.id);
    if (oldCategory && oldCategory.name !== updatedCategory.name) {
      this.productService.updateCategoryName(oldCategory.name, updatedCategory.name);
    }
    this.categories.update(cats => cats.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    this.showToast('Category updated.');
  }

  deleteCategory(categoryId: string) {
    this.categories.update(cats => cats.filter(c => c.id !== categoryId));
    this.showToast('Category deleted.');
  }
  
  updateContactInfo(newInfo: { address: string; email: string; phone: string; upiId: string; qrCodeImage: string; }) {
    this.contactInfo.set(newInfo);
    this.showToast('Contact information updated.');
  }

  addFaq(faq: { question: string; answer: string; }) {
    const newFaq: Faq = { ...faq, id: `faq_${Date.now()}` };
    this.faqs.update(faqs => [...faqs, newFaq]);
    this.showToast('FAQ added.');
  }
  
  updateFaq(updatedFaq: Faq) {
    this.faqs.update(faqs => faqs.map(f => f.id === updatedFaq.id ? updatedFaq : f));
    this.showToast('FAQ updated.');
  }

  deleteFaq(faqId: string) {
    this.faqs.update(faqs => faqs.filter(f => f.id !== faqId));
    this.showToast('FAQ deleted.');
  }


  private getMockAddresses(): Address[] {
    return [
      { id: 'addr1', name: 'John Doe', mobile: '9876543210', pincode: '560001', locality: 'MG Road', address: '123, Commerce House, Cunningham Road', city: 'Bengaluru', state: 'Karnataka', isDefault: true },
      { id: 'addr2', name: 'John Doe', mobile: '9876543210', pincode: '110001', locality: 'Connaught Place', address: '45, Regal Building', city: 'New Delhi', state: 'Delhi', isDefault: false }
    ];
  }
}