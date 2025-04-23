import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'https://localhost:7042/api/Customers';

  constructor(private http: HttpClient) {}

  registerCustomer(customer: Customer): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }
}