// In libs/interfaces/src/schedule.interface.ts

import { Employee, Shift } from '.';

export interface ShiftRequirement {
  shiftCode: string;
  count: number;
  type: 'Manager' | 'Crew';
}

export interface ScheduleTemplate {
  // Key is day of week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
  dailyRequirements: { [dayOfWeek: number]: ShiftRequirement[] };
}

// This will be the output structure for our generated schedule
export interface GeneratedSchedule {
  [employeeId: number]: {
    [date: string]: string; // e.g., { '2025-11-01': 'AM8', '2025-11-02': 'Libre' }
  };
}