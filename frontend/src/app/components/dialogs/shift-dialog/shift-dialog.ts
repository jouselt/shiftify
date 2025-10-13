import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Shift } from '@pro-schedule-manager/interfaces';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-shift-dialog',
  standalone: false,
  templateUrl: './shift-dialog.html',
  styleUrl: './shift-dialog.css'
})
export class ShiftDialog implements OnInit {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ShiftDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { shift: Shift }
  ) {
    this.isEditMode = !!data.shift;
    this.form = this.fb.group({
      shiftCode: [this.data.shift?.shiftCode || '', Validators.required],
      category: [this.data.shift?.category || 'Morning', Validators.required],
      startTime: [this.data.shift?.startTime || '07:00', Validators.required],
      endTime: [this.data.shift?.endTime || '15:30', Validators.required],
      hoursWorked: [{ value: this.data.shift?.hoursWorked || 8, disabled: true }, Validators.required],
      color: [this.data.shift?.color || '#C6EFCE', Validators.required],
    });
  }

  ngOnInit(): void {
    this.form.get('startTime')?.valueChanges.pipe(debounceTime(300)).subscribe(() => this.calculateHours());
    this.form.get('endTime')?.valueChanges.pipe(debounceTime(300)).subscribe(() => this.calculateHours());
  }

  calculateHours(): void {
    const start = this.form.get('startTime')?.value;
    const end = this.form.get('endTime')?.value;
    if (start && end) {
      const startDate = new Date(`1970-01-01T${start}:00`);
      let endDate = new Date(`1970-01-01T${end}:00`);

      if (endDate < startDate) { // Handles overnight shifts
        endDate.setDate(endDate.getDate() + 1);
      }

      let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // Difference in hours
      if (diff > 4) {
        diff -= 0.5; // Subtract 30-minute break for shifts longer than 4 hours
      }
      this.form.get('hoursWorked')?.setValue(parseFloat(diff.toFixed(1)));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      // Re-enable hoursWorked to include it in the form value
      this.form.get('hoursWorked')?.enable();
      this.dialogRef.close(this.form.value);
    }
  }
}