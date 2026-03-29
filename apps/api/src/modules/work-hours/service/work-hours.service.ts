import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskWorkHour } from '../entities';
import { Task } from '../../tasks/entities';
import { UserRole } from '@taskmanager/shared';
import { CreateWorkHourDto } from '../dto';

@Injectable()
export class WorkHoursService {
  constructor(
    @InjectRepository(TaskWorkHour)
    private readonly workHourRepo: Repository<TaskWorkHour>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(taskId: string, dto: CreateWorkHourDto, userId: string, userRole: UserRole): Promise<TaskWorkHour> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, deletedAt: null as any },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    if (userRole !== UserRole.ADMIN && task.assigneeId !== userId) {
      throw new ForbiddenException('只有任务负责人或管理员可以上报工时');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (hours <= 0 || hours > 24) {
      throw new BadRequestException('工时必须在 0 到 24 小时之间');
    }

    const workHour = this.workHourRepo.create({
      taskId,
      userId,
      startTime,
      endTime,
      hours: Math.round(hours * 100) / 100,
      description: dto.description || null,
    });

    return this.workHourRepo.save(workHour);
  }

  async findByTask(taskId: string): Promise<TaskWorkHour[]> {
    return this.workHourRepo.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<{ data: TaskWorkHour[]; total: number }> {
    const [data, total] = await this.workHourRepo.findAndCount({
      where: { userId },
      relations: ['task'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async getTotalHours(taskId: string): Promise<number> {
    const result = await this.workHourRepo
      .createQueryBuilder('wh')
      .select('SUM(wh.hours)', 'total')
      .where('wh.task_id = :taskId', { taskId })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }
}
