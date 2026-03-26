import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { CommentType } from '@taskmanager/shared';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsEnum(CommentType)
  type: CommentType = CommentType.COMMENT;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
