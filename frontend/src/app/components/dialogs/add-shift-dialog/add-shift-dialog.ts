import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Employee, Shift } from '@pro-schedule-manager/interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-add-shift-dialog',
  standalone: false,
  templateUrl: './add-shift-dialog.html',
  styleUrl: './add-shift-dialog.css'
})
export class AddShiftDialog implements OnInit{
  form: FormGroup;
  employees: Employee[];
  shifts: Shift[];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddShiftDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { employees: Employee[], shifts: Shift[] }
  ) {
    this.employees = data.employees;
    // Filter out the 'Libre' shift as it doesn't make sense to assign it manually here
    this.shifts = data.shifts;

    this.form = this.fb.group({
      employeeId: ['', Validators.required],
      shiftCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value); // Return { employeeId, shiftCode }
    }
  }
}