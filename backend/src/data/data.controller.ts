
import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Body, Delete, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { DataService } from './data.service';
import { Employee, Shift, Store } from '@pro-schedule-manager/interfaces';
import { CreateEmployeeDto } from 'src/schedule/dto/create-employee.dto';
import { CreateShiftDto } from 'src/schedule/dto/create-shift.dto';
import { UpdateShiftDto } from 'src/schedule/dto/update-shift.dto';

@Controller('data') // All routes in this controller will be prefixed with /data
export class DataController {
  constructor(private readonly dataService: DataService) { }

  @Get('stores') // Handles GET requests to /api/data/stores
  getStores(): Store[] {
    return this.dataService.stores;
  }

  @Get('shifts') // Handles GET requests to /api/data/shifts
  getShifts(): Shift[] {
    return this.dataService.shifts;
  }

  @Get('employees') // Handles GET requests to /api/data/employees
  getEmployees(
    @Query('storeId') storeId?: string,
  ): Employee[] {
    const allEmployees = this.dataService.employees;

    // If a storeId query parameter is provided, filter the results
    if (storeId) {
      const storeIdNumber = parseInt(storeId, 10);
      return allEmployees.filter(emp => emp.homeStoreId === storeIdNumber);
    }

    // Otherwise, return all employees
    return allEmployees;
  }
  @Post('employees')
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto): Employee {
    return this.dataService.createEmployee(createEmployeeDto);
  }

  @Put('employees/:id')
  updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateEmployeeDto>,
  ): Employee {
    const employee = this.dataService.updateEmployee(id, updateData);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }
    return employee;
  }

  @Delete('employees/:id')
  deleteEmployee(@Param('id', ParseIntPipe) id: number): { success: boolean } {
    return this.dataService.deleteEmployee(id);
  }


  // --- Shift Endpoints ---
  @Post('shifts')
  createShift(@Body() createShiftDto: CreateShiftDto): Shift {
    return this.dataService.createShift(createShiftDto);
  }

  @Put('shifts/:code')
  updateShift(
    @Param('code') code: string,
    @Body() updateData: UpdateShiftDto,
  ): Shift {
    const shift = this.dataService.updateShift(code, updateData);
    if (!shift) {
      throw new NotFoundException(`Shift with code ${code} not found.`);
    }
    return shift;
  }

  @Delete('shifts/:code')
  deleteShift(@Param('code') code: string): { success: boolean } {
    const result = this.dataService.deleteShift(code);
    if (!result.success) {
      throw new NotFoundException(`Shift with code ${code} not found.`);
    }
    return result;
  }
}