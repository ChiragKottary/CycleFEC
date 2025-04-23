import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartItemDisplay, OrderSummary } from '../../models/cart.model';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from "../../components/cart-item/cart-item.component";
import { OrderSummaryComponent } from "../../components/order-summary/order-summary.component";

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  standalone: true,
  imports: [CommonModule, CartItemComponent, OrderSummaryComponent]
})
export class CartComponent implements OnInit {
  cartItems: CartItemDisplay[] = [];
  orderSummary: OrderSummary = {
    subtotal: 0,
    shipping: 0,
    taxes: 0,
    total: 0
  };

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.getOrderSummary().subscribe(summary => {
      this.orderSummary = summary;
    });
  }

  updateQuantity(event: Event, item: CartItemDisplay): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    this.cartService.updateQuantity(item.id, quantity);
  }

  removeItem(item: CartItemDisplay): void {
    this.cartService.removeItem(item.id);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}