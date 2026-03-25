import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './controller';
import { FilesService } from './service';
import { TaskFile } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([TaskFile])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
