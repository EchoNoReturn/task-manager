import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IMailService } from './interfaces';
import { MockMailService } from './services/mock-mail.service';
import { NodemailerMailService } from './services/nodemailer-mail.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IMailService',
      useFactory: (config: ConfigService): IMailService => {
        const env = config.get<string>('NODE_ENV', 'development');
        if (env === 'production') {
          return new NodemailerMailService();
        }
        return new MockMailService();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['IMailService'],
})
export class MailModule {}
