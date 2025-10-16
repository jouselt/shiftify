import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { ApiService } from '@pro-schedule-manager/services/api';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {
  constructor(private apiService: ApiService, private router: Router) { }

  canActivate(): Observable<boolean | UrlTree> {
    return this.apiService.checkStatus().pipe(
      map(status => {
        if (status.hasData) {
          return true; // If data exists, allow access to the route.
        } else {
          // If no data, redirect to the onboarding page.
          return this.router.createUrlTree(['/onboarding']);
        }
      })
    );
  }
}