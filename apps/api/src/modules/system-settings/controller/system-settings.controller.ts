import { Controller, Get, Patch, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { SystemSettingsService } from '../service';
import { JwtAuthGuard, RolesGuard, CurrentUser } from '../../auth';
import { UserRole, RegistrationSettings } from '@taskmanager/shared';
import { UpdateRegistrationModeDto } from '../dto';

const ROLES_KEY = 'roles';
const AllowToRoles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Controller('api/system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('registration')
  async getRegistrationSettings(): Promise<RegistrationSettings> {
    return this.systemSettingsService.getRegistrationSettings();
  }

  @Patch('registration')
  @AllowToRoles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateRegistrationMode(
    @Body() dto: UpdateRegistrationModeDto,
  ): Promise<RegistrationSettings> {
    return this.systemSettingsService.updateRegistrationMode(dto.mode);
  }
}
