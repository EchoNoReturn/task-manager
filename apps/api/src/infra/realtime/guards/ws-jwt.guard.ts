import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      this.logger.warn(`WebSocket 连接被拒绝: 缺少 token`);
      client.disconnect();
      return false;
    }

    try {
      const secret = this.config.get<string>('JWT_SECRET', 'default-secret');
      const payload = verify(token, secret) as { sub: string; role: string };

      // 将用户信息附加到 socket 上，供后续使用
      (client as any).user = { id: payload.sub, role: payload.role };
      return true;
    } catch (err) {
      this.logger.warn(`WebSocket 连接被拒绝: token 无效`);
      client.disconnect();
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }
    return null;
  }
}
