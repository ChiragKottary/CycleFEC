import { Routes } from '@angular/router';
import { RegistrationComponent } from './features/customer-registration/pages/registration/registration.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { ProductListingComponent } from './features/products/pages/product-listing/product-listing.component';
import { CartComponent } from './features/cart/pages/cart/cart.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'products', component: ProductListingComponent },
  { path: 'cart', component: CartComponent }
];
