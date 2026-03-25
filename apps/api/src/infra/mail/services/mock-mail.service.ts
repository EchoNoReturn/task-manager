import { Injectable, Logger } from '@nestjs/common';
import { IMailService, SendMailOptions } from '../interfaces';

@Injectable()
export class MockMailService implements IMailService {
  private readonly logger = new Logger(MockMailService.name);

  async send(options: SendMailOptions): Promise<void> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    this.logger.debug(`[MockMail] 发送邮件`);
    this.logger.debug(`  收件人: ${recipients}`);
    this.logger.debug(`  主题: ${options.subject}`);
    this.logger.debug(`  内容: ${options.body}`);
  }

  async sendTemplate(
    to: string | string[],
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    this.logger.debug(`[MockMail] 发送模板邮件`);
    this.logger.debug(`  收件人: ${recipients}`);
    this.logger.debug(`  模板: ${templateName}`);
    this.logger.debug(`  变量: ${JSON.stringify(context)}`);
  }
}
