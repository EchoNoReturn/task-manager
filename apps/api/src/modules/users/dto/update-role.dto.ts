import { IsEnum } from 'class-validator';
import { UserRole } from '@taskmanager/shared';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
