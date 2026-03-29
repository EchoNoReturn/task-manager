import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeamsService } from '../service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '@taskmanager/shared';
import { Team, TeamMember } from '../entities';
import { AddMemberDto, UpdateMemberRoleDto } from '../dto';

@Controller('api/admin/teams')
@UseGuards(JwtAuthGuard)
export class AdminTeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findAll(): Promise<Team[]> {
    return this.teamsService.findAllForAdmin();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findOne(@Param('id') id: string): Promise<Team> {
    return this.teamsService.findById(id);
  }

  @Get(':id/members')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async getMembers(@Param('id') id: string): Promise<TeamMember[]> {
    return this.teamsService.getMembers(id);
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ): Promise<TeamMember> {
    return this.teamsService.addMemberAsAdmin(id, dto);
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ): Promise<{ message: string }> {
    await this.teamsService.removeMemberAsAdmin(id, targetUserId);
    return { message: '成员移除成功' };
  }

  @Patch(':id/members/:userId')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<TeamMember> {
    return this.teamsService.updateMemberRoleAsAdmin(id, targetUserId, dto);
  }
}