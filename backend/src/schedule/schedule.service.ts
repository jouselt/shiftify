import { Injectable, Logger } from '@nestjs/common';
import { DataService } from '../data/data.service';
import {
  GeneratedSchedule,
  ScheduleTemplate,
  Employee,
  Shift,
} from '@pro-schedule-manager/interfaces';

type EmployeeStat = {
  id: number;
  hoursWorked: number;
  lastSundayWorked: Date | null;
};

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  private lastGeneratedSchedule: GeneratedSchedule | null = null;
  // Hardcoded schedule template for a single store
  private readonly scheduleTemplate: ScheduleTemplate = {
    dailyRequirements: {
      // Sunday (Day 0) - Busiest Day
      0: [
        { shiftCode: 'AM10', count: 1, type: 'Manager' },
        { shiftCode: 'AM8', count: 2, type: 'Crew' },
        { shiftCode: 'PM10', count: 1, type: 'Manager' },
        { shiftCode: 'PM8', count: 2, type: 'Crew' },
        { shiftCode: 'Noche8', count: 1, type: 'Crew' },
      ],
      // Monday to Thursday (Days 1-4) - Regular Days
      1: [{ shiftCode: 'AM8', count: 1, type: 'Manager' }, { shiftCode: 'PM8', count: 1, type: 'Manager' }, { shiftCode: 'Noche8', count: 1, type: 'Crew' }],
      2: [{ shiftCode: 'AM8', count: 1, type: 'Manager' }, { shiftCode: 'PM8', count: 1, type: 'Manager' }, { shiftCode: 'Noche8', count: 1, type: 'Crew' }],
      3: [{ shiftCode: 'AM8', count: 1, type: 'Manager' }, { shiftCode: 'PM8', count: 1, type: 'Manager' }, { shiftCode: 'Noche8', count: 1, type: 'Crew' }],
      4: [{ shiftCode: 'AM8', count: 1, type: 'Manager' }, { shiftCode: 'PM8', count: 1, type: 'Manager' }, { shiftCode: 'Noche8', count: 1, type: 'Crew' }],
      // Friday & Saturday (Days 5-6) - Busy Days
      5: [
        { shiftCode: 'AM10', count: 1, type: 'Manager' },
        { shiftCode: 'AM8', count: 1, type: 'Crew' },
        { shiftCode: 'PM10', count: 1, type: 'Manager' },
        { shiftCode: 'PM8', count: 1, type: 'Crew' },
        { shiftCode: 'Noche10', count: 1, type: 'Crew' },
      ],
      6: [
        { shiftCode: 'AM10', count: 1, type: 'Manager' },
        { shiftCode: 'AM8', count: 2, type: 'Crew' },
        { shiftCode: 'PM10', count: 1, type: 'Manager' },
        { shiftCode: 'PM8', count: 2, type: 'Crew' },
        { shiftCode: 'Noche8', count: 1, type: 'Crew' },
      ],
    },
  };

  constructor(private readonly dataService: DataService) { }

  /**
   * Main generation method
   */
  generateMonthlySchedule(
    storeId: number,
    month: number, // 1-12
    year: number,
  ): GeneratedSchedule {
    this.logger.log(`Starting schedule generation for store ${storeId}, month ${month}/${year}...`);

    const employeesForStore = this.dataService.employees.filter(
      (emp) => emp.homeStoreId === storeId
    );
    const allShifts = this.dataService.shifts;
    const dates = this.getDatesInMonth(month - 1, year);

    // --- Initialize Data Structures ---
    const generatedSchedule: GeneratedSchedule = {};
    const employeeStats: Record<number, EmployeeStat> = {};

    // Initialize structures for each employee
    for (const emp of employeesForStore) {
      generatedSchedule[emp.id] = {};
      employeeStats[emp.id] = {
        id: emp.id,
        hoursWorked: 0,
        lastSundayWorked: null,
      };
      // Initialize all days to "Libre" (Off)
      for (const date of dates) {
        generatedSchedule[emp.id][this.formatDate(date)] = 'Libre';
      }
    }

    // --- NEW: Identify the Main Manager (Gerente) ---
    const mainManager = employeesForStore.find(emp => emp.title === 'Gerente');
    const amShift = allShifts.find(s => s.shiftCode === 'AM8');

    // --- Core Monthly Loop ---
    for (const date of dates) {
      const dayOfWeek = date.getDay();
      const dateString = this.formatDate(date);
      const requirements = this.scheduleTemplate.dailyRequirements[dayOfWeek] || [];
      const assignedToday = new Set<number>(); // Track who has already been assigned a shift today

      // Apply Main Manager Rule
      if (mainManager && amShift && dayOfWeek >= 1 && dayOfWeek <= 5) {
        this.assignShiftToEmployee(mainManager, amShift, date, generatedSchedule, employeeStats);
        assignedToday.add(mainManager.id);
      }

      // --- Main Assignment Loop for all other requirements ---
      for (const req of requirements) {
        let assignedCount = 0;

        while (assignedCount < req.count) {
          // 1. Find all available employees who match the required type
          let candidates = employeesForStore.filter(
            emp =>
              emp.type === req.type &&           // Matches Manager/Crew
              emp.title !== 'Gerente' &&         // Exclude the Main Manager
              !assignedToday.has(emp.id)       // Not already working today
          );

          // 2. Filter candidates based on our rules
          candidates = candidates.filter(candidate => {
            // Rule: Every Other Sunday
            if (dayOfWeek === 0) { // It's a Sunday
              if (candidate.id in employeeStats && employeeStats[candidate.id].lastSundayWorked) {
                const lastSunday = employeeStats[candidate.id].lastSundayWorked!;
                const diffDays = Math.ceil((date.getTime() - lastSunday.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 7) {
                  return false; // Worked last Sunday, not eligible
                }
              }
            }

            // Rule: Minimum Rest Period (to be implemented)
            // For now, we'll assume it's met. This is a complex check for a later step.

            return true;
          });

          // 3. Prioritize and select the best candidate
          if (candidates.length > 0) {
            // Simple prioritization: choose the one with the fewest hours worked so far
            candidates.sort((a, b) => employeeStats[a.id].hoursWorked - employeeStats[b.id].hoursWorked);
            const bestCandidate = candidates[0];
            const shiftToAssign = allShifts.find(s => s.shiftCode === req.shiftCode);

            if (bestCandidate && shiftToAssign) {
              this.assignShiftToEmployee(bestCandidate, shiftToAssign, date, generatedSchedule, employeeStats);
              assignedToday.add(bestCandidate.id);
            }
          } else {
            this.logger.warn(`No candidates found for a ${req.type} on ${dateString} for shift ${req.shiftCode}`);
          }
          assignedCount++;
        }
      }
    }
    this.logger.log('Schedule generation finished.');

    // --- NEW: Store the generated schedule before returning it ---
    this.lastGeneratedSchedule = generatedSchedule;
    return this.lastGeneratedSchedule;
  }

  // --- Helper Functions ---

  private assignShiftToEmployee(
    employee: Employee,
    shift: Shift,
    date: Date,
    schedule: GeneratedSchedule,
    stats: Record<number, EmployeeStat>
  ) {
    const dateString = this.formatDate(date);
    schedule[employee.id][dateString] = shift.shiftCode;
    stats[employee.id].hoursWorked += shift.hoursWorked;

    // If today is Sunday, update the lastSundayWorked stat
    if (date.getDay() === 0) {
      stats[employee.id].lastSundayWorked = date;
    }
  }

  private getDatesInMonth(month: number, year: number): Date[] {
    const date = new Date(year, month, 1);
    const dates: Date[] = [];
    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  updateDayForEmployee(
    updateDto: { employeeId: number, date: string, shiftCode: string }
  ): { success: boolean, message?: string } {
    const { employeeId, date, shiftCode } = updateDto;

    if (!this.lastGeneratedSchedule) {
      this.logger.error('Cannot update day: No schedule has been generated yet.');
      return { success: false, message: 'No schedule generated.' };
    }

    if (!this.lastGeneratedSchedule[employeeId] || this.lastGeneratedSchedule[employeeId][date] === undefined) {
      this.logger.error(`Cannot update day: Employee ${employeeId} or date ${date} not found in schedule.`);
      return { success: false, message: 'Employee or date not found.' };
    }

    this.logger.log(`Updating employee ${employeeId} on ${date} to shift ${shiftCode}.`);
    this.lastGeneratedSchedule[employeeId][date] = shiftCode;

    return { success: true };
  }
}