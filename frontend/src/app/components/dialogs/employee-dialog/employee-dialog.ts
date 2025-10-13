import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Employee } from '@pro-schedule-manager/interfaces';

@Component({
  selector: 'app-employee-dialog',
  standalone: false,
  templateUrl: './employee-dialog.html',
  styleUrl: './employee-dialog.css'
})
export class EmployeeDialogComponent {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: Employee }
  ) {
    this.isEditMode = !!data.employee;
    this.form = this.fb.group({
      employeeName: [this.data.employee?.employeeName || '', Validators.required],
      title: [this.data.employee?.title || '', Validators.required],
      type: [this.data.employee?.type || 'Crew', Validators.required],
      contractHours: [this.data.employee?.contractHours || 30, [Validators.required, Validators.min(1)]],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
