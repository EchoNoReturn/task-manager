import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities';
import { TaskStatus, TaskType, TASK_HIERARCHY, PaginatedResult, ScheduleResult, TASK_CLAIM_DEADLINE_MINUTES } from '@taskmanager/shared';
import { CreateTaskDto, UpdateTaskDto, UpdateStatusDto, AssignTaskDto, ListTasksDto } from '../dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    if (dto.parentId) {
      await this.validateHierarchy(dto.type, dto.parentId);
    }

    const task = this.taskRepo.create({
      ...dto,
      createdBy: userId,
      status: TaskStatus.DRAFT,
    });

    return this.taskRepo.save(task);
  }

  async findById(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id, deletedAt: null as any },
      relations: ['assignee', 'team', 'parent'],
    });
    if (!task) {
      throw new NotFoundException('任务不存在');
    }
    return task;
  }

  async findAll(query: ListTasksDto): Promise<PaginatedResult<Task>> {
    const { page = 1, limit = 20, status, type, assigneeId, teamId } = query;

    const queryBuilder = this.taskRepo
      .createQueryBuilder('task')
      .where('task.deletedAt IS NULL');

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

  async update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findById(id);
    this.checkUpdatePermission(task, userId);

    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async delete(id: string, userId: string): Promise<void> {
    const task = await this.findById(id);
    this.checkUpdatePermission(task, userId);
    task.deletedAt = new Date();
    await this.taskRepo.save(task);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string): Promise<Task> {
    const task = await this.findById(id);
    this.checkUpdatePermission(task, userId);

    if (!this.isValidTransition(task.status, dto.status)) {
      throw new BadRequestException(`无效的状态流转: ${task.status} -> ${dto.status}`);
    }

    task.status = dto.status;
    return this.taskRepo.save(task);
  }

  async assign(id: string, dto: AssignTaskDto, userId: string): Promise<Task> {
    const task = await this.findById(id);
    this.checkUpdatePermission(task, userId);

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

  async claim(id: string, userId: string): Promise<Task> {
    const task = await this.findById(id);

    if (task.status !== TaskStatus.PENDING) {
      throw new BadRequestException('只能认领待认领的任务');
    }

    if (task.claimDeadline && task.claimDeadline < new Date()) {
      throw new BadRequestException('认领已超时');
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

  private checkUpdatePermission(task: Task, userId: string): void {
  }
}
