import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { Employee } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';
import { I18nService } from '@pro-schedule-manager/services/i18n';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeDialogComponent } from '@pro-schedule-manager/components/dialogs/employee-dialog/employee-dialog';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.html',
  standalone: false,
  styleUrls: ['./employees.css']
})
export class EmployeesComponent implements OnInit {
  // Use a BehaviorSubject to easily refresh the list after a change
  private refresh = new BehaviorSubject<void>(undefined);
  employees$ = this.refresh.pipe(
    switchMap(() => this.apiService.getEmployees())
  );

  constructor(
    private apiService: ApiService,
    public i18n: I18nService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  openEmployeeDialog(employee?: Employee): void {
    const dialogRef = this.dialog.open(EmployeeDialogComponent, {
      width: '400px',
      data: { employee: employee || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (employee) { // Editing existing employee
          this.apiService.updateEmployee(employee.id, result).subscribe(() => this.refresh.next());
        } else { // Adding new employee
          this.apiService.addEmployee(result).subscribe(() => this.refresh.next());
        }
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete ${employee.employeeName}?`)) {
      this.apiService.deleteEmployee(employee.id).subscribe(() => this.refresh.next());
    }
  }
}