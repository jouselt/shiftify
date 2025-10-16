import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { Employee, Shift, Store } from '@pro-schedule-manager/interfaces';
import { CreateShiftDto } from 'src/schedule/dto/create-shift.dto';
import { CreateEmployeeDto } from 'src/schedule/dto/create-employee.dto';
import { UpdateShiftDto } from 'src/schedule/dto/update-shift.dto';

@Injectable()
export class DataService implements OnModuleInit {

  private readonly logger = new Logger(DataService.name);

  // These will hold our "in-memory database"
  private _employees: Employee[] = [];
  private _shifts: Shift[] = [];
  private _stores: Store[] = [];

  // This lifecycle hook runs once the module has been initialized.
  async onModuleInit() {
    this.logger.log('Initializing Data Service and loading data from CSVs...');
    await this.loadStores();
    await this.loadShifts();
    await this.loadEmployees();
    this.logger.log('Data loading complete.');
  }

  // --- Public getters to access the data ---
  get employees(): Employee[] {
    return this._employees;
  }

  get shifts(): Shift[] {
    return this._shifts;
  }

  get stores(): Store[] {
    return this._stores;
  }

  // --- Private methods to load data from files ---

  private async loadStores() {
    // For now, we'll hardcode the stores as per the requirements.
    this._stores = [
      { id: 1, name: 'Rotonda' },
      { id: 2, name: 'Nacional 1' },
      { id: 3, name: 'Nacional 2' },
    ];
  }

