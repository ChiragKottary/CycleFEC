import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../../features/cart/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class HeaderComponent {
  cartItemCount$: Observable<number>;
  categories: string[] = ['Mountain Bikes', 'Road Bikes', 'Electric Bikes', 'Accessories'];

  constructor(private cartService: CartService,private router: Router) {
    this.cartItemCount$ = this.cartService.getCartItemCount();
  }
  navigateToHome(): void {
    this.router.navigate(['/products']);
  }
}