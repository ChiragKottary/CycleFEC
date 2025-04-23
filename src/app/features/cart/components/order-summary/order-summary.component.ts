import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderSummary } from '../../models/cart.model';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class OrderSummaryComponent {
  @Input() summary!: OrderSummary;
  @Output() checkout = new EventEmitter<void>();

  proceedToCheckout(): void {
    this.checkout.emit();
  }
}