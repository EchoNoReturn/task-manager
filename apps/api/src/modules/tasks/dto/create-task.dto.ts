import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskType } from '@taskmanager/shared';

export class CreateTaskDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskType)
  type: TaskType;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
