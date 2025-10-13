import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, GeneratedSchedule, Shift, Store } from '@pro-schedule-manager/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // The base URL of our NestJS backend API
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Fetches the list of all stores.
   */
  getStores(): Observable<Store[]> {
    return this.http.get<Store[]>(`${this.apiUrl}/data/stores`);
  }

  /**
   * Fetches the list of all shift definitions.
   */
  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${this.apiUrl}/data/shifts`);
  }

  /**
   * Fetches employees. Can be filtered by storeId.
   * @param storeId (Optional) The ID of the store to filter employees by.
   */
  getEmployees(storeId?: number): Observable<Employee[]> {
    let params = new HttpParams();
    if (storeId) {
      params = params.append('storeId', storeId.toString());
    }
    console.log('params', params);

    return this.http.get<Employee[]>(`${this.apiUrl}/data/employees`, { params });
  }

  /**
 * Calls the backend to generate a new monthly schedule.
 * @param storeId The ID of the store.
 * @param month The month (1-12).
 * @param year The year.
 */
  generateSchedule(storeId: number, month: number, year: number): Observable<GeneratedSchedule> {
    const body = { storeId, month, year };
    return this.http.post<GeneratedSchedule>(`${this.apiUrl}/schedule/generate`, body);
  }
  // Add this method to your ApiService class

  /**
   * Updates a single day in the schedule for a specific employee.
   * @param employeeId The ID of the employee to update.
   * @param date The date string in "YYYY-MM-DD" format.
   * @param shiftCode The new shift code to assign (e.g., "Libre").
   */
  updateScheduleDay(employeeId: number, date: string, shiftCode: string): Observable<{ success: boolean }> {
    const body = { employeeId, date, shiftCode };
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/schedule/day`, body);
  }

  // --- Employee CRUD ---
  addEmployee(employeeData: Omit<Employee, 'id' | 'homeStoreId'>): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/data/employees`, employeeData);
  }

  updateEmployee(id: number, employeeData: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/data/employees/${id}`, employeeData);
  }

  deleteEmployee(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/data/employees/${id}`);
  }
  // --- Shift CRUD ---
  addShift(shiftData: Omit<Shift, 'shiftCode'> & { shiftCode: string }): Observable<Shift> {
    return this.http.post<Shift>(`${this.apiUrl}/data/shifts`, shiftData);
  }

  updateShift(code: string, shiftData: Partial<Shift>): Observable<Shift> {
    return this.http.put<Shift>(`${this.apiUrl}/data/shifts/${code}`, shiftData);
  }

  deleteShift(code: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/data/shifts/${code}`);
  }
}