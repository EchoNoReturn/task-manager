## 1. 共享包和类型定义

- [x] 1.1 创建 `packages/shared/` 目录结构
- [x] 1.2 定义 User、Team、Task、Comment、Notification 等实体类型
- [x] 1.3 定义枚举：UserRole、TaskStatus、TaskType、NotificationType
- [x] 1.4 导出共享类型供 api 和 web 使用

## 2. Auth 模块

- [x] 2.1 创建 `modules/auth/` 目录结构（controller、service、dto、guards、strategies）
- [x] 2.2 实现 Users 实体（id, email, passwordHash, role, nickname, avatarUrl）
- [x] 2.3 实现注册接口 POST /api/auth/register（含密码哈希 bcrypt）
- [x] 2.4 实现登录接口 POST /api/auth/login（返回 access + refresh token）
- [x] 2.5 实现 Refresh Token 接口 POST /api/auth/refresh
- [x] 2.6 实现登出接口 POST /api/auth/logout
- [x] 2.7 实现密码重置请求 POST /api/auth/password-reset
- [x] 2.8 实现密码重置确认 POST /api/auth/password-reset/confirm
- [x] 2.9 实现 JWT Auth Guard 保护 API 端点
- [x] 2.10 实现 JWT Strategy（Passport）
- [x] 2.11 创建 Auth 模块并注册到 AppModule

## 3. Users 模块

- [x] 3.1 实现用户列表接口 GET /api/users（admin 专用，分页）
- [x] 3.2 实现用户更新接口 PATCH /api/users/me（更新昵称、头像）
- [x] 3.3 实现角色更新接口 PATCH /api/users/:id/role（admin 专用）
- [x] 3.4 实现用户删除接口 DELETE /api/users/:id（admin 软删除）
- [x] 3.5 实现用户详情接口 GET /api/users/:id
- [x] 3.6 创建 Users 模块并注册到 AppModule

## 4. 前端基础（Vite + React）

- [x] 4.1 初始化 Vite + React 项目（apps/web）
- [x] 4.2 配置 Ant Design 5
- [x] 4.3 配置 React Router v6
- [x] 4.4 配置 Zustand store
- [x] 4.5 配置 Axios 请求层（api 实例、拦截器）
- [x] 4.6 创建登录页面 `/login`
- [x] 4.7 实现 JWT token 存储和刷新逻辑
- [x] 4.8 实现登录表单和错误处理

## 5. Teams 模块

- [x] 5.1 实现 Teams 实体和 TeamMember 实体
- [x] 5.2 实现团队列表接口 GET /api/teams（当前用户所属团队）
- [x] 5.3 实现团队创建接口 POST /api/teams
- [x] 5.4 实现团队更新接口 PATCH /api/teams/:id
- [x] 5.5 实现团队删除接口 DELETE /api/teams/:id
- [x] 5.6 实现添加成员接口 POST /api/teams/:id/members
- [x] 5.7 实现移除成员接口 DELETE /api/teams/:id/members/:userId
- [x] 5.8 实现更新成员角色接口 PATCH /api/teams/:id/members/:userId
- [x] 5.9 创建 Teams 模块并注册到 AppModule

## 6. Tasks 模块

- [x] 6.1 实现 Tasks 实体（支持层级：parent_id 自关联）
- [x] 6.2 实现创建任务接口 POST /api/tasks
- [x] 6.3 实现任务详情接口 GET /api/tasks/:id
- [x] 6.4 实现任务更新接口 PATCH /api/tasks/:id
- [x] 6.5 实现任务删除接口 DELETE /api/tasks/:id
- [x] 6.6 实现任务列表接口 GET /api/tasks（支持筛选）
- [x] 6.7 实现状态变更接口 POST /api/tasks/:id/status
- [x] 6.8 实现指派接口 POST /api/tasks/:id/assign（个人或团队）
- [x] 6.9 实现接取接口 POST /api/tasks/:id/claim
- [x] 6.10 实现排期接口 GET /api/tasks/assignee/:id/schedule
- [x] 6.11 实现任务层级校验逻辑
- [x] 6.12 实现状态流转校验逻辑
- [x] 6.13 创建 Tasks 模块并注册到 AppModule

## 7. Files 模块

- [x] 7.1 实现 TaskFile 实体
- [x] 7.2 实现文件上传接口 POST /api/files/upload
- [x] 7.3 实现任务附件列表接口 GET /api/tasks/:id/files
- [x] 7.4 实现文件删除接口 DELETE /api/files/:key
- [x] 7.5 创建 Files 模块并注册到 AppModule

## 8. Comments 模块

- [x] 8.1 实现 Comments 实体（type: comment/status_log/system）
- [x] 8.2 实现评论列表接口 GET /api/tasks/:id/comments
- [x] 8.3 实现创建评论接口 POST /api/tasks/:id/comments
- [x] 8.4 实现更新评论接口 PATCH /api/comments/:id
- [x] 8.5 实现删除评论接口 DELETE /api/comments/:id
- [x] 8.6 实现评论创建时自动生成 status_log（状态变更时）
- [x] 8.7 创建 Comments 模块并注册到 AppModule

## 9. 前端任务页面

- [x] 9.1 创建个人仪表盘页面 `/`（任务列表 + 近期活动）
- [x] 9.2 创建任务看板页面 `/tasks`
- [x] 9.3 创建任务详情页面 `/tasks/:id`
- [x] 9.4 创建任务创建页面 `/tasks/new`
- [x] 9.5 实现任务筛选和搜索
- [x] 9.6 实现任务状态变更 UI
- [x] 9.7 实现评论和状态日志混合显示

## 10. Notifications 模块

- [x] 10.1 实现 Notifications 实体
- [x] 10.2 实现通知列表接口 GET /api/notifications
- [x] 10.3 实现标记已读接口 PATCH /api/notifications/:id/read
- [x] 10.4 实现全部已读接口 POST /api/notifications/read-all
- [x] 10.5 实现 WebSocket 通知推送（任务指派、任务接取等事件）
- [x] 10.6 创建 Notifications 模块并注册到 AppModule

## 11. Scheduling 模块

- [x] 11.1 实现超时检测 Cron Job（每分钟检查 pending 任务）
- [x] 11.2 实现超时通知生成（超过 claimDeadline 的任务）
- [x] 11.3 创建 Scheduling 模块并注册到 AppModule

## 12. 小组自选池

- [x] 12.1 创建小组任务池页面 `/team-tasks`
- [x] 12.2 实现团队待领取任务列表
- [x] 12.3 实现任务接取功能

## 13. 管理员视图

- [x] 13.1 实现管理员任务列表接口 GET /api/admin/tasks
- [x] 13.2 实现管理员团队统计接口 GET /api/admin/teams/:id/stats
- [x] 13.3 实现管理员用户活动接口 GET /api/admin/users/:id/activity
- [x] 13.4 实现管理员概览接口 GET /api/admin/overview
- [x] 13.5 创建管理员页面 `/admin`
- [x] 13.6 实现任务全局筛选（状态、团队、类型、时间范围）
- [x] 13.7 创建 Admin 模块并注册到 AppModule

## 14. 日历视图

- [x] 14.1 实现日历数据接口 GET /api/calendar（支持月/周视图）
- [x] 14.2 创建日历页面 `/calendar`
- [x] 14.3 实现月/周切换
- [x] 14.4 实现点击日期查看任务
- [x] 14.5 配置 react-big-calendar

## 15. AI 模块（预留）

- [x] 15.1 创建 AI 模块骨架
- [x] 15.2 定义 AI 增强接口
- [x] 15.3 创建 stub 实现
