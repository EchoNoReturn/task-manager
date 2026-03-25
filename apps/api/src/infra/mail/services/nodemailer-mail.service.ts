import { Injectable, Logger } from '@nestjs/common';
import { IMailService, SendMailOptions } from '../interfaces';

@Injectable()
export class NodemailerMailService implements IMailService {
  private readonly logger = new Logger(NodemailerMailService.name);

  async send(_options: SendMailOptions): Promise<void> {
    // TODO: 实现 Nodemailer 发送逻辑
    this.logger.warn('NodemailerMailService.send() 尚未实现');
    throw new Error('邮件发送功能尚未启用');
  }

  async sendTemplate(
    _to: string | string[],
    _templateName: string,
    _context: Record<string, unknown>,
  ): Promise<void> {
    // TODO: 实现模板邮件发送逻辑
    this.logger.warn('NodemailerMailService.sendTemplate() 尚未实现');
    throw new Error('邮件发送功能尚未启用');
  }
}
