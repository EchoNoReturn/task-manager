import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team, TeamMember, TeamMemberRole } from '../entities';
import { CreateTeamDto, UpdateTeamDto, AddMemberDto, UpdateMemberRoleDto } from '../dto';
import { TeamWithMembers } from '@taskmanager/shared';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly memberRepo: Repository<TeamMember>,
  ) {}

  async findAllByUser(userId: string): Promise<Team[]> {
    const memberships = await this.memberRepo.find({
      where: { userId },
      relations: ['team'],
    });
    return memberships.map(m => m.team);
  }

  async findById(id: string): Promise<Team> {
    const team = await this.teamRepo.findOne({ where: { id, deletedAt: null as any } });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }
    return team;
  }

  async create(dto: CreateTeamDto, ownerId: string): Promise<Team> {
    const team = this.teamRepo.create({
      ...dto,
      ownerId,
    });
    await this.teamRepo.save(team);

    const member = this.memberRepo.create({
      teamId: team.id,
      userId: ownerId,
      role: TeamMemberRole.LEADER,
    });
    await this.memberRepo.save(member);

    return team;
  }

  async update(id: string, dto: UpdateTeamDto, userId: string): Promise<Team> {
    const team = await this.findById(id);
    if (team.ownerId !== userId) {
      throw new ForbiddenException('只有团队所有者可以更新团队');
    }

    Object.assign(team, dto);
    await this.teamRepo.save(team);
    return team;
  }

  async delete(id: string, userId: string): Promise<void> {
    const team = await this.findById(id);
    if (team.ownerId !== userId) {
      throw new ForbiddenException('只有团队所有者可以删除团队');
    }

    team.deletedAt = new Date();
    await this.teamRepo.save(team);
  }

  async addMember(teamId: string, dto: AddMemberDto, userId: string): Promise<TeamMember> {
    const team = await this.findById(teamId);
    if (team.ownerId !== userId) {
      throw new ForbiddenException('只有团队所有者可以添加成员');
    }

    const existing = await this.memberRepo.findOne({
      where: { teamId, userId: dto.userId },
    });
    if (existing) {
      throw new ForbiddenException('该用户已是团队成员');
    }

    const member = this.memberRepo.create({
      teamId,
      userId: dto.userId,
      role: dto.role,
    });
    return this.memberRepo.save(member);
  }

  async removeMember(teamId: string, targetUserId: string, userId: string): Promise<void> {
    const team = await this.findById(teamId);
    if (team.ownerId !== userId) {
      throw new ForbiddenException('只有团队所有者可以移除成员');
    }

    const member = await this.memberRepo.findOne({
      where: { teamId, userId: targetUserId },
    });
    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    if (member.role === TeamMemberRole.LEADER) {
      throw new ForbiddenException('不能移除团队领导者');
    }

    await this.memberRepo.remove(member);
  }

  async updateMemberRole(teamId: string, targetUserId: string, dto: UpdateMemberRoleDto, userId: string): Promise<TeamMember> {
    const team = await this.findById(teamId);
    if (team.ownerId !== userId) {
      throw new ForbiddenException('只有团队所有者可以更新成员角色');
    }

    const member = await this.memberRepo.findOne({
      where: { teamId, userId: targetUserId },
    });
    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    member.role = dto.role;
    return this.memberRepo.save(member);
  }

  async getMembers(teamId: string): Promise<TeamMember[]> {
    return this.memberRepo.find({
      where: { teamId },
      relations: ['user'],
    });
  }

  async findAllForAdmin(): Promise<Team[]> {
    return this.teamRepo.find({ where: { deletedAt: null as any } });
  }

  async findAllForTask(): Promise<Team[]> {
    return this.teamRepo.find({ where: { deletedAt: null as any } });
  }

  async findAllWhereLeader(userId: string): Promise<Team[]> {
    const memberships = await this.memberRepo.find({
      where: { userId, role: TeamMemberRole.LEADER },
      relations: ['team'],
    });
    return memberships.map(m => m.team);
  }

  async addMemberAsAdmin(teamId: string, dto: AddMemberDto): Promise<TeamMember> {
    const team = await this.findById(teamId);

    const existing = await this.memberRepo.findOne({
      where: { teamId, userId: dto.userId },
    });
    if (existing) {
      throw new ForbiddenException('该用户已是团队成员');
    }

    const member = this.memberRepo.create({
      teamId,
      userId: dto.userId,
      role: dto.role,
    });
    return this.memberRepo.save(member);
  }

  async removeMemberAsAdmin(teamId: string, targetUserId: string): Promise<void> {
    const team = await this.findById(teamId);

    const member = await this.memberRepo.findOne({
      where: { teamId, userId: targetUserId },
    });
    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    await this.memberRepo.remove(member);
  }

  async updateMemberRoleAsAdmin(teamId: string, targetUserId: string, dto: UpdateMemberRoleDto): Promise<TeamMember> {
    const team = await this.findById(teamId);

    const member = await this.memberRepo.findOne({
      where: { teamId, userId: targetUserId },
    });
    if (!member) {
      throw new NotFoundException('成员不存在');
    }

    member.role = dto.role;
    return this.memberRepo.save(member);
  }
}
