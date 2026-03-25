import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities';
import { CreateCommentDto, UpdateCommentDto } from '../dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async findByTask(taskId: string): Promise<Comment[]> {
    return this.commentRepo.find({
      where: { taskId, deletedAt: null as any },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(taskId: string, dto: CreateCommentDto, userId: string): Promise<Comment> {
    const comment = this.commentRepo.create({
      ...dto,
      taskId,
      userId,
    });
    return this.commentRepo.save(comment);
  }

  async update(id: string, dto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.commentRepo.findOne({ where: { id, deletedAt: null as any } });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('只能编辑自己的评论');
    }

    comment.content = dto.content;
    return this.commentRepo.save(comment);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id, deletedAt: null as any } });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('只能删除自己的评论');
    }

    comment.deletedAt = new Date();
    await this.commentRepo.save(comment);
  }
}
