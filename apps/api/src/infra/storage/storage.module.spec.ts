import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageModule } from './storage.module';
import { RustFSStorageService } from './services/rustfs-storage.service';
import { IStorageService } from './interfaces';

describe('StorageModule', () => {
  let module: TestingModule;
  let storageService: IStorageService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [StorageModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            STORAGE_ENDPOINT: 'http://localhost:9000',
            STORAGE_REGION: 'us-east-1',
            STORAGE_ACCESS_KEY: 'test-key',
            STORAGE_SECRET_KEY: 'test-secret',
            STORAGE_BUCKET: 'test-bucket',
            MAX_FILE_SIZE: 10 * 1024 * 1024,
            ALLOWED_MIME_TYPES: 'image/png,image/jpeg,image/gif,application/pdf',
          };
          return config[key] ?? defaultValue;
        }),
      })
      .compile();

    storageService = module.get<IStorageService>('IStorageService');
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(storageService).toBeDefined();
  });

  it('should be instance of RustFSStorageService', () => {
    expect(storageService).toBeInstanceOf(RustFSStorageService);
  });

  it('should generate correct URL', () => {
    const url = storageService.getUrl('tasks/123/test.pdf');
    expect(url).toBe('http://localhost:9000/test-bucket/tasks/123/test.pdf');
  });

  it('should build correct key', () => {
    const key = storageService.buildKey('tasks', '123', 'test.pdf');
    expect(key).toBe('tasks/123/test.pdf');
  });

  it('should reject invalid file types', async () => {
    const buffer = Buffer.from('test content');
    await expect(
      storageService.upload(buffer, 'test.exe', 'application/x-executable'),
    ).rejects.toThrow('不支持的文件类型');
  });
});
