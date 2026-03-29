import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateTransferRequestDto {
  @IsUUID()
  toUserId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectTransferRequestDto {
  @IsString()
  rejectionReason: string;
}