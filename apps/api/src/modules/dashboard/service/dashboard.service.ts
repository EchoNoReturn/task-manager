import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Task } from '../../tasks/entities';
import { TaskWorkHour } from '../../work-hours/entities';
import { TaskStatus } from '@taskmanager/shared';
import { DashboardStatsResponse } from '../dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskWorkHour)
    private readonly workHourRepo: Repository<TaskWorkHour>,
  ) {}

  async getStats(userId: string): Promise<DashboardStatsResponse> {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const monthStart = this.getMonthStart(now);

    const [completedTaskCount, weeklyAcceptedCount, monthlyAcceptedCount, inProgressCount, weeklyWorkHours, monthlyWorkHours] = await Promise.all([
      this.getCompletedTaskCount(userId),
      this.getAcceptedTaskCount(userId, weekStart, now),
      this.getAcceptedTaskCount(userId, monthStart, now),
      this.getInProgressCount(userId),
      this.getWorkHours(userId, weekStart, now),
      this.getWorkHours(userId, monthStart, now),
    ]);

    return {
      completedTaskCount,
      weeklyAcceptedCount,
      monthlyAcceptedCount,
      inProgressCount,
      weeklyWorkHours,
      monthlyWorkHours,
    };
  }

  private async getCompletedTaskCount(userId: string): Promise<number> {
    return this.taskRepo.count({
      where: {
        archivedAt: IsNull(),
        deletedAt: IsNull(),
        status: TaskStatus.COMPLETED,
        assigneeId: userId,
      },
    });
  }

  private async getAcceptedTaskCount(userId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.taskRepo
      .createQueryBuilder('task')
      .where('task.assigneeId = :userId', { userId })
      .andWhere('task.archivedAt IS NULL')
      .andWhere('task.deletedAt IS NULL')
      .andWhere('task.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [TaskStatus.DRAFT, TaskStatus.PENDING],
      })
      .andWhere('task.updatedAt >= :startDate', { startDate })
      .andWhere('task.updatedAt <= :endDate', { endDate })
      .getCount();
  }

  private async getInProgressCount(userId: string): Promise<number> {
    return this.taskRepo.count({
      where: {
        archivedAt: IsNull(),
        deletedAt: IsNull(),
        status: TaskStatus.IN_PROGRESS,
        assigneeId: userId,
      },
    });
  }

  private async getWorkHours(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.workHourRepo
      .createQueryBuilder('wh')
      .select('SUM(wh.hours)', 'total')
      .where('wh.userId = :userId', { userId })
      .andWhere('wh.startTime >= :startDate', { startDate })
      .andWhere('wh.startTime <= :endDate', { endDate })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getMonthStart(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
