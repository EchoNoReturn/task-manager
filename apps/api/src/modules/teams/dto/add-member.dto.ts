import { IsString, IsEnum, IsUUID } from 'class-validator';
import { TeamMemberRole } from '../entities';

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsEnum(TeamMemberRole)
  role: TeamMemberRole = TeamMemberRole.MEMBER;
}
