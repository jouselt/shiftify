import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { I18nController } from './i18n/i18n.controller';
import { I18nService } from './i18n/i18n.service';
import { I18nModule } from './i18n/i18n.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    DataModule,
    I18nModule,
    ScheduleModule
  ],
  controllers: [AppController, I18nController],
  providers: [AppService, I18nService],
})
export class AppModule { }
