import { ICycle } from '../../../app.model';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  brand?: string;
  type?: string;
  stock?: number;
  isActive?: boolean;
}

export interface ProductFilter {
  minPrice?: number;
  maxPrice?: number;
  brandId?: string;
  typeId?: string;
  isActive?: boolean;
  minStock?: number;
  maxStock?: number;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: number;
  searchTerm?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}