import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Employee, GeneratedSchedule, Shift } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';
import { MatDialog } from '@angular/material/dialog';
import { AddShiftDialog } from '@pro-schedule-manager/components/dialogs/add-shift-dialog/add-shift-dialog';
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
  private employeeList: Employee[] = [];
  private shiftList: Shift[] = [];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.apiService.getEmployees(1).subscribe(employees => {
      this.employeeList = employees;
    });

    // Fetch shifts and store them immediately.
    // Ensure this subscription happens.
    this.apiService.getShifts().subscribe(shifts => {
      this.shiftList = shifts;
    });

    // shiftsMap$ is still useful for the template's color lookup
    this.shiftsMap$ = of(this.shiftList).pipe( // Use the stored list
      map(shiftsArray => new Map(shiftsArray.map(s => [s.shiftCode, s])))
    );


    const schedule$ = this.displayMonth.pipe(
      switchMap(date => {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        // Use combineLatest to ensure employees are available before generating schedule
        return combineLatest([
          of(this.employeeList), // Use stored list
          this.apiService.generateSchedule(1, month, year)
        ]);
      }),
      // Now map receives [employees, schedule]
      map(([employees, schedule]) => 
        this.generateCalendar(this.displayMonth.getValue(), employees, schedule)
      
      )
    );

    // Assign to calendarWeeks$
    this.calendarWeeks$ = schedule$;
    this.displayMonth.next(this.displayMonth.getValue()); // Refresh

  }

  changeMonth(offset: number): void {
    const newDate = this.displayMonth.getValue();
    newDate.setMonth(newDate.getMonth() + offset);
    this.displayMonth.next(newDate);
  }

  assignDayOff(employeeId: number, date: Date): void {
    const dateString = date.toISOString().split('T')[0];
    this.apiService.updateScheduleDay(employeeId, dateString, 'Libre').subscribe({
      next: (response) => {
        if (response.success) {
          this.displayMonth.next(this.displayMonth.getValue()); // Refresh
        } else { console.error('Backend failed to update schedule.'); }
      },
      error: (err) => console.error('API error while updating schedule', err)
    });
  }

  openAddShiftDialog(date: Date): void {
    // Check if lists are populated, fetch if necessary (fallback)
    if (this.employeeList.length === 0 || this.shiftList.length === 0) {
      console.warn("Employee or Shift list not yet populated, attempting fetch...");
      // Ideally, handle this case more gracefully, maybe disable the button until loaded
      // For now, just log and proceed, the dialog might be empty initially.
    }

    const dialogRef = this.dialog.open(AddShiftDialog, {
      width: '400px',
      data: {
        // Pass the stored lists to the dialog
        employees: this.employeeList,
        shifts: this.shiftList
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.employeeId && result.shiftCode) {
        const dateString = date.toISOString().split('T')[0];
        this.apiService.updateScheduleDay(result.employeeId, dateString, result.shiftCode).subscribe({
          next: (response) => {
            if (response.success) {
              // Trigger a refresh ONLY by re-emitting the month.
              // Avoid calling generateSchedule directly here.
              this.displayMonth.next(new Date(this.displayMonth.getValue()));
            } else { console.error('Backend failed to add shift.'); }
          },
          error: (err) => console.error('API error while adding shift', err)
        });
      }
    });
  }

  private generateCalendar(
    date: Date,
    employees: Employee[],
    schedule: GeneratedSchedule | null
  ): CalendarDay[][] {

    if (!schedule) {
      return Array(6).fill(null).map(() => Array(7).fill({
        date: new Date(), // Placeholder date
        isCurrentMonth: false,
        workingEmployees: []
      }));
    }

    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const startDayOfWeek = startDate.getDay(); // 0 = Sunday
    const calendarStartDate = new Date(startDate);
    calendarStartDate.setDate(startDate.getDate() - startDayOfWeek);

    const weeks: CalendarDay[][] = [];
    let currentDay = new Date(calendarStartDate);

    for (let w = 0; w < 6; w++) { // Display 6 weeks for consistency
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dateString = currentDay.toISOString().split('T')[0];
        // Filter employees working on this day (excluding 'Libre')
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
      // Stop if the next week is entirely in the next month (optimization)
      if (currentDay.getMonth() !== month && w >= 4) {
        // Check if we already have enough weeks to cover the end date.
        const lastDateInGrid = week[6].date;
        const lastDayOfMonth = new Date(year, month + 1, 0);
        if (lastDateInGrid >= lastDayOfMonth) break;
      }
    }

    return weeks;
  }
}