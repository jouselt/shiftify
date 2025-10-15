import { Pipe, PipeTransform } from '@angular/core';
import { GeneratedSchedule, Shift } from '@pro-schedule-manager/interfaces';

@Pipe({
  name: 'calculateWeeklyHours'
})
export class CalculateWeeklyHoursPipe implements PipeTransform {
  transform(
    schedule: GeneratedSchedule | null, 
    employeeId: number, 
    weekDates: Date[] | null, 
    shiftsMap: Map<string, Shift> | null
  ): number {
    if (!schedule || !weekDates || !shiftsMap) {
      return 0;
    }

    let totalHours = 0;
    for (const date of weekDates) {
      const dateString = date.toISOString().split('T')[0];
      const shiftCode = schedule[employeeId]?.[dateString];
      if (shiftCode) {
        const shift = shiftsMap.get(shiftCode);
        if (shift) {
          totalHours += shift.hoursWorked;
        }
      }
    }
    return totalHours;
  }
}
