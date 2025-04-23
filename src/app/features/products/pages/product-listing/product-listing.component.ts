import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../cart/services/cart.service';
import { Observable, map } from 'rxjs';
import { HeaderComponent } from "../../../../shared/components/header/header.component";

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent]
})
export class ProductListingComponent {
  cartItemCount$: Observable<number>;

  products = [
    {
      id: 1,
      name: 'Trail Blazer Mountain Bike',
      price: 599,
      image: 'https://cdn.usegalileo.ai/sdxl10/25518d5d-3602-4afd-99d0-13fb0f147701.png'
    },
    {
      id: 2,
      name: 'City Cruiser Comfort Cycle',
      price: 349,
      image: 'https://cdn.usegalileo.ai/sdxl10/6745f67e-7b20-4981-a46d-8b6d79b6befe.png'
    },
    {
      id: 3,
      name: 'Velocity Road Racer',
      price: 799,
      image: 'https://cdn.usegalileo.ai/sdxl10/e1e0d1e9-9af3-461a-8755-75fb9fee148c.png'
    },
    {
      id: 4,
      name: 'Electric Glide E-Bike',
      price: 1299,
      image: 'https://cdn.usegalileo.ai/sdxl10/f8fed6f5-a7c9-4728-b9e0-c180f95f4b80.png'
    },
    {
      id: 5,
      name: 'Urban Commuter Hybrid',
      price: 449,
      image: 'https://cdn.usegalileo.ai/sdxl10/e543683d-e3f8-4a69-b581-5d58c7574e2a.png'
    },
    {
      id: 6,
      name: 'Adventure Touring Bike',
      price: 649,
      image: 'https://cdn.usegalileo.ai/sdxl10/aa714316-3958-4991-9882-1d5a1c85ef24.png'
    }
  ];

  categories = ['New Arrivals', 'Electric Bikes', 'Mountain Bikes', 'Road Bikes', 'Accessories'];

  constructor(private cartService: CartService) {
    this.cartItemCount$ = this.cartService.getCartItems().pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  addToCart(product: any): void {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image
    });
  }
}