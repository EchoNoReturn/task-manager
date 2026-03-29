import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TasksService } from '../service';
import { JwtAuthGuard, CurrentUser, Public } from '../../auth';
import { Task, TaskTransferRequest } from '../entities';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, AssignTaskDto, ListTasksDto, CreateTransferRequestDto, RejectTransferRequestDto, ArchiveTaskDto } from '../dto';
import { PaginatedResult, ScheduleResult, UserRole } from '@taskmanager/shared';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query() query: ListTasksDto,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findAll(query, user.id, user.role as UserRole);
  }

  @Get('assignee/:id/schedule')
  async getSchedule(@Param('id') id: string): Promise<ScheduleResult> {
    return this.tasksService.getSchedule(id);
  }

  @Get('pending-transfers')
  async getPendingTransfers(
    @CurrentUser('id') userId: string,
  ): Promise<TaskTransferRequest[]> {
    return this.tasksService.getPendingTransfersForUser(userId);
  }

  @Get('archived')
  async findArchived(
    @Query('search') search: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findArchived(user.id, user.role as UserRole, search);
  }

  @Get('team-tasks/created')
  async findMyCreatedTeamTasks(
    @CurrentUser('id') userId: string,
  ): Promise<{ data: Task[] }> {
    return this.tasksService.findMyCreatedTeamTasks(userId);
  }

  @Get('team-tasks/claimed')
  async findMyClaimedTeamTasks(
    @CurrentUser('id') userId: string,
  ): Promise<{ data: Task[] }> {
    return this.tasksService.findMyClaimedTeamTasks(userId);
  }

  @Get('team/:teamId/all')
  async findAllTeamTasks(
    @Param('teamId') teamId: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findAllTeamTasks(teamId, user.id, user.role as UserRole);
  }

  @Get('team/:teamId/members-status')
  async getTeamMembersTaskStatus(
    @Param('teamId') teamId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ memberId: string; memberName: string; taskCount: number; claimedCount: number; unclaimedCount: number }[]> {
    return this.tasksService.getTeamMembersTaskStatus(teamId, userId);
  }

  @Get('my/created')
  async findMyCreatedTasks(
    @CurrentUser('id') userId: string,
  ): Promise<{ data: Task[] }> {
    return this.tasksService.findMyCreatedTasks(userId);
  }

  @Get('my/assigned')
  async findMyAssignedTasks(
    @CurrentUser('id') userId: string,
  ): Promise<{ data: Task[] }> {
    return this.tasksService.findMyAssignedTasks(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Task> {
    return this.tasksService.findById(id, user.id, user.role as UserRole);
  }

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.create(dto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Task> {
    return this.tasksService.update(id, dto, user.id, user.role as UserRole);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<{ message: string }> {
    await this.tasksService.delete(id, user.id, user.role as UserRole);
    return { message: '任务删除成功' };
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, dto, user.id, user.role as UserRole);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Task> {
    return this.tasksService.assign(id, dto, user.id, user.role as UserRole);
  }

  @Post(':id/claim')
  async claim(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Task> {
    return this.tasksService.claim(id, user.id, user.role as UserRole);
  }

  @Post(':id/archive')
  async archive(
    @Param('id') id: string,
    @Body() dto: ArchiveTaskDto,
    @CurrentUser() user: { id: string; role: string },
  ): Promise<Task> {
    return this.tasksService.archive(id, user.id, user.role as UserRole, dto.reason);
  }

  @Post(':id/transfer')
  async createTransfer(
    @Param('id') id: string,
    @Body() dto: CreateTransferRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<TaskTransferRequest> {
    return this.tasksService.createTransferRequest(id, dto, userId);
  }

  @Post('transfers/:transferId/accept')
  async acceptTransfer(
    @Param('transferId') transferId: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.acceptTransfer(transferId, userId);
  }

  @Post('transfers/:transferId/reject')
  async rejectTransfer(
    @Param('transferId') transferId: string,
    @Body() dto: RejectTransferRequestDto,
    @CurrentUser('id') userId: string,
  ): Promise<TaskTransferRequest> {
    return this.tasksService.rejectTransfer(transferId, userId, dto);
  }
}
