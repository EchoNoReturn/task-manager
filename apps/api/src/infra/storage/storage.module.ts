import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IStorageService } from './interfaces';
import { RustFSStorageService } from './services/rustfs-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IStorageService',
      useClass: RustFSStorageService,
    },
  ],
  exports: ['IStorageService'],
})
export class StorageModule {}
