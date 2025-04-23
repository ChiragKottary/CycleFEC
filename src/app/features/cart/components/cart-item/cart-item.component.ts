import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();

  updateQuantity(change: number): void {
    const newQuantity = Math.max(1, this.item.quantity + change);
    this.quantityChange.emit(newQuantity);
  }

  removeItem(): void {
    this.remove.emit();
  }
}