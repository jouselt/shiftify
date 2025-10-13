// In frontend/src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DayComponent } from '@pro-schedule-manager/views/day/day';
import { EmployeesComponent } from '@pro-schedule-manager/views/employees/employees';
import { MonthComponent } from '@pro-schedule-manager/views/month/month';
import { ScheduleComponent } from '@pro-schedule-manager/views/schedule/schedule.component';
import { ShiftsComponent } from '@pro-schedule-manager/views/shifts/shifts';
import { ScheduleWrapperComponent } from './components/views/schedule-wrapper/schedule-wrapper';


const getTodayString = () => new Date().toISOString().split('T')[0];
const routes: Routes = [
  // When the user visits the base URL, redirect them to the schedule page
  { path: '', redirectTo: '/schedule', pathMatch: 'full' },
  // When the user visits /schedule, show the ScheduleComponent
  { path: 'employees', component: EmployeesComponent },
  { path: 'shifts', component: ShiftsComponent },
  { path: 'day', redirectTo: `/day/${getTodayString()}`, pathMatch: 'full' },
  { path: 'day/:date', component: DayComponent },
  {
    path: 'schedule',
    component: ScheduleWrapperComponent, // The parent component with sub-navigation
    children: [
      { path: '', redirectTo: 'week', pathMatch: 'full' }, // Default to the week view
      { path: 'week', component: ScheduleComponent }, // Our existing weekly schedule
      { path: 'day', redirectTo: `day/${getTodayString()}`, pathMatch: 'full' },
      { path: 'day/:date', component: DayComponent },
      { path: 'month', component: MonthComponent },
    ]
  },
  // We'll add routes for the other tabs later
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

