import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './infra/database';
import { StorageModule } from './infra/storage';
import { MailModule } from './infra/mail';
import { RealtimeModule } from './infra/realtime';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { TeamsModule } from './modules/teams';
import { TasksModule } from './modules/tasks';
import { FilesModule } from './modules/files';
import { CommentsModule } from './modules/comments';
import { NotificationsModule } from './modules/notifications';
import { SchedulingModule } from './modules/scheduling';
import { JwtAuthGuard } from './modules/auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    StorageModule,
    MailModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    TasksModule,
    FilesModule,
    CommentsModule,
    NotificationsModule,
    SchedulingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
