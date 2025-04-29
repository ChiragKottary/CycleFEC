import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegistrationFormComponent {
  registrationForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
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

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.markFormGroupTouched(this.registrationForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.registrationForm.value;
    
    this.customerService.registerCustomer(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'true' } 
          });
        } else {
          this.errorMessage = response.message || 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'An unexpected error occurred. Please try again later.';
        console.error('Registration error:', error);
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
