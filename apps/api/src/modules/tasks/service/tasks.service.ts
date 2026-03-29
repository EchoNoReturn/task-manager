import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskTransferRequest, TransferStatus } from '../entities';
import { TeamMember, TeamMemberRole } from '../../teams/entities';
import { TaskStatus, TaskType, TASK_HIERARCHY, PaginatedResult, ScheduleResult, TASK_CLAIM_DEADLINE_MINUTES, UserRole } from '@taskmanager/shared';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, AssignTaskDto, ListTasksDto, CreateTransferRequestDto, RejectTransferRequestDto } from '../dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TeamMember)
    private readonly memberRepo: Repository<TeamMember>,
    @InjectRepository(TaskTransferRequest)
    private readonly transferRepo: Repository<TaskTransferRequest>,
  ) {}

  private async getUserTeamIds(userId: string): Promise<string[]> {
    const memberships = await this.memberRepo.find({ where: { userId } });
    return memberships.map(m => m.teamId);
  }

  private async isTeamLeader(userId: string, teamId: string): Promise<boolean> {
    const membership = await this.memberRepo.findOne({
      where: { userId, teamId, role: TeamMemberRole.LEADER },
    });
    return !!membership;
  }

  private async getTeamLeaderTeamIds(userId: string): Promise<string[]> {
    const memberships = await this.memberRepo.find({
      where: { userId, role: TeamMemberRole.LEADER },
    });
    return memberships.map(m => m.teamId);
  }

  private async checkTaskVisibility(task: Task, userId: string, userRole: UserRole): Promise<boolean> {
    if (userRole === UserRole.ADMIN) {
      return true;
    }
    if (task.createdBy === userId || task.assigneeId === userId) {
      return true;
    }
    if (task.teamId) {
      const userTeamIds = await this.getUserTeamIds(userId);
      return userTeamIds.includes(task.teamId);
    }
    return false;
  }

