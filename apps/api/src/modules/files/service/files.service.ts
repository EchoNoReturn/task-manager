import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskFile } from '../entities';
import { IStorageService } from '../../../infra/storage/interfaces';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(TaskFile)
    private readonly fileRepo: Repository<TaskFile>,
    @Inject('IStorageService')
    private readonly storage: IStorageService,
  ) {}

  async upload(taskId: string, file: Buffer, filename: string, mimeType: string): Promise<TaskFile> {
    const key = this.storage.buildKey('tasks', taskId, filename);
    await this.storage.upload(file, key, mimeType);

    const taskFile = this.fileRepo.create({
      taskId,
      fileKey: key,
      filename,
      mimeType,
      size: file.length,
    });

    return this.fileRepo.save(taskFile);
  }

  async findByTask(taskId: string): Promise<TaskFile[]> {
    return this.fileRepo.find({ where: { taskId } });
  }

  async delete(key: string): Promise<void> {
    const file = await this.fileRepo.findOne({ where: { fileKey: key } });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    await this.storage.delete(key);
    await this.fileRepo.remove(file);
  }

  getUrl(key: string): string {
    return this.storage.getUrl(key);
  }
}
