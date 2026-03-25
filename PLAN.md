# 任务分发平台 - 实施计划

## Context

构建一个任务分发平台，支持任务发布、AI 增强（预留）、团队协作、日历排期、管理员视图等功能。技术栈：Vite + React 前端，NestJS 后端，PostgreSQL 数据库，RustFS 对象存储。

## 项目结构：Monorepo（pnpm workspace）

```
productor/
├── pnpm-workspace.yaml
├── package.json
├── docker-compose.yml              # PostgreSQL + RustFS
├── packages/
│   └── shared/                     # 共享类型、枚举、常量
└── apps/
    ├── api/                        # NestJS 后端
    │   └── src/
    │       ├── modules/
    │       │   ├── auth/           # JWT 认证
    │       │   ├── users/          # 用户管理
    │       │   ├── teams/          # 团队管理
    │       │   ├── tasks/          # 任务 CRUD + 状态流转 + 排期
    │       │   ├── comments/       # 评论 + 状态日志
    │       │   ├── files/          # RustFS 文件上传
    │       │   ├── notifications/  # 通知（WebSocket）
    │       │   └── ai/             # 预留 AI 模块
    │       └── scheduler/          # Cron 超时检测
    └── web/                        # Vite + React 前端
        └── src/
            ├── pages/              # 9 个页面
            ├── components/         # task / comment / calendar / team / file / dashboard
            ├── api/                # Axios 请求层
            ├── hooks/              # 自定义 hooks
            └── stores/             # Zustand 状态
```

## 数据库核心表

| 表 | 说明 |
|----|------|
| `users` | 用户（admin/manager/member 角色） |
| `teams` + `team_members` | 团队及成员关联 |
| `tasks` | 任务（支持层级：project→milestone→feature→subtask→bug） |
| `task_files` | 任务附件（RustFS key） |
| `comments` | 评论 + 状态日志混合流（type: comment/status_log/system） |
| `notifications` | 通知 |

任务层级概念（简化 Scrum）：**项目 → 里程碑 → 功能 → 子任务 → 缺陷**

任务状态流转：`draft → pending/assigned → in_progress → in_review → completed → closed`，支持 `blocked` 状态。

## API 设计

- `POST /api/tasks` — 创建任务（multipart，支持图片）
- `POST /api/tasks/:id/status` — 状态变更
- `POST /api/tasks/:id/assign` — 指派个人/团队
- `POST /api/tasks/:id/claim` — 小组成员接取任务
- `GET /api/tasks/assignee/:id/schedule` — 排期预估
- `GET /api/tasks/:id/comments` — 评论+日志混合流
- `POST /api/files/upload` — RustFS 文件上传
- WebSocket `/ws/notifications` — 实时通知

## 关键业务逻辑

1. **任务创建**：验证层级合法性，指派个人→status=assigned，指派团队→status=pending + 30分钟 claim_deadline
2. **排期计算**：`active_tasks 总工时 ÷ 8小时/天 = 预计可用日期`
3. **超时通知**：每分钟 cron 检查 pending 任务，超 30 分钟通知团队负责人+管理员
4. **评论+日志混合**：comments 表按 created_at 排序，前端根据 type 渲染不同样式

## 前端页面

| 路由 | 页面 |
|------|------|
| `/login` | 登录 |
| `/` | 个人仪表盘（任务列表+近期活动） |
| `/calendar` | 日历视图（月/周切换） |
| `/tasks` | 任务看板（筛选+列表） |
| `/tasks/new` | 创建任务（表单+AI面板预留） |
| `/tasks/:id` | 任务详情（描述+文件+状态流转+评论） |
| `/team-tasks` | 小组自选池 |
| `/admin` | 管理员全局视图 |

## 认证与权限

JWT（15min access + 7d refresh）。角色权限矩阵：
- **admin**：全权限，可管理用户角色、查看管理员视图
- **manager**：可创建项目/里程碑、指派任务、管理团队
- **member**：可创建子任务/缺陷、接取团队任务、修改自己相关任务状态

## 技术选型

| 层面 | 选型 |
|------|------|
| ORM | TypeORM |
| 前端状态 | Zustand |
| 前端路由 | React Router v6 |
| UI 库 | Ant Design 5 |
| Markdown | Milkdown |
| 日历 | react-big-calendar |
| WebSocket | @nestjs/websockets + socket.io |
| 定时任务 | @nestjs/schedule |
| OSS 客户端 | @aws-sdk/client-s3（兼容 RustFS） |

## 实施步骤（按阶段）

### Phase 1：基础框架
1. 初始化 Monorepo（pnpm workspace + docker-compose）
2. NestJS 项目初始化 + TypeORM entities + 数据库连接
3. Auth 模块（注册/登录/JWT）
4. 前端 Vite + React 初始化 + 路由 + 登录页

### Phase 2：核心任务管理
5. 任务 CRUD + 文件上传 + RustFS 集成
6. 任务层级关系 + 状态流转引擎
7. 评论和状态日志
8. 个人仪表盘 + 任务详情页

### Phase 3：团队协作
9. 团队管理 CRUD
10. 小组任务自选 + 超时通知 cron
11. 排期预估计算
12. 实时通知 WebSocket

### Phase 4：管理员和日历
13. 管理员视图（全局看板 + 筛选）
14. 日历视图

### Phase 5：AI 集成（后续）
15. Claude API 接入任务描述增强

## 验证方式

1. `docker-compose up` 启动 PostgreSQL + RustFS
2. `pnpm dev` 启动前后端
3. 注册用户 → 创建任务 → 指派 → 状态流转 → 评论 → 验证完整流程
4. 小组任务自选 + 超时通知验证
5. 管理员视图筛选验证
