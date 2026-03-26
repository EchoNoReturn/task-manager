import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

@Injectable()
export class AdminInitService implements OnModuleInit {
  private readonly logger = new Logger(AdminInitService.name);
  private readonly adminEmail = 'admin@taskmanager.local';

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminPassword) {
      return;
    }

    this.logger.log('ADMIN_PASSWORD detected, updating admin user password...');

    const adminUser = await this.usersService.findByEmail(this.adminEmail);

    if (!adminUser) {
      this.logger.warn(`Admin user (${this.adminEmail}) not found, skipping password update`);
      return;
    }

    await this.usersService.updatePassword(adminUser.id, adminPassword);
    this.logger.log('Admin user password updated successfully');
  }
}