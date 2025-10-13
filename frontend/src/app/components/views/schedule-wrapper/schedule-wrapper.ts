import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-wrapper',
  standalone: false,
  templateUrl: './schedule-wrapper.html',
  styleUrl: './schedule-wrapper.css'
})

export class ScheduleWrapperComponent {
  // Set the default value to 'week'
  currentView: string = 'week';

  constructor(private router: Router) {}

  onViewChange(view: string): void {
    this.currentView = view;
    // Navigate to the selected child route (e.g., '/schedule/week')
    this.router.navigate(['/schedule', this.currentView]);
  }
}