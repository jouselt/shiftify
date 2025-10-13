import { Pipe, PipeTransform } from '@angular/core';
import { GeneratedSchedule } from '@pro-schedule-manager/interfaces';

@Pipe({
  name: 'getShift',
  standalone: false
})
export class GetShiftPipe implements PipeTransform {

  transform(schedule: GeneratedSchedule | null, employeeId: number, date: Date): string {
    if (!schedule || !schedule[employeeId]) {
      return '--';
    }
    
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    return schedule[employeeId][dateString] || '--';
  }
}