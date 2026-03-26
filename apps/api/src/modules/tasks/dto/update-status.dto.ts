import { IsEnum } from 'class-validator';
import { TaskStatus } from '@taskmanager/shared';

export class UpdateStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
