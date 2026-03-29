import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { Task } from '../tasks/entities';
import { TaskWorkHour } from '../work-hours/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskWorkHour])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
