// In frontend/src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DayComponent } from '@pro-schedule-manager/views/day/day';
import { EmployeesComponent } from '@pro-schedule-manager/views/employees/employees';
import { MonthComponent } from '@pro-schedule-manager/views/month/month';
import { ScheduleComponent } from '@pro-schedule-manager/views/schedule/schedule.component';
import { ShiftsComponent } from '@pro-schedule-manager/views/shifts/shifts';
import { ScheduleWrapperComponent } from './components/views/schedule-wrapper/schedule-wrapper';
import { OnboardingGuard } from './guards/onboarding.guard';
import { Onboarding } from './components/views/onboarding/onboarding';


const getTodayString = () => new Date().toISOString().split('T')[0];
const routes: Routes = [
  { path: 'onboarding', component: Onboarding },
  {
    path: 'schedule',
    component: ScheduleWrapperComponent, // The parent component with sub-navigation
    canActivate: [OnboardingGuard],
    children: [
      { path: '', redirectTo: 'week', pathMatch: 'full' }, // Default to the week view
      { path: 'week', component: ScheduleComponent }, // Our existing weekly schedule
      { path: 'day', redirectTo: `day/${getTodayString()}`, pathMatch: 'full' },
      { path: 'day/:date', component: DayComponent },
      { path: 'month', component: MonthComponent },
    ]
  },
  { path: 'employees', component: EmployeesComponent, canActivate: [OnboardingGuard] }, // <-- Protect
  { path: 'shifts', component: ShiftsComponent, canActivate: [OnboardingGuard] },       // <-- Protect
  { path: '', redirectTo: '/schedule', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

