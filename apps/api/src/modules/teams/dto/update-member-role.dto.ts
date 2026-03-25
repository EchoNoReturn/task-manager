import { IsEnum } from 'class-validator';
import { TeamMemberRole } from '../entities';

export class UpdateMemberRoleDto {
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
