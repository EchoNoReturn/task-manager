## ADDED Requirements

### Requirement: DatabaseModule 提供 TypeORM 连接配置

DatabaseModule SHALL 封装 `TypeOrmModule.forRoot()` 的配置，从 ConfigService 读取数据库连接参数，业务模块无需关心连接细节。

#### Scenario: 应用启动时建立数据库连接

- **WHEN** 应用启动
- **THEN** DatabaseModule SHALL 使用 ConfigService 提供的 `DATABASE_URL`、`DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD` 配置连接
- **AND** 连接 SHALL 配置连接池（默认 poolSize: 10）

### Requirement: 业务模块通过 forFeature 注册实体

每个业务模块 SHALL 使用 `TypeOrmModule.forFeature([Entity])` 注册自己的实体，DatabaseModule 不负责注册业务实体。

#### Scenario: TasksModule 注册 Task 实体

- **WHEN** TasksModule 被导入
- **THEN** TasksModule 的 imports 中 SHALL 包含 `TypeOrmModule.forFeature([Task])`
- **AND** TasksService 可通过 `@InjectRepository(Task)` 注入 Repository

### Requirement: 数据库迁移通过 CLI 管理

数据库迁移 SHALL 使用 TypeORM CLI 工具管理，迁移文件 SHALL 存放在 `apps/api/src/database/migrations/` 目录。

#### Scenario: 创建新迁移

- **WHEN** 开发者修改了 Entity 定义
- **THEN** 开发者 SHALL 运行 TypeORM CLI 生成迁移文件
- **AND** 迁移文件 SHALL 存放在 `src/database/migrations/` 目录下

#### Scenario: 运行迁移

- **WHEN** 应用部署或本地开发启动
- **THEN** 可通过 `pnpm migration:run` 执行待处理迁移
- **AND** 迁移 SHALL 按时间戳顺序执行

### Requirement: 实体基类提供通用字段

所有实体 SHALL 继承自 `BaseEntity`，BaseEntity 提供 `id`（UUID）、`createdAt`、`updatedAt`、`deletedAt`（软删除）四个通用字段。

#### Scenario: 新实体继承通用字段

- **WHEN** 开发者定义 Task 实体
- **THEN** Task SHALL `extends BaseEntity`
- **AND** Task 自动拥有 `id`、`createdAt`、`updatedAt`、`deletedAt` 字段，无需重复声明

### Requirement: 生产环境禁止 synchronize

数据库 synchronize 选项 SHALL 仅在开发环境启用，生产环境 SHALL 强制使用迁移管理 schema。

#### Scenario: 生产环境启动

- **WHEN** `NODE_ENV=production`
- **THEN** TypeORM 配置中 `synchronize` SHALL 为 `false`
- **AND** `migrationsRun` SHALL 为 `true`
