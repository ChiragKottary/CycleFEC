import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.scss',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegistrationFormComponent {
  registrationForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private customerService: CustomerService
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formValue = this.registrationForm.value;
      // Remove termsAccepted as it's not needed in the API
      const { termsAccepted, ...customerData } = formValue;

      this.customerService.registerCustomer(customerData).subscribe({
        next: () => {
          // Registration successful
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
