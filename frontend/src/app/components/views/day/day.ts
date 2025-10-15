
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, combineLatest, of, switchMap } from 'rxjs';
import { ApiService } from '@pro-schedule-manager/services/api';
import { Employee, Shift, GeneratedSchedule } from '@pro-schedule-manager/interfaces';
import { I18nService } from '@pro-schedule-manager/services/i18n';

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
  ) { }

  ngOnInit(): void {
    this.employees$ = this.apiService.getEmployees(1);
    this.shiftsMap$ = this.apiService.getShifts().pipe(
      map(shiftsArray => new Map(shiftsArray.map(s => [s.shiftCode, s])))
    );

    this.employees$ = this.route.paramMap.pipe(
      switchMap(params => {
        const dateParam = params.get('date');
        if (!dateParam) return of([]);

        const year = parseInt(dateParam.split('-')[0]);
        const month = parseInt(dateParam.split('-')[1]);

        return combineLatest([
          this.apiService.getEmployees(1),
          this.apiService.generateSchedule(1, month, year)
        ]).pipe(
          map(([allEmployees, schedule]) => {
            if (!schedule) return [];
            // Filter the employee list to only include those working today
            return allEmployees.filter(emp => {
              const shiftCode = schedule[emp.id]?.[dateParam];
              return shiftCode && shiftCode !== 'Libre';
            });
          })
        );
      })
    );

    this.timeline$ = combineLatest([
      this.route.paramMap,
      this.employees$,
      this.shiftsMap$
    ]).pipe(
      switchMap(([params, employees, shiftsMap]) => {
        const dateParam = params.get('date');
        if (!dateParam) return of([]);

        this.selectedDate = dateParam;
        const year = parseInt(dateParam.split('-')[0]);
        const month = parseInt(dateParam.split('-')[1]);

        return this.apiService.generateSchedule(1, month, year).pipe(
          map(schedule => {
            if (!schedule) return [];
            const timeSlots = this.generateTimeSlots();

            return timeSlots.map(time => {
              const workingItems = employees
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
}