import { IsInt, IsString, Matches } from 'class-validator';

export class UpdateScheduleDayDto {
  @IsInt()
  employeeId: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date: string;

  @IsString()
  shiftCode: string;
}