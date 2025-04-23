import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { CartItemDisplay, OrderSummary } from '../models/cart.model';
import { ICartItem, ICycle } from '../../../app.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItemDisplay[]>([]);
  private orderSummary = new BehaviorSubject<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    taxes: 0,
    total: 0
  });

  constructor(private http: HttpClient) {}

  getCartItems(): Observable<CartItemDisplay[]> {
    return this.cartItems.asObservable();
  }

  getCartItemCount(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  getOrderSummary(): Observable<OrderSummary> {
    return this.orderSummary.asObservable();
  }

  addToCart(cycle: ICycle): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(i => i.id === cycle.cycleId);

    if (existingItem) {
      this.updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItemDisplay = {
        id: cycle.cycleId,
        name: cycle.modelName,
        price: cycle.price,
        quantity: 1,
        imageUrl: cycle.imageUrl,
        brand: cycle.brand?.brandName,
        cycleType: cycle.cycleType?.typeName
      };
      this.cartItems.next([...currentItems, newItem]);
    }
    this.updateOrderSummary();
  }

  updateQuantity(itemId: string, quantity: number): void {
    const items = this.cartItems.value.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    this.cartItems.next(items);
    this.updateOrderSummary();
  }

  removeItem(itemId: string): void {
    const items = this.cartItems.value.filter(item => item.id !== itemId);
    this.cartItems.next(items);
    this.updateOrderSummary();
  }

  private updateOrderSummary(): void {
    const items = this.cartItems.value;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // You can adjust these calculations based on your business logic
    const shipping = subtotal > 0 ? 10 : 0; // Example: $10 shipping if cart is not empty
    const taxes = subtotal * 0.13; // Example: 13% tax

    this.orderSummary.next({
      subtotal,
      shipping,
      taxes,
      total: subtotal + shipping + taxes
    });
  }

  clearCart(): void {
    this.cartItems.next([]);
    this.updateOrderSummary();
  }
}