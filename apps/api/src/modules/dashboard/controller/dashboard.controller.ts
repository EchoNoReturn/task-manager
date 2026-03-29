import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { DashboardStatsResponse } from '../dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser } from '../../auth';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@CurrentUser('id') userId: string): Promise<DashboardStatsResponse> {
    return this.dashboardService.getStats(userId);
  }
}
