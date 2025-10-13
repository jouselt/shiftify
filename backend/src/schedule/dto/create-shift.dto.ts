import { IsString, IsNotEmpty, IsIn, Matches, IsNumber } from 'class-validator';

export class CreateShiftDto {
    @IsString()
    @IsNotEmpty()
    shiftCode: string;

    @IsIn(['Morning', 'Afternoon', 'Night', 'Custom', 'Off'])
    category: 'Morning' | 'Afternoon' | 'Night' | 'Custom' | 'Off';

    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
    startTime: string;

    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'endTime must be in HH:mm format' })
    endTime: string;

    @IsNumber()
    hoursWorked: number;

    @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a hex code (e.g., #RRGGBB)' })
    color: string;
}