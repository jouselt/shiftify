import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '@pro-schedule-manager/services/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-onboarding',
  standalone: false,
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css'
})
export class Onboarding {
  employeeFile: File | null = null;
  shiftFile: File | null = null;
  isLoading = false;

  constructor(private apiService: ApiService, private router: Router) { }

  onFileSelected(event: Event, fileType: 'employee' | 'shift'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (fileType === 'employee') this.employeeFile = file;
      if (fileType === 'shift') this.shiftFile = file;
    }
  }

  uploadFiles(): void {
    if (!this.employeeFile || !this.shiftFile) {
      alert('Please select both files.');
      return;
    }

    this.isLoading = true;
    const uploadEmployees$ = this.apiService.uploadEmployeesCsv(this.employeeFile);
    const uploadShifts$ = this.apiService.uploadShiftsCsv(this.shiftFile);

    forkJoin([uploadEmployees$, uploadShifts$]).subscribe({
      next: ([empRes, shiftRes]) => {
        if (empRes.success && shiftRes.success) {
          alert('Files uploaded successfully! Welcome to Shiftify.');
          this.router.navigate(['/schedule']);
        } else {
          alert('There was an error uploading one or more files.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        alert('An API error occurred. Please try again.');
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}