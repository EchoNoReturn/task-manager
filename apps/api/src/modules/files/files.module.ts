import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './controller';
import { FilesService } from './service';
import { TaskFile } from './entities';
import { StorageModule } from '@infra/storage';

@Module({
  imports: [TypeOrmModule.forFeature([TaskFile]), StorageModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
