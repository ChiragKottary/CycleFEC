import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../cart/services/cart.service';
import { ProductService } from '../../services/product.service';
import { Observable, Subject, catchError, map, forkJoin, of } from 'rxjs';
import { ProductFilter, PagedResponse } from '../../models/product.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ICycle, IBrand, ICycleType } from '../../../../app.model';
import { QuickViewComponent } from '../../components/quick-view/quick-view.component';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, QuickViewComponent]
})
export class ProductListingComponent implements OnInit {
  products: ICycle[] = [];
  cartItemCount$: Observable<number>;
  loading = false;
  error = '';

  // Price range configuration
  minPriceLimit = 0;
  maxPriceLimit = 15000;
  priceStep = 100;

  // Filter state
  filter: ProductFilter = {
    page: 1,
    pageSize: 7,
    minPrice: 0,
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

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  brands: IBrand[] = [];
  cycleTypes: ICycleType[] = [];

  showQuickView = false;
  selectedCycle: ICycle | null = null;

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
    // Load brands and categories first
    forkJoin({
      brands: this.productService.getBrands().pipe(
        catchError(error => {
          console.error('Error loading brands:', error);
          this.error = 'Failed to load brands';
          return of([]);
        })
      ),
      types: this.productService.getCycleTypes().pipe(
        catchError(error => {
          console.error('Error loading cycle types:', error);
          this.error = 'Failed to load categories';
          return of([]);
        })
      )
    }).subscribe({
      next: (result) => {
        console.log('Brands received:', result.brands);
        console.log('Types received:', result.types);
        
        this.brands = result.brands;
        this.cycleTypes = result.types;
        
        // Load products after getting filter options
        this.loadProducts().subscribe();
      },
      error: (error) => {
        console.error('Error in forkJoin:', error);
        this.error = 'Failed to load filter options';
      }
    });
  }

  search(term: string) {
    this.searchTerms.next(term);
  }

  updatePriceRange(min: number | null, max: number | null) {
    if (min !== null) {
      min = Math.max(this.minPriceLimit, Math.min(min, this.maxPriceLimit));
      if (max !== null && min > max) {
        min = max;
      }
    }
    
    if (max !== null) {
      max = Math.max(this.minPriceLimit, Math.min(max, this.maxPriceLimit));
      if (min !== null && max < min) {
        max = min;
      }
    }

    this.filter = {
      ...this.filter,
      minPrice: min ?? this.filter.minPrice,
      maxPrice: max ?? this.filter.maxPrice,
      page: 1
    };

    this.loadProducts().subscribe();
  }

  setGridSize(size: 'small' | 'medium' | 'large') {
    this.gridSize = size;
  }

  getGridClass(): string {
    const baseClasses = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    switch(this.gridSize) {
      case 'small': return `${baseClasses} gap-3 auto-rows-[minmax(250px,auto)]`;
      case 'medium': return `${baseClasses} gap-6 auto-rows-[minmax(350px,auto)]`;
      case 'large': return `${baseClasses} gap-8 auto-rows-[minmax(550px,auto)]`;
      default: return `${baseClasses} gap-6 auto-rows-[minmax(350px,auto)]`;
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
        (this.filter.sortDirection === 1 ? 0 : 1) : 1,
      page: 1
    };
    this.loadProducts().subscribe();
  }

  onBrandChange(brandId: string | '') {
    console.log('Brand changed to:', brandId);
    this.filter = {
      ...this.filter,
      brandId: brandId || undefined,
      page: 1
    };
    console.log('Updated filter:', this.filter);
    this.loadProducts().subscribe(
      response => console.log('Products after brand filter:', response)
    );
  }

  onTypeChange(typeId: string | '') {
    console.log('Type changed to:', typeId);
    this.filter = {
      ...this.filter,
      typeId: typeId || undefined,
      page: 1
    };
    console.log('Updated filter:', this.filter);
    this.loadProducts().subscribe(
      response => console.log('Products after type filter:', response)
    );
  }

  private loadProducts(): Observable<PagedResponse<ICycle>> {
    this.loading = true;
    this.error = '';

    return this.productService.getProducts(this.filter).pipe(
      map(response => {
        console.log('Products response:', response);
        this.products = response.items;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.loading = false;
        return response;
      }),
      catchError(error => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
        return of({
          items: [],
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        });
      })
    );
  }

  addToCart(product: ICycle): void {
    const result = this.cartService.addToCart(product);
    this.showNotification(result.message, result.success ? 'success' : 'error');

    if (!result.success) {
      // Play error sound or provide haptic feedback if needed
      const audio = new Audio('assets/sounds/error.mp3');
      audio.play().catch(() => {}); // Ignore if sound can't be played
    }
  }

  openQuickView(cycleId: string): void {
    this.productService.getCycleById(cycleId).subscribe({
      next: (cycle) => {
        this.selectedCycle = cycle;
        this.showQuickView = true;
      },
      error: (error) => {
        console.error('Error loading cycle details:', error);
        this.showNotification('Failed to load cycle details', 'error');
      }
    });
  }

  closeQuickView(): void {
    this.showQuickView = false;
    this.selectedCycle = null;
  }

  public showNotification(message: string, type: 'success' | 'error'): void {
    if (this.showToast) {
      // If a toast is already showing, clear it first
      clearTimeout(this.toastTimeout);
      this.showToast = false;
      // Small delay before showing new toast
      setTimeout(() => this.displayToast(message, type), 100);
    } else {
      this.displayToast(message, type);
    }
  }

  private toastTimeout: any;

  private displayToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto hide toast after 3 seconds
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}