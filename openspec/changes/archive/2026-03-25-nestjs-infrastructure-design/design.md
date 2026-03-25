## Context

项目为任务分发平台（Productor），后端采用 NestJS + TypeORM + PostgreSQL，计划包含 auth、users、teams、tasks、comments、files、notifications 等业务模块。对象存储使用 RustFS（兼容 S3 协议）。目前处于预实施阶段，尚无后端代码。

当前痛点：如果不预先约定模块结构和基础设施封装方式，业务模块各自引入第三方库会导致配置重复、职责混乱、测试困难。

## Goals / Non-Goals

**Goals:**
- 建立统一的 NestJS 模块组织规范，保证所有业务模块结构一致
- 将数据库、对象存储、邮件、WebSocket 等基础设施从业务模块中解耦出来
- 业务模块只依赖 infra 层的抽象接口，不直接依赖第三方 SDK
- 预留邮件模块接口，为后续通知需求做准备

**Non-Goals:**
- 不涉及前端设计规范（前端规范单独讨论）
- 不实现具体的业务逻辑（任务 CRUD、认证流程等）
- 不引入消息队列等额外中间件（当前规模不需要）
- 邮件模块仅预留接口和骨架，不实现具体发送逻辑

## Decisions

### 1. 采用自定义 Infra 目录而非 @nestjs/common 全局模块

**选择**: 在 `apps/api/src/infra/` 下按功能拆分子模块（database、storage、mail、realtime），每个子模块是独立的 NestJS Module。

**原因**:
- 比全局配置（如 TypeORM.forRoot 放在 AppModule）更清晰，各基础设施可独立测试
- 符合 NestJS 的模块化设计哲学，支持按需导入
- 业务模块通过 `import { DatabaseModule } from '@infra/database'` 引用，路径清晰

**替代方案考虑**: 全部放在 AppModule 的 providers 中 —— 缺点是 AppModule 膨胀、测试时难以 mock 单个基础设施。

### 2. 数据库层使用 TypeORM Repository 模式而非自定义基类

**选择**: 直接使用 TypeORM 的 `@InjectRepository()` + `Repository<T>`，不封装额外的 BaseRepository。

**原因**:
- TypeORM 自身的 Repository 已经提供了完整的 CRUD 能力
- 自定义基类增加学习成本且容易过早抽象
- DatabaseModule 仅负责连接配置（`TypeOrmModule.forRoot`）和迁移管理，业务模块各自声明 `TypeOrmModule.forFeature([Entity])`

**替代方案考虑**: 封装 BaseRepository —— 等出现重复模式后再抽取，避免过早抽象。

### 3. 对象存储层通过接口抽象 + 适配器模式

**选择**: 定义 `IStorageService` 接口（`upload`、`download`、`delete`、`getUrl`），由 `RustFSStorageService` 实现。业务模块注入 `IStorageService`。

**原因**:
- RustFS 兼容 S3 协议，使用 `@aws-sdk/client-s3`，未来切换存储后端只需替换实现
- 接口抽象方便单元测试时 mock
- 文件上传是核心功能（任务附件），需要稳定的契约

**替代方案考虑**: 直接在 files 模块中使用 S3Client —— 缺点是存储逻辑与业务逻辑耦合，切换成本高。

### 4. 邮件模块预留接口骨架

**选择**: 定义 `IMailService` 接口（`send`、`sendTemplate`），提供 `NodemailerMailService` 空实现 + 测试用 `MockMailService`。

**原因**:
- 超时通知等场景未来需要邮件能力，提前预留可避免后续大规模重构
- 空实现 + Mock 方便当前阶段不影响编译和测试
- 具体实现延后到需要时再填充

### 5. WebSocket 模块封装事件注册

**选择**: RealtimeModule 统一管理 WebSocket Gateway，业务模块通过事件名注册处理器，不各自创建 Gateway。

**原因**:
- 避免多个 Gateway 导致的端口冲突和连接管理混乱
- 统一的事件命名空间（`task:updated`、`notification:new`）便于前端消费
- 支持后期扩展（如房间隔离、权限控制）

**替代方案考虑**: 每个业务模块自建 Gateway —— 缺点是连接分散、难以统一鉴权。

## Risks / Trade-offs

- **过早抽象风险**: 邮件模块当前无实际需求，预留接口可能成为死代码。→ 只保留接口 + 空实现，不超过 3 个文件，成本可控。
- **TypeORM 版本锁定**: 使用 TypeORM 的 Repository 模式后，后续迁移成本取决于 TypeORM 的 API 稳定性。→ TypeORM 0.3.x 已趋于稳定，且 NestJS 官方推荐。
- **RustFS 兼容性**: RustFS 的 S3 兼容程度未知。→ 使用标准 S3 SDK，若有兼容问题可通过 endpoint 配置切换到 AWS S3 或 MinIO。
- **infra 目录粒度**: 按 4 个子模块拆分可能在项目早期显得过细。→ 每个模块文件数少（2-4 个），实际开销很小，且结构清晰有助于新人理解。

## Migration Plan

本项目为绿地项目（无存量代码），无需迁移。实施步骤：

1. 创建 `apps/api/src/infra/` 目录及四个子模块骨架
2. 创建 `apps/api/src/common/` 目录存放设计规范文档（.md）和通用工具
3. 按 PLAN.md Phase 1 流程初始化 NestJS 项目，同时导入 infra 模块
4. 业务模块开发时遵循规范，通过 DI 使用 infra 服务

## Open Questions

- RustFS 的实际 S3 兼容程度需要在 Phase 1 验证
- 邮件服务的具体选型（Nodemailer vs 其他）可在需要时再决定
- WebSocket 的鉴权策略（JWT 中间件）需在 auth 模块完成后确定
