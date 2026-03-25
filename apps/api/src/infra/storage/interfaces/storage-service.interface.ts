export interface UploadResult {
  key: string;
  url: string;
}

export interface IStorageService {
  upload(
    file: Buffer | NodeJS.ReadableStream,
    key: string,
    contentType?: string,
  ): Promise<UploadResult>;

  download(key: string): Promise<Buffer>;

  delete(key: string): Promise<void>;

  getUrl(key: string): string;

  /**
   * 生成符合项目约定的文件 key
   * 格式: {module}/{entityId}/{filename}
   */
  buildKey(module: string, entityId: string, filename: string): string;
}
