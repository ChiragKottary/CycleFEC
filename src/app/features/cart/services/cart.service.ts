import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { CartItem, OrderSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private orderSummary = new BehaviorSubject<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    taxes: 0,
    total: 0
  });

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartItemCount(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.length)
    );
  }

  getOrderSummary(): Observable<OrderSummary> {
    return this.orderSummary.asObservable();
  }

  addToCart(item: CartItem): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.next([...currentItems]);
    } else {
      this.cartItems.next([...currentItems, { ...item, quantity: 1 }]);
    }
    this.updateOrderSummary();
  }

  updateQuantity(itemId: number, quantity: number): void {
    const items = this.cartItems.value.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    this.cartItems.next(items);
    this.updateOrderSummary();
  }

  removeItem(itemId: number): void {
    const items = this.cartItems.value.filter(item => item.id !== itemId);
    this.cartItems.next(items);
    this.updateOrderSummary();
  }

  private updateOrderSummary(): void {
    const items = this.cartItems.value;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.orderSummary.next({
      subtotal,
      shipping: 0,
      taxes: 0,
      total: subtotal
    });
  }
}