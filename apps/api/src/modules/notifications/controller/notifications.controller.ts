import { Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../service';
import { JwtAuthGuard, CurrentUser } from '../../auth';
import { Notification } from '../entities';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.notificationsService.markAsRead(id, userId);
    return { message: '已标记为已读' };
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser('id') userId: string): Promise<{ message: string }> {
    await this.notificationsService.markAllAsRead(userId);
    return { message: '已标记全部为已读' };
  }
}
