import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginFormComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    
    this.authService.login({email, password}).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.token) { // Assuming 'token' exists on LoginResponse
          this.router.navigate(['/']);
        } else {
          // Using a safe approach since message might not exist on LoginResponse
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'An unexpected error occurred. Please try again later.';
        console.error('Login error:', error);
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
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