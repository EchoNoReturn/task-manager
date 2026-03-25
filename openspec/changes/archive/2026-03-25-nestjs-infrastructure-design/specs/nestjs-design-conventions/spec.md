## ADDED Requirements

### Requirement: 模块目录结构一致

每个业务模块 SHALL 遵循统一的目录结构，包含 controller、service、dto、entity、module 五个文件，以及可选的 guard、pipe、interceptor。

#### Scenario: 创建新业务模块

- **WHEN** 开发者创建新业务模块（如 `tasks`）
- **THEN** 模块目录下 SHALL 包含以下文件：`tasks.module.ts`、`tasks.controller.ts`、`tasks.service.ts`、`dto/` 目录、`entities/` 目录

### Requirement: 命名约定统一

所有文件、类、变量 SHALL 遵循一致的命名约定：文件名 kebab-case，类名 PascalCase，变量/方法 camelCase，数据库表名 snake_case，常量 UPPER_SNAKE_CASE。

#### Scenario: 检查命名合规

- **WHEN** 开发者提交代码
- **THEN** 文件名 SHALL 为 kebab-case（如 `task-status.enum.ts`）
- **AND** 类名 SHALL 为 PascalCase（如 `TaskStatusEnum`、`TasksService`）
- **AND** 数据库表名 SHALL 为 snake_case（如 `team_members`）

### Requirement: 分层架构职责清晰

业务模块 SHALL 严格分为 Controller（路由/入参校验）、Service（业务逻辑）、Entity（数据模型）三层，禁止跨层直接调用。

#### Scenario: Controller 不包含业务逻辑

- **WHEN** Controller 接收请求
- **THEN** Controller SHALL 仅负责参数校验、调用 Service、返回响应
- **AND** Controller SHALL NOT 包含业务计算或数据库操作

#### Scenario: Service 不直接操作 HTTP

- **WHEN** Service 执行业务逻辑
- **THEN** Service SHALL NOT 直接访问 Request/Response 对象
- **AND** Service SHALL 通过 Repository 或注入的基础设施服务操作数据

### Requirement: DTO 用于所有入参和出参

所有 API 接口 SHALL 使用 DTO（Data Transfer Object）定义请求体和响应体，禁止直接暴露 Entity。

#### Scenario: 创建任务接口

- **WHEN** 客户端调用 `POST /api/tasks`
- **THEN** 请求体 SHALL 使用 `CreateTaskDto` 进行校验
- **AND** 响应体 SHALL 使用 `TaskResponseDto` 序列化，不暴露内部字段（如 `deletedAt`）

### Requirement: 统一异常处理

所有业务异常 SHALL 继承自统一的基类异常，Controller 层使用全局异常过滤器统一格式化错误响应。

#### Scenario: 任务不存在时抛出业务异常

- **WHEN** 用户请求不存在的任务 ID
- **THEN** Service SHALL 抛出 `TaskNotFoundException`（继承自 `BusinessException`）
- **AND** 全局异常过滤器 SHALL 返回标准错误格式：`{ statusCode, message, error }`

### Requirement: 依赖注入通过接口

业务模块 SHALL 通过接口（`IStorageService`、`IMailService` 等）引用基础设施服务，禁止直接依赖具体实现类。

#### Scenario: 文件模块使用存储服务

- **WHEN** FilesModule 需要上传文件
- **THEN** FilesModule SHALL 通过 `@Inject('IStorageService')` 注入存储接口
- **AND** FilesModule SHALL NOT 直接 import `@aws-sdk/client-s3`

### Requirement: 环境变量通过 ConfigModule 管理

所有配置 SHALL 通过 `@nestjs/config` 的 `ConfigService` 读取，禁止在代码中硬编码配置值或直接使用 `process.env`。

#### Scenario: 读取数据库连接配置

- **WHEN** DatabaseModule 初始化连接
- **THEN** 连接字符串 SHALL 通过 `configService.get<string>('DATABASE_URL')` 获取
- **AND** 代码中 SHALL NOT 出现 `process.env.DATABASE_URL`
