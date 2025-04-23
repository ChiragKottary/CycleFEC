import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../cart/services/cart.service';
import { ProductService } from '../../services/product.service';
import { Observable, Subject, map } from 'rxjs';
import { ProductFilter, PagedResponse } from '../../models/product.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ICycle } from '../../../../app.model';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class ProductListingComponent implements OnInit {
  products: ICycle[] = [];
  cartItemCount$: Observable<number>;
  loading = false;
  error = '';

  // Filter state
  filter: ProductFilter = {
    page: 1,
    pageSize: 7,
    minPrice: 2000,
    maxPrice: 12000,
    isActive: true,
    sortBy: 'modelName',
    sortDirection: 1
  };

  // Pagination
  totalItems = 0;
  totalPages = 0;

  // UI state
  gridSize: 'small' | 'medium' | 'large' = 'medium';
  searchTerms = new Subject<string>();

  constructor(
    private cartService: CartService,
    private productService: ProductService
  ) {
    this.cartItemCount$ = this.cartService.getCartItems().pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );

    // Setup search with debounce
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.filter = { ...this.filter, searchTerm: term, page: 1 };
        return this.loadProducts();
      })
    ).subscribe();
  }

  ngOnInit() {
    this.loadProducts().subscribe();
  }

  search(term: string) {
    this.searchTerms.next(term);
  }

  updatePriceRange(min: number, max: number) {
    this.filter = { ...this.filter, minPrice: min, maxPrice: max, page: 1 };
    this.loadProducts().subscribe();
  }

  setGridSize(size: 'small' | 'medium' | 'large') {
    this.gridSize = size;
  }

  getGridClass(): string {
    switch(this.gridSize) {
      case 'small': return 'grid-cols-[repeat(auto-fit,minmax(158px,1fr))]';
      case 'medium': return 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]';
      case 'large': return 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]';
      default: return 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]';
    }
  }

  // Pagination methods
  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, this.filter.page - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages || page === this.filter.page) return;
    this.filter = { ...this.filter, page };
    this.loadProducts().subscribe();
  }

  onSortChange(sortBy: string) {
    this.filter = { 
      ...this.filter, 
      sortBy,
      sortDirection: this.filter.sortBy === sortBy ? 
        (this.filter.sortDirection === 1 ? -1 : 1) : 1,
      page: 1
    };
    this.loadProducts().subscribe();
  }

  private loadProducts(): Observable<PagedResponse<ICycle>> {
    this.loading = true;
    this.error = '';

    return this.productService.getProducts(this.filter).pipe(
      map(response => {
        this.products = response.items;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.loading = false;
        return response;
      })
    );
  }

  addToCart(product: ICycle): void {
    this.cartService.addToCart(product);
  }
}