// In frontend/src/app/app.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { Employee, Store } from '@pro-schedule-manager/interfaces';
import { Observable } from 'rxjs';
import { ApiService } from './services/api';
import { I18nService } from './services/i18n';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {

  // Create an observable property to hold the stream of employee data
  public employees$: Observable<Employee[]>;
  public stores$: Observable<Store[]>;
  protected readonly title = signal('frontend');

  constructor(
    private apiService: ApiService,
    public i18n: I18nService
  ) {
    // Initialize the properties, but don't subscribe here
    this.employees$ = new Observable<Employee[]>();
    this.stores$ = new Observable<Store[]>();
  }
  
  // ngOnInit is a lifecycle hook that runs once the component is initialized
  ngOnInit(): void {
    console.log('AppComponent initialized, fetching data...');
    
    // Fetch the data from the API
    this.stores$ = this.apiService.getStores();
    
    // For this test, we'll fetch employees for Store 1 by default
    this.employees$ = this.apiService.getEmployees(1);
    
    this.i18n.loadTranslations('es-cl');
  }
}