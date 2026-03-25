import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { TeamsService } from '../service';
import { JwtAuthGuard, CurrentUser } from '../../auth';
import { Team, TeamMember } from '../entities';

@Controller('api/teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string): Promise<Team[]> {
    return this.teamsService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Team> {
    return this.teamsService.findById(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string): Promise<TeamMember[]> {
    return this.teamsService.getMembers(id);
  }

  @Post()
  async create(
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ): Promise<Team> {
    return this.teamsService.create(dto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ): Promise<Team> {
    return this.teamsService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.teamsService.delete(id, userId);
    return { message: '团队删除成功' };
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ): Promise<TeamMember> {
    return this.teamsService.addMember(id, dto, userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.teamsService.removeMember(id, targetUserId, userId);
    return { message: '成员移除成功' };
  }

  @Patch(':id/members/:userId')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
  ): Promise<TeamMember> {
    return this.teamsService.updateMemberRole(id, targetUserId, dto, userId);
  }
}
