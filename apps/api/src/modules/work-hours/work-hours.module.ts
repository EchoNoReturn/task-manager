import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskWorkHour } from './entities';
import { WorkHoursService } from './service';
import { WorkHoursController, WorkHoursUserController } from './controller';
import { Task } from '../tasks/entities';

@Module({
  imports: [TypeOrmModule.forFeature([TaskWorkHour, Task])],
  controllers: [WorkHoursController, WorkHoursUserController],
  providers: [WorkHoursService],
  exports: [WorkHoursService],
})
export class WorkHoursModule {}
