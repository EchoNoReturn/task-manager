import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { TaskStatus, TaskType } from '@taskmanager/shared';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
