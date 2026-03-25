import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../auth/entities';

export enum TeamMemberRole {
  LEADER = 'leader',
  MEMBER = 'member',
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id' })
  teamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
  role: TeamMemberRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
