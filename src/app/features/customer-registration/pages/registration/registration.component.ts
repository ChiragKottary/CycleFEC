import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFormComponent } from '../../components/registration-form/registration-form.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  standalone: true,
  imports: [CommonModule, RegistrationFormComponent]
})
export class RegistrationComponent {}
