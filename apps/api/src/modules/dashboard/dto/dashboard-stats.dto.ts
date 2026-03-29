import { IsOptional, IsDateString } from 'class-validator';

export class GetDashboardStatsDto {
  @IsOptional()
  @IsDateString()
  weekStart?: string;

  @IsOptional()
  @IsDateString()
  monthStart?: string;
}

export class DashboardStatsResponse {
  completedTaskCount: number;
  weeklyAcceptedCount: number;
  monthlyAcceptedCount: number;
  inProgressCount: number;
  weeklyWorkHours: number;
  monthlyWorkHours: number;
}
