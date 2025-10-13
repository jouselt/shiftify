// In libs/interfaces/src/shift.interface.ts

export interface Shift {
    shiftCode: string;
    category: 'Morning' | 'Afternoon' | 'Night' | 'Custom' | 'Off';
    startTime: string; // Format "HH:mm"
    endTime: string;   // Format "HH:mm"
    hoursWorked: number;
    color: string;     // Hex color code e.g., "#C6EFCE"
  }