import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@pro-schedule-manager/interfaces';
import { ApiService } from '@pro-schedule-manager/services/api';
import { I18nService } from '@pro-schedule-manager/services/i18n';


@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  standalone: false,
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  stores$: Observable<Store[]>;

  // Expose the i18n service to the template
  constructor(
    private apiService: ApiService,
    public i18n: I18nService
  ) {
    this.stores$ = new Observable<Store[]>();
  }

  ngOnInit(): void {
    this.stores$ = this.apiService.getStores();
  }

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.i18n.loadTranslations(selectElement.value);
  }

  onStoreChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const storeId = selectElement.value;
    // We will implement the logic to reload data based on store selection later
    console.log('Store selected:', storeId);
  }
}