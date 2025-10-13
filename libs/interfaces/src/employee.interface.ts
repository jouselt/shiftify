// In libs/interfaces/src/employee.interface.ts

export interface Employee {
    id: number;
    employeeName: string;
    title: string;
    type: 'Manager' | 'Crew';
    contractHours: number;
    homeStoreId: number;
}