import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: '/ws/notifications',
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const user = (client as any).user;
    if (user?.id) {
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);
      this.logger.log(`用户 ${user.id} 已连接 (socket: ${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user?.id) {
      this.userSockets.get(user.id)?.delete(client.id);
      if (this.userSockets.get(user.id)?.size === 0) {
        this.userSockets.delete(user.id);
      }
      this.logger.log(`用户 ${user.id} 已断开 (socket: ${client.id})`);
    }
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`Socket ${client.id} 加入房间 ${data.room}`);
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`Socket ${client.id} 离开房间 ${data.room}`);
  }

  getSocketsByUser(userId: string): Set<string> | undefined {
    return this.userSockets.get(userId);
  }
}
