import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { WorkHoursService } from '../service';
import { JwtAuthGuard, CurrentUser } from '../../auth';
import { CreateWorkHourDto } from '../dto';

@Controller('api/tasks/:taskId/work-hours')
@UseGuards(JwtAuthGuard)
export class WorkHoursController {
  constructor(private readonly workHoursService: WorkHoursService) {}

  @Post()
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateWorkHourDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.workHoursService.create(taskId, dto, user.id, user.role as any);
  }

  @Get()
  async findByTask(@Param('taskId') taskId: string) {
    return this.workHoursService.findByTask(taskId);
  }

  @Get('total')
  async getTotalHours(@Param('taskId') taskId: string) {
    const total = await this.workHoursService.getTotalHours(taskId);
    return { total };
  }
}

@Controller('api/work-hours')
@UseGuards(JwtAuthGuard)
export class WorkHoursUserController {
  constructor(private readonly workHoursService: WorkHoursService) {}

  @Get('me')
  async findMyWorkHours(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workHoursService.findByUser(userId, page || 1, limit || 20);
  }
}
