import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError, of, throwError } from 'rxjs';
import { CartItemDisplay, OrderSummary, ICartItemResponse } from '../models/cart.model';
import { ICartItem, ICycle, ICart } from '../../../app.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7042/api';
  private cartItems = new BehaviorSubject<CartItemDisplay[]>([]);
  private orderSummary = new BehaviorSubject<OrderSummary>({
    subtotal: 0,
    shipping: 0,
    taxes: 0,
    total: 0
  });
  private currentCartId = new BehaviorSubject<string | null>(null);
  private productStock = new Map<string, number>();
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {
    this.loadCustomerCart();
    
    this.authService.getAuthStateChange().subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadCustomerCart();
      } else {
        this.resetCartState();
      }
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  private updateCartState(items: CartItemDisplay[], cartId: string | null = null) {
    this.cartItems.next(items);
    if (cartId) {
      this.currentCartId.next(cartId);
    }
    this.updateOrderSummary();
  }

  private resetCartState(): void {
    this.cartItems.next([]);
    this.currentCartId.next(null);
    this.updateOrderSummary();
  }

  loadCustomerCart(): void {
    const customerId = this.authService.getCurrentUserId();
    if (!customerId) {
      this.resetCartState();
      return;
    }

    this.http.get<{ cartId: string; cartItems: ICartItemResponse[] }>(`${this.apiUrl}/Customers/${customerId}/cart`).pipe(
      tap(cart => {
        if (cart) {
          const cartItems = cart.cartItems || [];
          const mappedItems = cartItems.map(item => this.mapToCartItemDisplay(item));
          this.updateCartState(mappedItems, cart.cartId);
        } else {
          this.resetCartState();
        }
      }),
      catchError(error => {
        console.error('Error loading cart:', error);
        this.resetCartState();
        return of(null);
      })
    ).subscribe();
  }

  addToCart(cycle: ICycle): { success: boolean; message: string } {
    if (!this.authService.getCurrentUserId()) {
      return { success: false, message: 'Please login to add items to cart' };
    }

    this.productStock.set(cycle.cycleId, cycle.stockQuantity);

    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.id.split('_')[0] === cycle.cycleId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + 1 > cycle.stockQuantity) {
      return { 
        success: false, 
        message: `Only ${cycle.stockQuantity} item(s) available in stock`
      };
    }

    const cartId = this.currentCartId.value;
    if (!cartId) {
      // Create a new cart first, then add the item
      const customerId = this.authService.getCurrentUserId();
      
      // Create a temporary cart item for optimistic UI update
      const tempItem: CartItemDisplay = {
        id: `temp_${cycle.cycleId}`,
        name: cycle.modelName,
        price: cycle.price,
        quantity: 1,
        imageUrl: cycle.imageUrl,
        brand: cycle.brand?.brandName,
        cycleType: cycle.cycleType?.typeName,
        subtotal: cycle.price
      };
      
      // Optimistically update UI with temporary item
      this.updateCartState([...currentItems, tempItem]);
      
      // Create cart and then add item to it
      this.http.post<{cartId: string}>(`${this.apiUrl}/Customers/${customerId}/cart`, {}).pipe(
        tap(response => {
          if (response && response.cartId) {
            // Update current cart ID
            this.currentCartId.next(response.cartId);
            
            // Now add the item to the newly created cart
            const payload = {
              cycleId: cycle.cycleId,
              quantity: 1,
              unitPrice: cycle.price
            };
            
            this.http.post<ICartItemResponse>(`${this.apiUrl}/Cart/${response.cartId}/items`, payload).pipe(
              tap(newItem => {
                if (newItem) {
                  // Load the full cart to ensure everything is in sync
                  this.loadCustomerCart();
                }
              }),
              catchError(error => {
                console.error('Error adding item to new cart:', error);
                this.loadCustomerCart(); // Reload cart state
                return of(null);
              })
            ).subscribe();
          }
        }),
        catchError(error => {
          console.error('Error creating new cart:', error);
          // Remove optimistic update
          const updatedItems = currentItems.filter(item => item.id !== `temp_${cycle.cycleId}`);
          this.updateCartState(updatedItems);
          return of(null);
        })
      ).subscribe();
      
      return { success: true, message: 'Creating cart and adding item...' };
    }

    const payload = {
      cycleId: cycle.cycleId,
      quantity: 1,
      unitPrice: cycle.price
    };

    // Optimistically update UI
    if (existingItem) {
      const updatedItems = currentItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      this.updateCartState(updatedItems);
    } else {
      // Add a temporary item for optimistic UI update
      const tempItem: CartItemDisplay = {
        id: `temp_${cycle.cycleId}`,
        name: cycle.modelName,
        price: cycle.price,
        quantity: 1,
        imageUrl: cycle.imageUrl,
        brand: cycle.brand?.brandName,
        cycleType: cycle.cycleType?.typeName,
        subtotal: cycle.price
      };
      this.updateCartState([...currentItems, tempItem]);
    }

    this.http.post<ICartItemResponse>(`${this.apiUrl}/Cart/${cartId}/items`, payload).pipe(
      tap(newItem => {
        if (newItem) {
          // Instead of manual update, reload the cart to ensure it's in sync
          this.loadCustomerCart();
        }
      }),
      catchError(error => {
        console.error('Error adding item to cart:', error);
        // Revert optimistic update
        this.loadCustomerCart();
        return of(null);
      })
    ).subscribe();

    return { success: true, message: 'Item added to cart successfully' };
  }

  updateQuantity(itemId: string, quantity: number): { success: boolean; message: string } {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    const cycleId = item.id.split('_')[0];
    const stockQuantity = this.productStock.get(cycleId);

    if (stockQuantity !== undefined && quantity > stockQuantity) {
      return { 
        success: false, 
        message: `Cannot update quantity. Only ${stockQuantity} item(s) available in stock`
      };
    }

    if (quantity <= 0) {
      this.removeItem(itemId);
      return { success: true, message: 'Item removed from cart' };
    }

    // Optimistically update UI
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    this.updateCartState(updatedItems);

    this.http.put<ICartItemResponse>(`${this.apiUrl}/Cart/items/${itemId}`, { quantity }).pipe(
      tap(updatedItem => {
        if (updatedItem) {
          // Instead of manual update, reload the entire cart to ensure it's in sync
          this.loadCustomerCart();
        }
      }),
      catchError(error => {
        console.error('Error updating cart item quantity:', error);
        // Revert optimistic update
        this.loadCustomerCart();
        return of(null);
      })
    ).subscribe();

    return { success: true, message: 'Quantity updated successfully' };
  }

  removeItem(itemId: string): void {
    const currentItems = this.cartItems.value;
    
    // Optimistically update UI
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    this.updateCartState(updatedItems);

    this.http.delete(`${this.apiUrl}/Cart/items/${itemId}`).pipe(
      tap(() => {
        // Reload the cart after item removal
        this.loadCustomerCart();
      }),
      catchError(error => {
        console.error('Error removing item from cart:', error);
        // Revert optimistic update
        this.loadCustomerCart();
        return of(null);
      })
    ).subscribe();
  }

  clearCart(): void {
    const customerId = this.authService.getCurrentUserId();
    if (!customerId) {
      this.clearCart();
      return;
    }

    this.http.delete(`${this.apiUrl}/Customers/${customerId}/cart`).pipe(
      tap(() => {
        this.clearCart();
      }),
      catchError(error => {
        console.error('Error clearing cart:', error);
        return of(null);
      })
    ).subscribe();
  }

  private mapToCartItemDisplay(cartItem: ICartItemResponse): CartItemDisplay {
    return {
      id: cartItem.cartItemId,
      name: cartItem.cycleName,
      price: cartItem.unitPrice,
      quantity: cartItem.quantity,
      imageUrl: cartItem.cycleImage,
      brand: cartItem.cycleBrand,
      cycleType: cartItem.cycleType,
      subtotal: cartItem.subtotal
    };
  }

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

  private updateOrderSummary(): void {
    const items = this.cartItems.value;
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 10 : 0;
    const taxes = subtotal * 0.13;

    this.orderSummary.next({
      subtotal,
      shipping,
      taxes,
      total: subtotal + shipping + taxes
    });
  }
}