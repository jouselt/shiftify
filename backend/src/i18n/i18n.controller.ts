import { Controller, Get, Param } from '@nestjs/common';
import { I18nService } from './i18n.service';

@Controller('translations')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  @Get(':locale') // Handles requests like /api/translations/en-us
  getTranslations(@Param('locale') locale: string): Promise<Record<string, string>> {
    return this.i18nService.getTranslations(locale);
  }
}