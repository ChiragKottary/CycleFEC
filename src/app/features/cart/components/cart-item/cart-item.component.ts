import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItemDisplay } from '../../models/cart.model';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class CartItemComponent {
  @Input() item!: CartItemDisplay;

  constructor(private cartService: CartService) {}

  updateQuantity(quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(this.item.id, quantity);
    }
  }

  removeItem(): void {
    this.cartService.removeItem(this.item.id);
  }
}