async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    if (dto.parentId) {
      await this.validateHierarchy(dto.type, dto.parentId);
    }

    let status = TaskStatus.DRAFT;
    if (dto.assigneeId) {
      status = TaskStatus.ASSIGNED;
    } else if (dto.teamId) {
      status = TaskStatus.PENDING;
    }

    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      parentId: dto.parentId,
      assigneeId: dto.assigneeId,
      teamId: dto.teamId,
      estimatedHours: dto.estimatedHours,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy: userId,
      status,
      claimDeadline: dto.teamId && !dto.assigneeId
        ? new Date(Date.now() + TASK_CLAIM_DEADLINE_MINUTES * 60 * 1000)
        : null,
    });

    return this.taskRepo.save(task);
  }

  async findById(id: string, userId: string, userRole: UserRole): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id, deletedAt: null as any },
      relations: ['assignee', 'team', 'parent'],
    });
    if (!task) {
      throw new NotFoundException('任务不存在');
    }
    const canSee = await this.checkTaskVisibility(task, userId, userRole);
    if (!canSee) {
      throw new NotFoundException('任务不存在');
    }
    return task;
  }

  async findAll(query: ListTasksDto, userId: string, userRole: UserRole): Promise<PaginatedResult<Task>> {
    const { page = 1, limit = 20, status, type, assigneeId, teamId, createdBy } = query;

    const queryBuilder = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.deletedAt IS NULL');

    if (userRole !== UserRole.ADMIN) {
      const userTeamIds = await this.getUserTeamIds(userId);
      queryBuilder.andWhere(
        `(task.createdBy = :userId OR task.assigneeId = :userId OR task.teamId IN (:...userTeamIds))`,
        { userId, userTeamIds: userTeamIds.length > 0 ? userTeamIds : [''] },
      );
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }
    if (type) {
      queryBuilder.andWhere('task.type = :type', { type });
    }
    if (assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }
    if (teamId) {
      queryBuilder.andWhere('task.teamId = :teamId', { teamId });
    }
    if (createdBy) {
      queryBuilder.andWhere('task.createdBy = :createdBy', { createdBy });
    }

    const [tasks, total] = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyCreatedTeamTasks(userId: string): Promise<{ data: Task[] }> {
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.deletedAt IS NULL')
      .andWhere('task.createdBy = :userId', { userId })
      .andWhere('task.teamId IS NOT NULL')
      .orderBy('task.createdAt', 'DESC')
      .getMany();
    return { data: tasks };
  }

  async findMyClaimedTeamTasks(userId: string): Promise<{ data: Task[] }> {
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.deletedAt IS NULL')
      .andWhere('task.assigneeId = :userId', { userId })
      .andWhere('task.teamId IS NOT NULL')
      .orderBy('task.createdAt', 'DESC')
      .getMany();
    return { data: tasks };
  }

  async findMyCreatedTasks(userId: string): Promise<{ data: Task[] }> {
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.deletedAt IS NULL')
      .andWhere('task.createdBy = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .getMany();
    return { data: tasks };
  }

  async findMyAssignedTasks(userId: string): Promise<{ data: Task[] }> {
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('task.deletedAt IS NULL')
      .andWhere('task.assigneeId = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .getMany();
    return { data: tasks };
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, userRole: UserRole): Promise<Task> {
    const task = await this.findById(id, userId, userRole);
    await this.checkUpdatePermission(task, userId, userRole);

    if (await this.hasPendingTransfer(id)) {
      throw new BadRequestException('任务流转申请处理中，无法更新任务');
    }

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const task = await this.findById(id, userId, userRole);
    await this.checkUpdatePermission(task, userId, userRole);

    if (task.status !== TaskStatus.DRAFT && task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('只有草稿和待认领状态的任务可以删除，其他任务请使用归档功能');
    }

    task.deletedAt = new Date();
    await this.taskRepo.save(task);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string, userRole: UserRole): Promise<Task> {
    const task = await this.findById(id, userId, userRole);
    await this.checkUpdatePermission(task, userId, userRole);

    if (await this.hasPendingTransfer(id)) {
      throw new BadRequestException('任务流转申请处理中，无法更新任务状态');
    }

    if (!this.isValidTransition(task.status, dto.status)) {
      throw new BadRequestException(`无效的状态流转: ${task.status} -> ${dto.status}`);
    }

    task.status = dto.status;
    return this.taskRepo.save(task);
  }

  async assign(id: string, dto: AssignTaskDto, userId: string, userRole: UserRole): Promise<Task> {
    const task = await this.findById(id, userId, userRole);
    await this.checkUpdatePermission(task, userId, userRole);

    if (await this.hasPendingTransfer(id)) {
      throw new BadRequestException('任务流转申请处理中，无法分配任务');
    }

    if (dto.userId) {
      task.assigneeId = dto.userId;
      task.teamId = null;
      task.status = TaskStatus.ASSIGNED;
    } else if (dto.teamId) {
      task.teamId = dto.teamId;
      task.assigneeId = null;
      task.status = TaskStatus.PENDING;
      task.claimDeadline = new Date(Date.now() + TASK_CLAIM_DEADLINE_MINUTES * 60 * 1000);
    } else {
      throw new BadRequestException('必须指定 userId 或 teamId');
    }

    return this.taskRepo.save(task);
  }

  async claim(id: string, userId: string, userRole: UserRole): Promise<Task> {
    const task = await this.findById(id, userId, userRole);

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('只能认领待认领的任务');
    }

    if (task.claimDeadline && task.claimDeadline < new Date()) {
      throw new BadRequestException('认领已超时');
    }

    if (task.teamId) {
      const userTeamIds = await this.getUserTeamIds(userId);
      if (!userTeamIds.includes(task.teamId)) {
        throw new ForbiddenException('只有团队成员才能认领该任务');
      }
    }

    task.assigneeId = userId;
    task.status = TaskStatus.ASSIGNED;
    task.claimDeadline = null;

    return this.taskRepo.save(task);
  }

  async getSchedule(userId: string): Promise<ScheduleResult> {
    const activeTasks = await this.taskRepo.find({
      where: {
        assigneeId: userId,
        status: TaskStatus.ASSIGNED,
        deletedAt: null as any,
      },
    });

    const totalHours = activeTasks.reduce((sum, task) => {
      return sum + (task.estimatedHours || 0);
    }, 0);

    const estimatedDays = Math.ceil(totalHours / 8);
    const availableDate = new Date();
    availableDate.setDate(availableDate.getDate() + estimatedDays);

    return {
      userId,
      totalHours,
      estimatedDays,
      availableDate,
    };
  }

  private async validateHierarchy(type: TaskType, parentId: string): Promise<void> {
    const parent = await this.taskRepo.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException('父任务不存在');
    }

    const expectedParentType = TASK_HIERARCHY[type];
    if (!expectedParentType) {
      return;
    }

    if (parent.type !== expectedParentType) {
      throw new BadRequestException(
        `层级错误: ${type} 任务只能属于 ${expectedParentType} 类型的任务`,
      );
    }
  }

  private isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.DRAFT]: [TaskStatus.PENDING, TaskStatus.ASSIGNED],
      [TaskStatus.PENDING]: [TaskStatus.ASSIGNED],
      [TaskStatus.ASSIGNED]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.IN_REVIEW, TaskStatus.BLOCKED],
      [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_REVIEW]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS],
      [TaskStatus.COMPLETED]: [TaskStatus.CLOSED],
      [TaskStatus.CLOSED]: [],
    };

    return validTransitions[from]?.includes(to) || false;
  }

  private async checkUpdatePermission(task: Task, userId: string, userRole: UserRole): Promise<void> {
    if (userRole === UserRole.ADMIN) {
      return;
    }

    if (task.assigneeId === userId) {
      return;
    }

    if (task.createdBy === userId) {
      return;
    }

    if (task.teamId) {
      const userTeamIds = await this.getUserTeamIds(userId);
      if (userTeamIds.includes(task.teamId)) {
        return;
      }
    }

    throw new ForbiddenException('只有任务负责人、创建者、团队成员或管理员可以修改此任务');
  }

  private async hasPendingTransfer(taskId: string): Promise<boolean> {
    const pending = await this.transferRepo.findOne({
      where: { taskId, status: TransferStatus.PENDING },
    });
    return !!pending;
  }

  private async getUserTeamIdForTask(task: Task, userId: string): Promise<string | null> {
    if (!task.teamId) {
      return null;
    }
    const membership = await this.memberRepo.findOne({
      where: { teamId: task.teamId, userId },
    });
    return membership?.teamId || null;
  }

  async createTransferRequest(taskId: string, dto: CreateTransferRequestDto, fromUserId: string): Promise<TaskTransferRequest> {
    const task = await this.findById(taskId, fromUserId, UserRole.MEMBER);

    if (task.assigneeId !== fromUserId) {
      throw new ForbiddenException('只有任务负责人可以发起流转');
    }

    if (await this.hasPendingTransfer(taskId)) {
      throw new BadRequestException('任务已有待处理的流转申请');
    }

    const fromUserTeamId = await this.getUserTeamIdForTask(task, dto.toUserId);
    if (!fromUserTeamId) {
      throw new ForbiddenException('被流转人必须是同组人员');
    }

    const transfer = this.transferRepo.create({
      taskId,
      fromUserId,
      toUserId: dto.toUserId,
      reason: dto.reason,
      status: TransferStatus.PENDING,
    });

    return this.transferRepo.save(transfer);
  }

  async getPendingTransfersForUser(userId: string): Promise<TaskTransferRequest[]> {
    return this.transferRepo.find({
      where: { toUserId: userId, status: TransferStatus.PENDING },
      relations: ['task', 'fromUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptTransfer(transferId: string, userId: string): Promise<Task> {
    const transfer = await this.transferRepo.findOne({
      where: { id: transferId, toUserId: userId, status: TransferStatus.PENDING },
      relations: ['task'],
    });

    if (!transfer) {
      throw new NotFoundException('流转申请不存在或已处理');
    }

    transfer.status = TransferStatus.ACCEPTED;
    await this.transferRepo.save(transfer);

    const task = await this.taskRepo.findOne({ where: { id: transfer.taskId } });
    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    task.assigneeId = userId;
    task.status = TaskStatus.ASSIGNED;
    return this.taskRepo.save(task);
  }

  async rejectTransfer(transferId: string, userId: string, dto: RejectTransferRequestDto): Promise<TaskTransferRequest> {
    const transfer = await this.transferRepo.findOne({
      where: { id: transferId, toUserId: userId, status: TransferStatus.PENDING },
    });

    if (!transfer) {
      throw new NotFoundException('流转申请不存在或已处理');
    }

    transfer.status = TransferStatus.REJECTED;
    transfer.rejectionReason = dto.rejectionReason;
    return this.transferRepo.save(transfer);
  }

  async archive(id: string, userId: string, userRole: UserRole, reason?: string): Promise<Task> {
    const task = await this.findById(id, userId, userRole);
    await this.checkUpdatePermission(task, userId, userRole);

    if (task.status === TaskStatus.DRAFT || task.status === TaskStatus.PENDING) {
      throw new BadRequestException('草稿和待认领状态的任务请使用删除功能');
    }

    if (task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CLOSED) {
      if (!reason || reason.trim() === '') {
        throw new BadRequestException('归档非已完成/已关闭状态的任务必须提供归档理由');
      }
      task.archiveReason = reason;
    }

    task.archivedAt = new Date();
    task.archivedBy = userId;
    return this.taskRepo.save(task);
  }

  async findAllTeamTasks(teamId: string, userId: string, userRole: UserRole): Promise<PaginatedResult<Task>> {
    if (userRole !== UserRole.ADMIN) {
      const isLeader = await this.isTeamLeader(userId, teamId);
      if (!isLeader) {
        throw new ForbiddenException('只有团队组长可以查看团队所有任务');
      }
    }

    const [tasks, total] = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('task.teamId = :teamId', { teamId })
      .andWhere('task.deletedAt IS NULL')
      .orderBy('task.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: tasks,
      total,
      page: 1,
      limit: tasks.length,
      totalPages: 1,
    };
  }

  async getTeamMembersTaskStatus(teamId: string, userId: string): Promise<{ memberId: string; memberName: string; taskCount: number; claimedCount: number; unclaimedCount: number }[]> {
    const isLeader = await this.isTeamLeader(userId, teamId);
    if (!isLeader) {
      throw new ForbiddenException('只有团队组长可以查看组员任务状态');
    }

    const members = await this.memberRepo.find({
      where: { teamId },
      relations: ['user'],
    });

    const teamTasks = await this.taskRepo
      .createQueryBuilder('task')
      .where('task.teamId = :teamId', { teamId })
      .andWhere('task.deletedAt IS NULL')
      .getMany();

    return members.map(member => {
      const memberTasks = teamTasks.filter(t => t.assigneeId === member.userId);
      const unclaimedTasks = teamTasks.filter(t => !t.assigneeId);
      return {
        memberId: member.userId,
        memberName: member.user?.nickname || member.userId,
        taskCount: memberTasks.length,
        claimedCount: memberTasks.length,
        unclaimedCount: unclaimedTasks.length,
      };
    });
  }

  async findArchived(userId: string, userRole: UserRole, search?: string): Promise<PaginatedResult<Task>> {
    const queryBuilder = this.taskRepo
      .createQueryBuilder('task')
      .where('task.archivedAt IS NOT NULL')
      .andWhere('task.deletedAt IS NULL');

    if (userRole !== UserRole.ADMIN) {
      queryBuilder.andWhere('(task.createdBy = :userId OR task.assigneeId = :userId)', { userId });
    }

    if (search) {
      queryBuilder.andWhere('(task.title LIKE :search OR task.description LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [tasks, total] = await queryBuilder
      .orderBy('task.archivedAt', 'DESC')
      .getManyAndCount();

    return {
      data: tasks,
      total,
      page: 1,
      limit: tasks.length,
      totalPages: 1,
    };
  }
}
