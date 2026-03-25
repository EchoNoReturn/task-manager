import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities';
import { NotificationType } from '@productor/shared';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedTaskId?: string;
    relatedUserId?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }
}
