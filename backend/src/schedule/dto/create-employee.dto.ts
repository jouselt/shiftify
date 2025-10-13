import { IsString, IsNotEmpty, IsIn, IsNumber } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    @IsNotEmpty()
    employeeName: string;

    @IsString()
    title: string;

    @IsIn(['Manager', 'Crew'])
    type: 'Manager' | 'Crew';

    @IsNumber()
    contractHours: number;
}