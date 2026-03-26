import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller';
import { UsersService, AdminInitService } from './service';
import { User } from '../auth/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, AdminInitService],
  exports: [UsersService],
})
export class UsersModule {}
