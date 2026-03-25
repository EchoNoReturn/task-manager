import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../tasks/entities';
import { TaskStatus, NotificationType } from '@productor/shared';
import { NotificationsService } from '../../notifications/service/notifications.service';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkOverdueTasks() {
    this.logger.log('检查超时任务...');

    const overdueTasks = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.status = :status', { status: TaskStatus.PENDING })
      .andWhere('task.claimDeadline < :now', { now: new Date() })
      .andWhere('task.deletedAt IS NULL')
      .getMany();

    for (const task of overdueTasks) {
      this.logger.warn(`任务 ${task.id} 已超时未认领`);

      if (task.teamId) {
        const teamMembers = await this.taskRepo.query(
          `SELECT user_id FROM team_members WHERE team_id = $1`,
          [task.teamId],
        );

        for (const member of teamMembers) {
          await this.notificationsService.create({
            userId: member.user_id,
            type: NotificationType.TASK_OVERDUE,
            title: '任务超时提醒',
            message: `任务 "${task.title}" 已超过30分钟未被认领`,
            relatedTaskId: task.id,
          });
        }
      }
    }
  }
}
