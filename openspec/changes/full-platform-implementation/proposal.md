## Why

Productor 需要完整的任务分发平台功能。目前已完成基础设施模块（数据库、存储、邮件、WebSocket），但核心业务模块（认证、任务管理、团队协作等）尚未实现。需要按 PLAN.md 的阶段规划逐步完成全部功能。

## What Changes

### Phase 1: 基础框架（已部分完成）
- Monorepo 结构（pnpm workspace）✓
- Docker Compose 配置（PostgreSQL + RustFS）✓
- NestJS 基础设施模块 ✓
- **待完成**: Auth 模块（注册/登录/JWT）

### Phase 2: 核心任务管理
- 任务 CRUD + 文件上传
- 任务层级关系（project → milestone → feature → subtask → bug）
- 状态流转引擎
- 评论和状态日志混合流
- 个人仪表盘 + 任务详情页

### Phase 3: 团队协作
- 团队管理 CRUD
- 小组任务自选池
- 超时通知 Cron（pending 任务超 30 分钟通知）
- 排期预估计算

### Phase 4: 管理员和日历
- 管理员视图（全局看板 + 筛选）
- 日历视图（月/周切换）

### Phase 5: AI 集成（预留）
- Claude API 接入任务描述增强

## Capabilities

### New Capabilities
- `user-auth`: 用户注册、登录、JWT 认证、角色权限管理
- `user-management`: 用户 CRUD、角色管理（admin/manager/member）
- `team-management`: 团队 CRUD、团队成员管理
- `task-management`: 任务 CRUD、层级关系、状态流转
- `file-upload`: RustFS 文件上传、附件管理
- `comment-system`: 评论 + 状态日志混合流
- `notification-system`: 实时通知（WebSocket）、超时提醒
- `scheduling`: 排期预估计算、Cron 定时任务
- `admin-dashboard`: 管理员全局视图、筛选功能
- `calendar-view`: 日历视图（月/周切换）
- `ai-assistance`: AI 任务描述增强（预留）

### Modified Capabilities
- `nestjs-design-conventions`: 更新以包含新增模块的规范

## Impact

- **后端**: 新增 `apps/api/src/modules/` 下的多个业务模块
- **前端**: 新增 `apps/web/` 下的 React 页面和组件
- **共享包**: 创建 `packages/shared/` 存放类型、枚举、常量
- **数据库**: 新增 users、teams、team_members、tasks、task_files、comments、notifications 等表
- **API**: 新增 REST API 端点和 WebSocket 事件
- **基础设施**: 复用已完成的基础设施模块
