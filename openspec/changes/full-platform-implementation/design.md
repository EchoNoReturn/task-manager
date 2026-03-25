## Context

Productor 任务分发平台需要完整的全栈实现。已完成后端基础设施模块（数据库、存储、邮件、WebSocket），现在需要实现核心业务模块。前端使用 Vite + React + Ant Design，后端使用 NestJS + TypeORM + PostgreSQL。

技术栈约束：
- 后端：NestJS + TypeORM + PostgreSQL + RustFS (S3-compatible)
- 前端：Vite + React + Ant Design 5 + React Router v6 + Zustand
- 实时通信：Socket.io + WebSocket
- 认证：JWT (15min access + 7d refresh)

## Goals / Non-Goals

**Goals:**
- 实现完整的后端业务模块（auth, users, teams, tasks, comments, files, notifications）
- 实现前端核心页面（登录、仪表盘、任务看板、任务详情、日历、管理员视图）
- 支持任务层级（project → milestone → feature → subtask → bug）
- 实现团队协作功能（自选池、超时通知）
- 保持代码规范一致性，遵循现有基础设施模块的模式

**Non-Goals:**
- AI 集成（Phase 5，仅预留接口）
- 移动端适配
- 国际化
- 高并发优化

## Decisions

### 1. 采用 JWT 双 Token 认证

**选择**: Access Token (15min) + Refresh Token (7d)

**原因**:
- Access Token 短期失效保障安全
- Refresh Token 长期有效提升用户体验
- 符合业界标准实践

**替代方案**: 单 Token → 缺点是安全风险高或用户体验差

### 2. 前端状态管理采用 Zustand

**选择**: Zustand 而非 Redux Toolkit

**原因**:
- API 简洁，学习成本低
- 支持 middleware 扩展
- 与 Ant Design 配合良好
- 适合中小型应用

**替代方案**: Redux Toolkit → 缺点是 boilerplate 多，学习曲线陡

### 3. 任务层级采用多对一自关联

**选择**: `tasks.parent_id` 自关联实现层级

**原因**:
- 简化查询，支持任意深度层级
- TypeORM 原生支持
- 比邻接表更灵活，比闭包表更简单

**替代方案**: 闭包表 → 缺点是查询复杂，写入性能开销大

### 4. 评论+日志混合流

**选择**: `comments.type` 区分 comment/status_log/system

**原因**:
- 统一存储，统一查询
- 前端根据 type 渲染不同样式
- 便于后续扩展（如 reactions）

### 5. 文件上传直接存储 RustFS

**选择**: 前端直传 RustFS，获取 URL 后提交业务数据

**原因**:
- 减轻后端压力
- 利用 RustFS 的 S3 兼容能力
- 简化后端实现

**替代方案**: 后端中转 → 缺点是占用带宽和存储

### 6. 定时任务使用 @nestjs/schedule

**选择**: Cron 表达式定义超时检测

**原因**:
- NestJS 官方支持
- 支持集群模式（避免重复执行）
- 与依赖注入配合良好

## Risks / Trade-offs

- **层级查询性能**: 深层任务嵌套可能导致 N+1 查询 → Mitigation: 使用 JOIN FETCH 预加载
- **WebSocket 扩展性**: 单 Gateway 可能有连接数限制 → Mitigation: 预留 Redis Adapter 扩展
- **文件上传大小限制**: RustFS 可能对单文件有限制 → Mitigation: 限制 10MB，默认支持图片/PDF
- **定时任务集群**: 多实例部署时 Cron 可能重复执行 → Mitigation: @nestjs/schedule 支持分布式锁
- **Zustand 状态同步**: 多标签页状态可能不一致 → Mitigation: 使用 localStorage 同步

## Migration Plan

**Phase 1 完成**: 基础设施模块（已部署）
- Monorepo, Docker Compose, NestJS 基础设施

**Phase 2**: 核心任务管理
1. 创建 shared 包（类型、枚举）
2. 实现 Auth 模块
3. 实现 Users 模块
4. 实现 Tasks 模块（不含层级）
5. 实现 Files 模块
6. 实现 Comments 模块
7. 创建前端基础页面（登录、仪表盘）

**Phase 3**: 团队协作
1. 实现 Teams 模块
2. 添加任务层级功能
3. 实现超时通知 Cron
4. 实现排期计算
5. 前端团队页面

**Phase 4**: 管理员和日历
1. 实现通知模块
2. 实现管理员视图
3. 实现日历视图
4. 集成测试

**部署策略**: 前后端分离部署，API 和 Web 前端独立服务

## Open Questions

- Refresh Token 存储位置（httpOnly cookie vs localStorage）
- 任务层级深度限制（建议最多 5 层）
- 文件上传是否需要压缩或 CDN 加速
- WebSocket 连接是否需要心跳机制
