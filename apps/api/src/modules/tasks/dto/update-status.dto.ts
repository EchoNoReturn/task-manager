import { IsEnum } from 'class-validator';
import { TaskStatus } from '@productor/shared';

export class UpdateStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
