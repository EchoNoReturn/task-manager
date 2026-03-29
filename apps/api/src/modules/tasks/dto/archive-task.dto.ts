import { IsOptional, IsString } from 'class-validator';

export class ArchiveTaskDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
