import { LOCALE_ID, NgModule, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { Header } from './components/layout/header/header';
import { Navigation } from './components/layout/navigation/navigation';
import { ScheduleComponent } from './components/views/schedule/schedule.component';
import { EmployeesComponent } from './components/views/employees/employees';
import { ShiftsComponent } from './components/views/shifts/shifts';
import { GetShiftPipe } from './pipes/get-shift-pipe';
import { DayComponent } from './components/views/day/day';
import { MonthComponent } from './components/views/month/month';
import { ScheduleWrapperComponent } from './components/views/schedule-wrapper/schedule-wrapper';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- Add
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeDialogComponent } from './components/dialogs/employee-dialog/employee-dialog';
import { ShiftDialog } from './components/dialogs/shift-dialog/shift-dialog';
import { CalculateWeeklyHoursPipe } from './pipes/calculate-weekly-hours-pipe';
import { Onboarding } from './components/views/onboarding/onboarding';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SelectShiftDialogComponent } from './components/dialogs/select-shift-dialog/select-shift-dialog';

registerLocaleData(localeEsCl);
@NgModule({
  declarations: [
    AppComponent,
    Header,
    Navigation,
    ScheduleComponent,
    EmployeesComponent,
    ShiftsComponent,
    GetShiftPipe,
    DayComponent,
    MonthComponent,
    ScheduleWrapperComponent,
    EmployeeDialogComponent,
    ShiftDialog,
    Onboarding,
    SelectShiftDialogComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    CalculateWeeklyHoursPipe,
    FormsModule,
    MatIconModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-CL' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
