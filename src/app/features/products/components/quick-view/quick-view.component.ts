import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICycle } from '../../../../app.model';
import { CartService } from '../../../cart/services/cart.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ opacity: 0, transform: 'translateY(-20px)' })
        )
      ])
    ])
  ]
})
export class QuickViewComponent {
  @Input() show = false;
  @Input() cycle: ICycle | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() notify = new EventEmitter<{message: string; type: 'success' | 'error'}>();

  constructor(private cartService: CartService) {}

  addToCart(product: ICycle): void {
    const result = this.cartService.addToCart(product);
    this.notify.emit({
      message: result.message,
      type: result.success ? 'success' : 'error'
    });
    if (result.success) {
      this.close.emit();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}