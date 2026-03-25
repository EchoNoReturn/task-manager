import { IsEnum } from 'class-validator';
import { UserRole } from '@productor/shared';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
