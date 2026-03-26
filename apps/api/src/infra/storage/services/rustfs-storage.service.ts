import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { IStorageService, UploadResult } from '../interfaces';
import {
  FileSizeExceededException,
  InvalidFileTypeException,
} from '../storage.exceptions';

@Injectable()
export class RustFSStorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly logger = new Logger(RustFSStorageService.name);

  constructor(private readonly config: ConfigService) {
    this.client = new S3Client({
      endpoint: this.config.get<string>('STORAGE_ENDPOINT', 'http://localhost:9000'),
      region: this.config.get<string>('STORAGE_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.config.get<string>('STORAGE_ACCESS_KEY', ''),
        secretAccessKey: this.config.get<string>('STORAGE_SECRET_KEY', ''),
      },
      forcePathStyle: true,
    });

    this.bucket = this.config.get<string>('STORAGE_BUCKET', 'taskmanager');
    this.maxFileSize = this.config.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024);
    this.allowedMimeTypes = this.config
      .get<string>('ALLOWED_MIME_TYPES', 'image/png,image/jpeg,image/gif,application/pdf')
      .split(',');
  }

  async upload(
    file: Buffer | NodeJS.ReadableStream,
    key: string,
    contentType?: string,
  ): Promise<UploadResult> {
    if (contentType && !this.allowedMimeTypes.includes(contentType)) {
      throw new InvalidFileTypeException(this.allowedMimeTypes);
    }

    let body: Buffer;
    if (Buffer.isBuffer(file)) {
      if (file.length > this.maxFileSize) {
        throw new FileSizeExceededException(this.maxFileSize);
      }
      body = file;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of file) {
        chunks.push(Buffer.from(chunk));
      }
      body = Buffer.concat(chunks);
      if (body.length > this.maxFileSize) {
        throw new FileSizeExceededException(this.maxFileSize);
      }
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    this.logger.log(`文件上传成功: ${key}`);
    return { key, url: this.getUrl(key) };
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`文件删除成功: ${key}`);
  }

  getUrl(key: string): string {
    const endpoint = this.config.get<string>('STORAGE_ENDPOINT', 'http://localhost:9000');
    return `${endpoint}/${this.bucket}/${key}`;
  }

  buildKey(module: string, entityId: string, filename: string): string {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${module}/${entityId}/${safeName}`;
  }
}
