import { Component, OnInit } from '@angular/core';
import { Observable, map, BehaviorSubject, switchMap, tap } from 'rxjs';
import { Employee, GeneratedSchedule, Shift } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';
import { I18nService } from '@pro-schedule-manager/services/i18n';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  providers: [DatePipe],
  standalone: false,
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  // State management for the current view
  private currentDisplayDate = new BehaviorSubject<Date>(new Date());
  
  // Observables for the template
  weekDates$!: Observable<Date[]>;
  managers$!: Observable<Employee[]>;
  crew$!: Observable<Employee[]>;
  schedule$!: Observable<GeneratedSchedule | null>;
  shiftsMap$!: Observable<Map<string, Shift>>;
  daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];


  constructor(
    private apiService: ApiService, 
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    const storeId = 1; // Default to store 1 for now

    // When the display date changes, recalculate the week
    this.weekDates$ = this.currentDisplayDate.pipe(
      map(date => this.getWeekFromDate(date))
    );

    const employees$ = this.apiService.getEmployees(storeId);
    this.managers$ = employees$.pipe(
      map(employees => employees.filter(emp => emp.type === 'Manager'))
    );
    this.crew$ = employees$.pipe(
      map(employees => employees.filter(emp => emp.type === 'Crew'))
    );

    // Create a Map of shifts for easy lookup
    this.shiftsMap$ = this.apiService.getShifts().pipe(
      map(shiftsArray => new Map(shiftsArray.map(s => [s.shiftCode, s])))
    );

    // Initialize the schedule as an empty observable
    this.schedule$ = new BehaviorSubject<GeneratedSchedule | null>(null);
  }

  generateNewSchedule(): void {
    const date = this.currentDisplayDate.getValue();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // We re-assign the schedule$ observable to the new API call
    this.schedule$ = this.apiService.generateSchedule(1, month, year);
  }

  // --- Week Navigation Methods ---
  changeWeek(offset: number): void {
    const newDate = this.currentDisplayDate.getValue();
    newDate.setDate(newDate.getDate() + (7 * offset));
    this.currentDisplayDate.next(newDate);
  }

  goToToday(): void {
    this.currentDisplayDate.next(new Date());
  }

  // --- Helper to get a week's dates ---
  private getWeekFromDate(date: Date): Date[] {
    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon,...
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + daysToMonday);

    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(monday);
      weekDay.setDate(monday.getDate() + i);
      weekDates.push(weekDay);
      }
    return weekDates;
  }
}