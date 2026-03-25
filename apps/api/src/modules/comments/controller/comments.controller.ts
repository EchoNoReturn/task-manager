import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommentsService } from '../service';
import { JwtAuthGuard, CurrentUser } from '../../auth';
import { Comment } from '../entities';
import { CreateCommentDto, UpdateCommentDto } from '../dto';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('tasks/:taskId/comments')
  async findByTask(@Param('taskId') taskId: string): Promise<Comment[]> {
    return this.commentsService.findByTask(taskId);
  }

  @Post('tasks/:taskId/comments')
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<Comment> {
    return this.commentsService.create(taskId, dto, userId);
  }

  @Patch('comments/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
  ): Promise<Comment> {
    return this.commentsService.update(id, dto, userId);
  }

  @Delete('comments/:id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    await this.commentsService.delete(id, userId);
    return { message: '评论删除成功' };
  }
}
