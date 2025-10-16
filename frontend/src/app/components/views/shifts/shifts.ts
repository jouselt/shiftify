import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, switchMap, Observable } from 'rxjs';
import { Shift } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';
import { I18nService } from '@pro-schedule-manager/services/i18n';
import { MatDialog } from '@angular/material/dialog';
import { ShiftDialog } from '@pro-schedule-manager/components/dialogs/shift-dialog/shift-dialog';

@Component({
  selector: 'app-shifts',
  standalone: false,
  templateUrl: './shifts.html',
  styleUrls: ['./shifts.css']
})
export class ShiftsComponent implements OnInit {
  // Use a BehaviorSubject to easily refresh the list after a change
  private refresh = new BehaviorSubject<void>(undefined);
  shifts$: Observable<Shift[]>;

  constructor(
    private apiService: ApiService,
    public i18n: I18nService,
    private dialog: MatDialog
  ) {
    this.shifts$ = this.refresh.pipe(
      switchMap(() => this.apiService.getShifts())
    );
  }

  ngOnInit(): void {}

  openShiftDialog(shift?: Shift): void {
    const dialogRef = this.dialog.open(ShiftDialog, {
      width: '500px',
      data: { shift: shift || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (shift) { // Editing existing shift
          this.apiService.updateShift(shift.shiftCode, result).subscribe(() => this.refresh.next());
        } else { // Adding new shift
          this.apiService.addShift(result).subscribe(() => this.refresh.next());
        }
      }
    });
  }

  deleteShift(shift: Shift): void {
    if (confirm(`Are you sure you want to delete the shift "${shift.shiftCode}"?`)) {
      this.apiService.deleteShift(shift.shiftCode).subscribe(() => this.refresh.next());
    }
  }
}