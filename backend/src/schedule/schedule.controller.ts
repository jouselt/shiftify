import { Controller, Post, Body, Put } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { GeneratedSchedule } from '@pro-schedule-manager/interfaces';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { UpdateScheduleDayDto } from './dto/update-schedule-day.dto'; // <-- Import the DTO

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Post('generate') // Handles POST requests to /api/schedule/generate
  generateSchedule(
    @Body() generateScheduleDto: GenerateScheduleDto,
  ): GeneratedSchedule {
    const { storeId, month, year } = generateScheduleDto;
    return this.scheduleService.generateMonthlySchedule(storeId, month, year);
  }
  @Put('day') // Handles PUT requests to /api/schedule/day
  updateScheduleDay(
    @Body() updateScheduleDayDto: UpdateScheduleDayDto,
  ): { success: boolean, message?: string } {
    return this.scheduleService.updateDayForEmployee(updateScheduleDayDto);
  }
}
