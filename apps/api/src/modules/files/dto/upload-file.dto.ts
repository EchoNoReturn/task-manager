import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UploadFileDto {
  @IsString()
  taskId: string;

  @IsOptional()
  @IsString()
  filename?: string;
}
