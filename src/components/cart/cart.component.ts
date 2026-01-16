import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [CommonModule, NgOptimizedImage, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  stateService: StateService = inject(StateService);
  cartItems = this.stateService.cartItemsWithPrices;
  cartMRP = this.stateService.cartMRP;
  cartDiscount = this.stateService.cartDiscountOnMRP;
  cartTotal = this.stateService.cartTotal;
  couponDiscount = this.stateService.couponDiscount;
  shippingCost = this.stateService.shippingCost;
  
  couponCode = signal('');

  removeItem(productId: string, size: string) {
    this.stateService.removeFromCart(productId, size);
  }

  updateQuantity(productId: string, size: string, newQuantity: number) {
    this.stateService.updateCartItemQuantity(productId, size, newQuantity);
  }

  applyCoupon() {
    this.stateService.applyCoupon(this.couponCode());
  }

  placeOrder() {
    // This will now trigger the protected route guard in the state service
    this.stateService.navigateTo('address');
  }

  continueShopping() {
    this.stateService.navigateTo('home');
  }
}