# NestJS 后端设计规范

## 模块目录结构

每个业务模块必须包含以下文件结构：

```
modules/<module-name>/
├── <module-name>.module.ts        # NestJS Module 定义
├── <module-name>.controller.ts    # 路由控制器
├── <module-name>.service.ts       # 业务逻辑服务
├── dto/                           # 请求/响应数据传输对象
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
├── entities/                      # TypeORM 实体
│   └── <name>.entity.ts
├── guards/                        # 可选：路由守卫
├── pipes/                         # 可选：参数管道
└── interceptors/                  # 可选：拦截器
```

## 命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `task-status.enum.ts` |
| 类名 | PascalCase | `TasksService`, `CreateTaskDto` |
| 变量/方法 | camelCase | `findById`, `teamMembers` |
| 数据库表名 | snake_case | `team_members`, `task_files` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| 枚举值 | UPPER_SNAKE_CASE | `TaskStatus.IN_PROGRESS` |

## 分层职责

- **Controller**: 参数校验、调用 Service、格式化响应。不含业务逻辑。
- **Service**: 业务逻辑、数据操作。不直接操作 Request/Response。
- **Entity**: 数据模型映射。不含业务逻辑。
- **DTO**: 接口契约。Entity 不得直接暴露给客户端。

## 依赖注入规则

- 基础设施服务通过接口注入（`@Inject('IStorageService')`）
- 禁止在业务模块中直接 import 第三方 SDK（如 `@aws-sdk/client-s3`）
- 所有配置通过 `ConfigService` 读取，禁止 `process.env`

## 异常处理

- 业务异常继承 `BusinessException`
- 全局异常过滤器统一错误响应格式：`{ statusCode, message, error, timestamp, path }`
- 5xx 错误记录到 Logger
