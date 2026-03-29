import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './controller';
import { TasksService } from './service';
import { Task, TaskTransferRequest } from './entities';
import { TeamMember } from '../teams/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TeamMember, TaskTransferRequest])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
