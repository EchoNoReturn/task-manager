import { IsString, IsOptional, IsDateString, IsNumber, MaxLength } from 'class-validator';

export class CreateWorkHourDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class ListWorkHoursDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
