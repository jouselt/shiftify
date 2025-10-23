
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, combineLatest, of, switchMap } from 'rxjs';
import { ApiService } from '@pro-schedule-manager/services/api';
import { Employee, Shift, GeneratedSchedule } from '@pro-schedule-manager/interfaces';
import { I18nService } from '@pro-schedule-manager/services/i18n';
import { MatDialog } from '@angular/material/dialog';
import { SelectShiftDialogComponent } from '@pro-schedule-manager/components/dialogs/select-shift-dialog/select-shift-dialog';

interface TimelineSlot {
  time: string;
  employees: {
    employee: Employee;
    shiftCode: string;
  }[];
}

@Component({
  selector: 'app-day',
  standalone: false,
  templateUrl: './day.html',
  styleUrls: ['./day.css']
})
export class DayComponent implements OnInit {
  timeline$!: Observable<TimelineSlot[]>;
  shiftsMap$!: Observable<Map<string, Shift>>;
  selectedDate!: string;
  employees$!: Observable<Employee[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    public i18n: I18nService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.shiftsMap$ = this.apiService.getShifts().pipe(
      map(shiftsArray => new Map(shiftsArray.map(s => [s.shiftCode, s])))
    );

    // This is the main reactive stream for the component
    const data$ = this.route.paramMap.pipe(
      switchMap(params => {
        const dateParam = params.get('date');
        if (!dateParam) return of(null);

        this.selectedDate = dateParam;
        const year = parseInt(dateParam.split('-')[0]);
        const month = parseInt(dateParam.split('-')[1]);

        // Fetch all necessary data in parallel
        return combineLatest({
          schedule: this.apiService.generateSchedule(1, month, year),
          allEmployees: this.apiService.getEmployees(1),
          shiftsMap: this.shiftsMap$
        });
      })
    );

    // Stream for employees who are actually working on the selected day
    this.employees$ = data$.pipe(
      map(data => {
        if (!data || !data.schedule) return [];
        return data.allEmployees.filter(emp => {
          const shiftCode = data.schedule![emp.id]?.[this.selectedDate];
          return shiftCode && shiftCode !== 'Libre';
        });
      })
    );

    // Stream to build the final timeline structure
    this.timeline$ = data$.pipe(
      map(data => {
        if (!data || !data.schedule) return [];
        const { schedule, allEmployees, shiftsMap } = data;
        const timeSlots = this.generateTimeSlots();

        return timeSlots.map(time => {
          const workingItems = allEmployees
            .map(emp => ({
              employee: emp,
              shiftCode: schedule[emp.id]?.[this.selectedDate] || 'N/A'
            }))
            .filter(item => {
              if (item.shiftCode === 'Libre' || item.shiftCode === 'N/A') return false;
              const shift = shiftsMap.get(item.shiftCode);
              if (!shift) return false;
              return time >= shift.startTime && time < shift.endTime;
            });
          return { time, employees: workingItems };
        });
      })
    );
  }

  onDateChange(event: Event) {
    const newDate = (event.target as HTMLInputElement).value;
    this.router.navigate(['/day', newDate]);
  }

  private generateTimeSlots(): string[] {
    const slots = [];
    for (let i = 7; i <= 23; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }

  isEmployeeWorking(employee: Employee, slot: TimelineSlot): boolean {
    return slot.employees.some(item => item.employee.id === employee.id);
  }

  getShiftForEmployee(employeeId: number, timeline: TimelineSlot[]): string {
    for (const slot of timeline) {
      const item = slot.employees.find(e => e.employee.id === employeeId);
      if (item) {
        return item.shiftCode;
      }
    }
    return '';
  }
  openShiftSelectionDialog(employeeId: number, currentShiftCode: string): void {
    if (!this.selectedDate) return; // Ensure date is selected

    const dialogRef = this.dialog.open(SelectShiftDialogComponent, {
      width: '350px',
      data: { currentShiftCode: currentShiftCode }
    });

    dialogRef.afterClosed().subscribe(newShiftCode => {
      if (newShiftCode && newShiftCode !== currentShiftCode) {
        this.apiService.updateScheduleDay(employeeId, this.selectedDate, newShiftCode).subscribe({
          next: (res) => {
            if (res.success) {
              // Refresh the view by re-navigating (forces ngOnInit to re-run)
              // This is a simple way to refresh the data for now
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/day', this.selectedDate]);
              });
            } else {
              console.error("Failed to update shift on backend");
            }
          },
          error: (err) => console.error("Error updating shift", err)
        });
      }
    });
  }
}