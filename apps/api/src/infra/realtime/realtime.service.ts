import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  /**
   * 向指定用户推送事件
   */
  emit(event: string, payload: unknown, targetUserIds: string[]): void {
    for (const userId of targetUserIds) {
      const socketIds = this.gateway.getSocketsByUser(userId);
      if (socketIds) {
        for (const socketId of socketIds) {
          this.gateway.server.to(socketId).emit(event, payload);
        }
      }
    }
  }

  /**
   * 向指定房间广播事件
   */
  emitToRoom(room: string, event: string, payload: unknown): void {
    this.gateway.server.to(room).emit(event, payload);
    this.logger.log(`事件 ${event} 已广播到房间 ${room}`);
  }

  /**
   * 全局广播
   */
  broadcast(event: string, payload: unknown): void {
    this.gateway.server.emit(event, payload);
    this.logger.log(`事件 ${event} 已全局广播`);
  }
}
