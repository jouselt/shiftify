import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

// Define a type for our translation object for type safety
type Translations = Record<string, string>;

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private apiUrl = 'http://localhost:3000/api/translations';

  // A BehaviorSubject holds the current value of the translations.
  // Components can subscribe to this to get live updates.
  private translations = new BehaviorSubject<Translations>({});
  public translations$ = this.translations.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Loads translations for a given locale.
   * It first checks localStorage for a cached version. If not found,
   * it fetches from the API and then caches the result.
   * @param locale The language locale to load (e.g., 'es-cl').
   */
  loadTranslations(locale: string): void {
    const cachedTranslations = localStorage.getItem(`translations_${locale}`);

    if (cachedTranslations) {
      // If translations are in the cache, use them.
      this.translations.next(JSON.parse(cachedTranslations));
    } else {
      // Otherwise, fetch from the API.
      this.http.get<Translations>(`${this.apiUrl}/${locale}`).pipe(
        tap(translations => {
          // When data arrives, cache it in localStorage...
          localStorage.setItem(`translations_${locale}`, JSON.stringify(translations));
          // ...and update the BehaviorSubject to notify all subscribers.
          this.translations.next(translations);
        })
      ).subscribe();
    }
  }
}