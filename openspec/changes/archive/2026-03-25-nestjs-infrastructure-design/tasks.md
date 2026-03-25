## 1. 项目目录结构与公共约定

- [x] 1.1 创建 `apps/api/src/infra/` 目录及 `database`、`storage`、`mail`、`realtime` 四个子目录
- [x] 1.2 创建 `apps/api/src/common/` 目录，存放通用异常类、常量、工具函数
- [x] 1.3 创建 `BaseEntity` 基类（id UUID、createdAt、updatedAt、deletedAt），放在 `common/entities/`
- [x] 1.4 创建统一异常基类 `BusinessException` 及全局异常过滤器，放在 `common/exceptions/`
- [x] 1.5 在 `common/` 下创建设计规范文档 `conventions.md`，约定模块结构、命名规则、分层原则

## 2. Database 基础设施模块

- [x] 2.1 创建 `infra/database/database.module.ts`，封装 `TypeOrmModule.forRoot()` 配置
- [x] 2.2 数据库连接参数通过 `ConfigService` 读取（DATABASE_URL、DB_HOST、DB_PORT 等）
- [x] 2.3 配置连接池（默认 poolSize: 10）
- [x] 2.4 创建 `src/database/migrations/` 目录，配置 TypeORM CLI 迁移脚本
- [x] 2.5 生产环境 `synchronize: false`、`migrationsRun: true`；开发环境允许 `synchronize: true`

## 3. Storage 基础设施模块

- [x] 3.1 定义 `IStorageService` 接口（upload、download、delete、getUrl），放在 `infra/storage/interfaces/`
- [x] 3.2 创建 `RustFSStorageService implements IStorageService`，使用 `@aws-sdk/client-s3`
- [x] 3.3 从 ConfigService 读取存储配置（STORAGE_ENDPOINT、ACCESS_KEY、SECRET_KEY、BUCKET）
- [x] 3.4 实现文件 key 前缀策略：`{module}/{entityId}/{filename}`
- [x] 3.5 实现文件大小和 MIME 类型校验，抛出 `FileSizeExceededException` 和 `InvalidFileTypeException`
- [x] 3.6 创建 `infra/storage/storage.module.ts`，通过 provide/inject 注册 `IStorageService`

## 4. Mail 基础设施模块（骨架）

- [x] 4.1 定义 `IMailService` 接口（send、sendTemplate），放在 `infra/mail/interfaces/`
- [x] 4.2 创建 `MockMailService` 实现，开发和测试环境输出到日志
- [x] 4.3 创建 `NodemailerMailService` 空实现（仅方法签名，不含逻辑）
- [x] 4.4 创建 `infra/mail/mail.module.ts`，根据 NODE_ENV 注册 Mock 或 Nodemailer 实现
- [x] 4.5 创建 `infra/mail/templates/` 目录结构（预留）

## 5. Realtime 基础设施模块

- [x] 5.1 创建 `RealtimeGateway`（@WebSocketGateway），统一管理 WebSocket 连接
- [x] 5.2 实现 JWT 鉴权中间件，在 WebSocket 握手阶段验证 token
- [x] 5.3 定义事件命名规范：`{domain}:{action}` 格式
- [x] 5.4 创建 `RealtimeService`，提供 `emit(event, payload, targets)` 和 `emitToRoom(room, event, payload)` 方法
- [x] 5.5 创建 `infra/realtime/realtime.module.ts`，注册 Gateway 和 Service

## 6. 集成验证

- [x] 6.1 在 AppModule 中导入 DatabaseModule、StorageModule、MailModule、RealtimeModule
- [x] 6.2 验证 `pnpm dev` 可启动且无编译错误
- [x] 6.3 验证数据库连接（docker-compose up PostgreSQL）
- [x] 6.4 验证 StorageModule 可实例化（mock endpoint 测试）
