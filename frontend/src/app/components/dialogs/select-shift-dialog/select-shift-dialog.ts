import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Shift } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';

@Component({
  selector: 'app-select-shift-dialog',
  standalone: false,
  templateUrl: './select-shift-dialog.html',
  styleUrl: './select-shift-dialog.css',
})
export class SelectShiftDialogComponent implements OnInit {
  shifts$!: Observable<Shift[]>;
  selectedShiftCode: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SelectShiftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentShiftCode: string | null },
    private apiService: ApiService
  ) {
    this.selectedShiftCode = data.currentShiftCode;
  }

  ngOnInit(): void {
    this.shifts$ = this.apiService.getShifts();
  }

  onCancel(): void {
    this.dialogRef.close(); // Close without sending data
  }

  onSave(): void {
    if (this.selectedShiftCode) {
      this.dialogRef.close(this.selectedShiftCode);
    }
  }
}