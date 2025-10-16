import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, switchMap } from 'rxjs';
import { Employee, GeneratedSchedule, Shift } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  workingEmployees: { employee: Employee; shiftCode: string }[];
}

@Component({
  selector: 'app-month',
  standalone: false,
  templateUrl: './month.html',
  styleUrl: './month.css'
})
export class MonthComponent implements OnInit {
  private displayMonth = new BehaviorSubject<Date>(new Date());
  
  calendarWeeks$!: Observable<CalendarDay[][]>;
  shiftsMap$!: Observable<Map<string, Shift>>;
  displayMonth$ = this.displayMonth.asObservable();
  daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const employees$ = this.apiService.getEmployees(1);
    this.shiftsMap$ = this.apiService.getShifts().pipe(
      map(shiftsArray => new Map(shiftsArray.map(s => [s.shiftCode, s])))
    );

    const schedule$ = this.displayMonth.pipe(
      switchMap(date => {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return this.apiService.generateSchedule(1, month, year);
      })
    );

    this.calendarWeeks$ = combineLatest([employees$, schedule$]).pipe(
      map(([employees, schedule]) => 
        this.generateCalendar(this.displayMonth.getValue(), employees, schedule)
      )
    );
  }

  changeMonth(offset: number): void {
    const newDate = this.displayMonth.getValue();
    newDate.setMonth(newDate.getMonth() + offset);
    this.displayMonth.next(newDate);
  }

  // This method is now only for demonstration; real update logic will be in the next step.
  assignDayOff(employeeId: number, date: Date, shiftCode:string): void {
    console.log(`Assigning day off for employee ${employeeId} on ${date.toISOString().split('T')[0]}`);
    this.apiService.updateScheduleDay(employeeId, date.toISOString().split('T')[0], shiftCode)   // In the next step, we'll connect this to the backend API.
  }

  private generateCalendar(
    date: Date, 
    employees: Employee[], 
    schedule: GeneratedSchedule
  ): CalendarDay[][] {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const startDate = new Date(year, month, 1);
    const startDayOfWeek = startDate.getDay();
    const calendarStartDate = new Date(startDate);
    calendarStartDate.setDate(startDate.getDate() - startDayOfWeek);
    
    const weeks: CalendarDay[][] = [];
    let currentDay = new Date(calendarStartDate);

    for (let w = 0; w < 6; w++) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dateString = currentDay.toISOString().split('T')[0];
        const workingEmployees = employees
          .map(emp => ({
            employee: emp,
            shiftCode: schedule[emp.id]?.[dateString] || 'N/A'
          }))
          .filter(item => item.shiftCode !== 'Libre' && item.shiftCode !== 'N/A');

        week.push({
          date: new Date(currentDay),
          isCurrentMonth: currentDay.getMonth() === month,
          workingEmployees: workingEmployees
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }
}