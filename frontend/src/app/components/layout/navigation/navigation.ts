import { Component } from '@angular/core';
import { I18nService } from '@pro-schedule-manager/services/i18n';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.html',
  standalone: false,
  styleUrls: ['./navigation.css']
})
export class Navigation {
  constructor(public i18n: I18nService) { }
}