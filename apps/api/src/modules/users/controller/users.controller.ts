import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../service';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser, Public } from '../../auth';
import { UserRole, UserPublic, PaginatedResult } from '@productor/shared';
import { UpdateProfileDto, UpdateRoleDto, ListUsersDto } from '../dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async list(@Query() query: ListUsersDto): Promise<PaginatedResult<UserPublic>> {
    return this.usersService.findAll(query.page, query.limit);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string): Promise<UserPublic> {
    return this.usersService.findById(id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserPublic> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<{ message: string }> {
    await this.usersService.updateRole(id, dto, currentUserId);
    return { message: '角色更新成功' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.deleteUser(id);
    return { message: '用户删除成功' };
  }
}
