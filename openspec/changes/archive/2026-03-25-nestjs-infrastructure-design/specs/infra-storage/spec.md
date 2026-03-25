## ADDED Requirements

### Requirement: StorageModule 提供统一的文件存储接口

StorageModule SHALL 定义 `IStorageService` 接口，包含 `upload`、`download`、`delete`、`getUrl` 四个方法，业务模块通过接口操作文件。

#### Scenario: 上传任务附件

- **WHEN** 用户上传任务附件
- **THEN** FilesService SHALL 调用 `IStorageService.upload(file, key)` 上传文件
- **AND** 返回值 SHALL 包含存储 key 和可访问 URL

### Requirement: RustFS 作为默认存储实现

StorageModule SHALL 提供 `RustFSStorageService` 作为 `IStorageService` 的默认实现，使用 `@aws-sdk/client-s3` 与 RustFS 通信。

#### Scenario: 初始化存储客户端

- **WHEN** StorageModule 被导入
- **THEN** RustFSStorageService SHALL 从 ConfigService 读取 `STORAGE_ENDPOINT`、`STORAGE_ACCESS_KEY`、`STORAGE_SECRET_KEY`、`STORAGE_BUCKET` 配置
- **AND** 使用标准 S3 协议连接 RustFS

### Requirement: 存储实现可替换

IStorageService SHALL 通过 NestJS 的 provide/inject 机制注册，替换存储后端只需提供新的 Service 实现并修改 provider 配置。

#### Scenario: 切换到 AWS S3

- **WHEN** 需要从 RustFS 迁移到 AWS S3
- **THEN** 开发者 SHALL 实现新的 `AwsS3StorageService implements IStorageService`
- **AND** 在 StorageModule 中修改 provider 配置：`{ provide: 'IStorageService', useClass: AwsS3StorageService }`
- **AND** 业务模块代码 SHALL 无需任何修改

### Requirement: 文件 key 采用统一前缀策略

文件存储 key SHALL 采用 `{module}/{entityId}/{filename}` 格式，确保文件在存储桶中有清晰的组织结构。

#### Scenario: 上传任务附件

- **WHEN** 为任务 `abc-123` 上传附件 `design.png`
- **THEN** 存储 key SHALL 为 `tasks/abc-123/design.png`

### Requirement: 文件大小和类型限制可配置

StorageModule SHALL 支持通过配置限制上传文件的最大大小和允许的 MIME 类型。

#### Scenario: 超出文件大小限制

- **WHEN** 用户上传超过 `MAX_FILE_SIZE`（默认 10MB）的文件
- **THEN** StorageModule SHALL 抛出 `FileSizeExceededException`
- **AND** 拒绝上传并返回明确的错误信息

#### Scenario: 不允许的文件类型

- **WHEN** 用户上传不在 `ALLOWED_MIME_TYPES` 列表中的文件
- **THEN** StorageModule SHALL 抛出 `InvalidFileTypeException`
