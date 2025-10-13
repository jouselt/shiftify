import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { DataModule } from '../data/data.module';

@Module({
  imports: [DataModule],
  providers: [ScheduleService],
  controllers: [ScheduleController]
})
export class ScheduleModule {}