import { IsInt, Min, Max } from 'class-validator';

export class GenerateScheduleDto {
    @IsInt()
    storeId: number;

    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @IsInt()
    @Min(2024)
    year: number;
}