  private async loadShifts() {
    try {
      const csvPath = path.join(__dirname, '..', 'data', 'shifts.csv');
      const fileContent = await fs.readFile(csvPath);

      this._shifts = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          if (context.column === 'hoursWorked') {
            return parseFloat(value);
          }
          return value;
        },
      });

      this.logger.log(`Successfully loaded ${this._shifts.length} shifts.`);
    } catch (error) {
      this.logger.error('Failed to load shifts.csv', error);
      this._shifts = [];
    }
  }

  private async loadEmployees() {
    try {
      const csvPath = path.join(__dirname, '..', 'data', 'employee.csv');
      const fileContent = await fs.readFile(csvPath);

      let idCounter = 1;
      this._employees = parse(fileContent, {
        columns: (header) => header.map(h => h.replace(/\s+/g, '')), // Remove spaces from headers
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          if (context.column === 'ContractHours') {
            return parseInt(value, 10);
          }
          return value;
        },
      }).map((record: any) => ({
        id: idCounter++,
        employeeName: record.EmployeeName,
        title: record.Title,
        type: record.Type,
        contractHours: record.ContractHours,
        // For now, assign all employees to Store 1 for simplicity
        homeStoreId: 1,
      }));

      this.logger.log(`Successfully loaded ${this._employees.length} employees.`);
    } catch (error) {
      this.logger.error('Failed to load employee.csv', error);
      this._employees = [];
    }
  }

  createEmployee(employeeData: CreateEmployeeDto): Employee {
    const newId = this._employees.length > 0 ? Math.max(...this._employees.map(e => e.id)) + 1 : 1;
    const newEmployee: Employee = {
      id: newId,
      homeStoreId: 1, // Default to store 1 for now
      ...employeeData,
    };
    this._employees.push(newEmployee);
    this.logger.log(`Created new employee: ${newEmployee.employeeName}`);
    return newEmployee;
  }

  updateEmployee(id: number, employeeData: Partial<CreateEmployeeDto>): Employee | null {
    const employeeIndex = this._employees.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      return null;
    }
    const updatedEmployee = { ...this._employees[employeeIndex], ...employeeData };
    this._employees[employeeIndex] = updatedEmployee;
    this.logger.log(`Updated employee with ID: ${id}`);
    return updatedEmployee;
  }

  deleteEmployee(id: number): { success: boolean } {
    const initialLength = this._employees.length;
    this._employees = this._employees.filter(e => e.id !== id);
    if (this._employees.length < initialLength) {
      this.logger.log(`Deleted employee with ID: ${id}`);
      return { success: true };
    }
    return { success: false };
  }


  createShift(shiftData: CreateShiftDto): Shift {
    // Check for duplicates
    if (this._shifts.some(s => s.shiftCode === shiftData.shiftCode)) {
      // In a real app, you'd throw a BadRequestException here
      this.logger.warn(`Attempted to create a duplicate shift with code: ${shiftData.shiftCode}`);
      return this._shifts.find(s => s.shiftCode === shiftData.shiftCode)!;
    }
    const newShift: Shift = { ...shiftData };
    this._shifts.push(newShift);
    this._shifts.sort((a, b) => a.shiftCode.localeCompare(b.shiftCode)); // Keep the list sorted
    this.logger.log(`Created new shift: ${newShift.shiftCode}`);
    return newShift;
  }

  updateShift(shiftCode: string, shiftData: UpdateShiftDto): Shift | null {
    const shiftIndex = this._shifts.findIndex(s => s.shiftCode === shiftCode);
    if (shiftIndex === -1) {
      return null;
    }
    const updatedShift = { ...this._shifts[shiftIndex], ...shiftData };
    this._shifts[shiftIndex] = updatedShift;
    this.logger.log(`Updated shift with code: ${shiftCode}`);
    return updatedShift;
  }

  deleteShift(shiftCode: string): { success: boolean } {
    const initialLength = this._shifts.length;
    this._shifts = this._shifts.filter(s => s.shiftCode !== shiftCode);
    if (this._shifts.length < initialLength) {
      this.logger.log(`Deleted shift with code: ${shiftCode}`);
      return { success: true };
    }
    return { success: false };
  }

  getStatus(): { hasData: boolean } {
    const hasData = this._employees.length > 0 && this._shifts.length > 0;
    return { hasData };
  }
  async loadEmployeesFromUpload(fileBuffer: Buffer): Promise<{ success: boolean }> {
    try {
      // We reuse the same parsing logic from onModuleInit, but with the uploaded buffer
      let idCounter = 1;
      this._employees = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          if (context.column === 'Contract Hours') {
            return parseInt(value, 10);
          }
          return value;
        },
      }).map((record: any) => ({
        id: idCounter++,
        employeeName: record['Employee Name'],
        title: record.Title,
        type: record.Type,
        contractHours: record['Contract Hours'],
        // For now, assign all employees to Store 1 for simplicity
        homeStoreId: 1,
      }));

      // We also write the file to disk to persist it for the next server restart
      const filePath = path.join(__dirname, '..', 'data', 'employee.csv');
      await fs.writeFile(filePath, fileBuffer);

      this.logger.log(`Successfully loaded ${this._employees.length} employees from upload.`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to load employees from upload.', error);
      return { success: false };
    }
  }

  async loadShiftsFromUpload(fileBuffer: Buffer): Promise<{ success: boolean }> {
    try {
      // Reuse the parsing logic from loadShifts, including header renaming
      this._shifts = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          if (context.column === 'Hours Worked') {
            return parseFloat(value);
          }
          return value;
        },
        // Rename headers to match our Shift interface
        on_record: (record) => {
          record.shiftCode = record['Shift Code'];
          record.startTime = record['Start Time'];
          record.endTime = record['End Time'];
          record.category = record['Category']
          record.hoursWorked = record['Hours Worked'];
          record.color = record['Color']
          delete record['Shift Code'];
          delete record['Start Time'];
          delete record['End Time'];
          delete record['Hours Worked'];
          delete record['Color'];
          delete record['Category'];
          return record;
        }
      });

      // Write the file to disk to persist it
      const filePath = path.join(__dirname, '..', 'data', 'shifts.csv');
      await fs.writeFile(filePath, fileBuffer);

      this.logger.log(`Successfully loaded ${this._shifts.length} shifts from upload.`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to load shifts from upload.', error);
      return { success: false };
    }
  }
}