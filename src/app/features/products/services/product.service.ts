import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductFilter, PagedResponse } from '../models/product.model';
import { ICycle, IBrand, ICycleType } from '../../../app.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://localhost:7042/api';

  constructor(private http: HttpClient) {}

  getBrands(): Observable<IBrand[]> {
    return this.http.get<PagedResponse<IBrand>>(`${this.apiUrl}/Brand`).pipe(
      map(response => response.items)
    );
  }

  getCycleTypes(): Observable<ICycleType[]> {
    return this.http.get<PagedResponse<ICycleType>>(`${this.apiUrl}/CycleType`).pipe(
      map(response => response.items)
    );
  }

  getProducts(filter: ProductFilter): Observable<PagedResponse<ICycle>> {
    let params = new HttpParams();

    if (filter.minPrice !== undefined) params = params.set('MinPrice', filter.minPrice);
    if (filter.maxPrice !== undefined) params = params.set('MaxPrice', filter.maxPrice);
    if (filter.brandId) params = params.set('BrandId', filter.brandId);
    if (filter.typeId) params = params.set('TypeId', filter.typeId);
    if (filter.isActive !== undefined) params = params.set('IsActive', filter.isActive);
    if (filter.minStock !== undefined) params = params.set('MinStock', filter.minStock);
    if (filter.maxStock !== undefined) params = params.set('MaxStock', filter.maxStock);
    if (filter.searchTerm) params = params.set('SearchTerm', filter.searchTerm);
    
    params = params.set('Page', filter.page);
    params = params.set('PageSize', filter.pageSize);
    
    if (filter.sortBy) {
      params = params.set('SortBy', filter.sortBy);
      params = params.set('SortDirection', filter.sortDirection ?? 1);
    }

    return this.http.get<PagedResponse<ICycle>>(`${this.apiUrl}/Cycle`, { params });
  }

  getCycleById(id: string): Observable<ICycle> {
    return this.http.get<ICycle>(`${this.apiUrl}/Cycle/${id}`);
  }
}