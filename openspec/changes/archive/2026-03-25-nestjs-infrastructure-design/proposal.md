## Why

当前项目处于预实施阶段，PLAN.md 确定了 NestJS 作为后端框架，但缺少统一的设计规范和基础设施抽象层。随着模块数量增长（auth、users、teams、tasks、comments、files、notifications 等），如果不在早期建立规范，容易出现：模块结构不一致、基础设施配置散落在各处、RustFS/PostgreSQL/邮件等外部依赖耦合度高、测试困难等问题。

现在建立设计规范和基础设施统一封装，可以确保后续模块开发的一致性和可维护性。

## What Changes

- 制定 NestJS 后端通用设计规范（模块结构、命名约定、分层规则等）
- 在 `apps/api/src/infra/` 下创建统一的基础设施目录，集中管理外部服务连接与封装
- 将数据库（PostgreSQL + TypeORM）、对象存储（RustFS/S3）、邮件服务、WebSocket 等基础设施模块化
- 业务模块通过依赖注入引用基础设施层，而非直接依赖第三方库

## Capabilities

### New Capabilities

- `nestjs-design-conventions`: NestJS 后端通用设计规范，包括模块组织、分层架构、命名约定、错误处理、DTO 设计等约定
- `infra-database`: 数据库基础设施模块，封装 TypeORM 连接配置、迁移策略、通用 Repository 基类
- `infra-storage`: 对象存储基础设施模块，封装 @aws-sdk/client-s3 与 RustFS 的集成，提供统一的文件上传/下载/删除接口
- `infra-mail`: 邮件服务基础设施模块，提供邮件发送的统一接口和模板管理（预留）
- `infra-realtime`: 实时通信基础设施模块，封装 @nestjs/websockets + socket.io，提供统一的 WebSocket 事件管理

### Modified Capabilities

- 无（项目尚未实施，无已有规范需要修改）

## Impact

- **目录结构**: `apps/api/src/` 下新增 `infra/` 目录，包含 database、storage、mail、realtime 四个子模块
- **业务模块**: 所有业务模块（auth、users、tasks 等）需通过导入 infra 模块获取基础设施服务，而非自行配置
- **docker-compose**: 需确保 PostgreSQL 和 RustFS 的配置与 infra 模块的环境变量对齐
- **无破坏性变更**: 项目尚未编码，不存在向后兼容问题
