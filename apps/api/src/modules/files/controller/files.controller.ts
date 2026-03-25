import { Controller, Post, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { FilesService } from '../service';
import { JwtAuthGuard, CurrentUser } from '../../auth';
import { TaskFile } from '../entities';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('tasks/:taskId/files')
  async findByTask(@Param('taskId') taskId: string): Promise<(TaskFile & { url: string })[]> {
    const files = await this.filesService.findByTask(taskId);
    return files.map(f => ({
      ...f,
      url: this.filesService.getUrl(f.fileKey),
    }));
  }

  @Delete('files/:key')
  async delete(@Param('key') key: string): Promise<{ message: string }> {
    await this.filesService.delete(key);
    return { message: '文件删除成功' };
  }
}
