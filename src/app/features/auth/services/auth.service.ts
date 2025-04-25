import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  customerId: string;
}

interface DecodedToken {
  sub: string;
  customerId: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7042/api/Customers/login';
  private tokenKey = 'auth_token';
  private customerIdKey = 'customer_id';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private authStateChange = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.customerIdKey, response.customerId);
          this.isAuthenticatedSubject.next(true);
          this.authStateChange.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.customerIdKey);
    this.isAuthenticatedSubject.next(false);
    this.authStateChange.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getAuthStateChange(): Observable<boolean> {
    return this.authStateChange.asObservable();
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem(this.customerIdKey);
  }

  private hasToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 400) {
        errorMessage = 'Invalid login credentials';
      }
    }
    
    return throwError(() => ({ message: errorMessage }));
  }
}