import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../../features/cart/services/cart.service';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class HeaderComponent {
  cartItemCount$: Observable<number>;
  isAuthenticated$: Observable<boolean>;
  categories: string[] = ['Mountain Bikes', 'Road Bikes', 'Electric Bikes', 'Accessories'];

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {
    this.cartItemCount$ = this.cartService.getCartItemCount();
    this.isAuthenticated$ = this.authService.isAuthenticated();
  }

  navigateToHome(): void {
    this.router.navigate(['/products']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}