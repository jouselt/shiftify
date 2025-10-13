import { IsString, IsNotEmpty, IsIn, Matches, IsNumber, IsOptional } from 'class-validator';

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  shiftCode?: string;

  @IsOptional()
  @IsIn(['Morning', 'Afternoon', 'Night', 'Custom', 'Off'])
  category?: 'Morning' | 'Afternoon' | 'Night' | 'Custom' | 'Off';

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  endTime?: string;

  @IsOptional()
  @IsNumber()
  hoursWorked?: number;

  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color?: string;
}