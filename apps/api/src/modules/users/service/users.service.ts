import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities';
import { UserRole, UserPublic, PaginatedResult } from '@productor/shared';
import { UpdateProfileDto, UpdateRoleDto } from '../dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(page: number = 1, limit: number = 20): Promise<PaginatedResult<UserPublic>> {
    const [users, total] = await this.userRepo.findAndCount({
      where: { deletedAt: null as any },
      select: ['id', 'email', 'role', 'nickname', 'avatarUrl', 'createdAt'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<UserPublic> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: null as any },
      select: ['id', 'email', 'role', 'nickname', 'avatarUrl', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserPublic> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.nickname) {
      user.nickname = dto.nickname;
    }
    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    await this.userRepo.save(user);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }

  async updateRole(targetUserId: string, dto: UpdateRoleDto, currentUserId: string): Promise<void> {
    if (targetUserId === currentUserId) {
      throw new ForbiddenException('不能修改自己的角色');
    }

    const user = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.role = dto.role;
    await this.userRepo.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.deletedAt = new Date();
    await this.userRepo.save(user);
  }
}
