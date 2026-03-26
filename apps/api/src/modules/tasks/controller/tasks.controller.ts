import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TasksService } from '../service';
import { JwtAuthGuard, CurrentUser, Public } from '../../auth';
import { Task } from '../entities';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, AssignTaskDto, ListTasksDto } from '../dto';
import { PaginatedResult, ScheduleResult } from '@taskmanager/shared';

@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query() query: ListTasksDto): Promise<PaginatedResult<Task>> {
    return this.tasksService.findAll(query);
  }

  @Get('assignee/:id/schedule')
  async getSchedule(@Param('id') id: string): Promise<ScheduleResult> {
    return this.tasksService.getSchedule(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findById(id);
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
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.update(id, dto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.tasksService.delete(id, userId);
    return { message: '任务删除成功' };
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, dto, userId);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.assign(id, dto, userId);
  }

  @Post(':id/claim')
  async claim(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<Task> {
    return this.tasksService.claim(id, userId);
  }
}
