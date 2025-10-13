import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class I18nService {
  async getTranslations(locale: string): Promise<Record<string, string>> {
    // Sanitize locale to prevent directory traversal
    const safeLocale = path.normalize(locale).replace(/^(\.\.(\/|\\|$))+/, '');

    // Try possible locations for both ts-node (src) and compiled dist builds
    const candidatePaths = [
      // When compiled with webpack/nest build, assets are copied to dist/i18n by nest-cli
      path.resolve(process.cwd(), 'dist', 'i18n', `${safeLocale}.json`),
      // When running from TS sources, JSON files are in src/i18n
      path.resolve(process.cwd(), 'src', 'i18n', `${safeLocale}.json`),
      // Relative to compiled file structure (depending on bundling layout)
      path.resolve(__dirname, '..', 'i18n', `${safeLocale}.json`),
      path.resolve(__dirname, '..', '..', 'i18n', `${safeLocale}.json`),
    ];

    for (const candidate of candidatePaths) {
      try {
        const fileContent = await fs.readFile(candidate, 'utf-8');
        return JSON.parse(fileContent);
      } catch (_) {
        // Try next candidate path
      }
    }

    throw new NotFoundException(`Translations for locale '${locale}' not found.`);
  }
}