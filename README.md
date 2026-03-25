# Productor - 任务分发平台

一个现代化的任务分发平台，支持团队协作、任务管理、实时通知等功能。

## 技术栈

### Backend
- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Storage**: RustFS (S3-compatible)
- **Real-time**: WebSocket (Socket.io)
- **Authentication**: JWT

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design
- **State Management**: Zustand

## 项目结构

```
productor/
├── apps/
│   ├── api/              # NestJS 后端应用
│   │   └── src/
│   │       ├── modules/  # 功能模块
│   │       │   ├── auth/         # 认证模块
│   │       │   ├── users/        # 用户管理
│   │       │   ├── teams/        # 团队管理
│   │       │   ├── tasks/        # 任务管理
│   │       │   ├── files/        # 文件上传
│   │       │   ├── comments/     # 评论系统
│   │       │   ├── notifications/# 通知系统
│   │       │   ├── scheduling/   # 定时任务
│   │       │   └── ai/           # AI 功能
│   │       ├── infra/      # 基础设施
│   │       │   ├── database/     # 数据库模块
│   │       │   ├── storage/      # 存储服务
│   │       │   ├── mail/         # 邮件服务
│   │       │   └── realtime/     # 实时通信
│   │       └── common/     # 公共模块
│   └── web/               # React 前端应用
│       └── src/
│           ├── pages/     # 页面组件
│           ├── components/# 公共组件
│           ├── stores/    # 状态管理
│           └── api/       # API 请求
├── packages/
│   └── shared/            # 共享包
│       ├── entities/      # 实体类型定义
│       ├── enums/         # 枚举类型
│       └── types/         # 类型定义
└── docker-compose.yml     # Docker 配置
```

## 功能模块

- **用户认证**: 注册、登录、JWT 令牌刷新、密码重置
- **团队管理**: 创建团队、添加成员、角色管理
- **任务管理**: 
  - 任务创建、编辑、删除
  - 任务层级（父子任务）
  - 状态流转
  - 任务分配与认领
  - 截止日期管理
- **文件上传**: 支持文件上传和预览
- **评论系统**: 支持任务评论和状态变更日志
- **通知系统**: 实时通知推送
- **定时任务**: 自动标记过期任务
- **AI 助手**: 任务摘要和建议（预留）

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Docker (可选)

### 安装

```bash
# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env
# 编辑 .env 配置数据库等信息

# 启动 PostgreSQL (Docker)
docker compose up -d postgres

# 初始化数据库
pnpm db:migrate
```

### 开发

```bash
# 启动所有服务
pnpm dev

# 启动后端
pnpm --filter api dev

# 启动前端
pnpm --filter web dev
```

### 构建

```bash
pnpm build
```

### 测试

```bash
pnpm test
```

## API 文档

启动开发服务器后访问: `http://localhost:3000/api/docs`

## License

MIT
