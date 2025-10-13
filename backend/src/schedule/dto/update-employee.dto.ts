import { IsString, IsNotEmpty, IsIn, IsNumber, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    employeeName?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsIn(['Manager', 'Crew'])
    type?: 'Manager' | 'Crew';

    @IsOptional()
    @IsNumber()
    contractHours?: number;
}