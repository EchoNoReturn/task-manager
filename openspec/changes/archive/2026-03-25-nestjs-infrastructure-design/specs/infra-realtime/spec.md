## ADDED Requirements

### Requirement: RealtimeModule 统一管理 WebSocket Gateway

RealtimeModule SHALL 包含唯一的 WebSocket Gateway，所有实时事件通过该 Gateway 分发，业务模块不自行创建 Gateway。

#### Scenario: 客户端建立 WebSocket 连接

- **WHEN** 客户端连接 `ws://host/ws/notifications`
- **THEN** RealtimeModule 的 Gateway SHALL 接受连接
- **AND** 连接 SHALL 经过 JWT 鉴权中间件验证

### Requirement: 事件命名空间统一

所有 WebSocket 事件 SHALL 采用 `{domain}:{action}` 格式（如 `task:updated`、`notification:new`），禁止自由命名。

#### Scenario: 任务状态变更推送

- **WHEN** 任务状态从 `in_progress` 变为 `in_review`
- **THEN** Gateway SHALL 向相关用户推送 `task:updated` 事件
- **AND** 事件 payload SHALL 包含 `{ taskId, oldStatus, newStatus, updatedAt }`

### Requirement: 业务模块通过事件发射器触发推送

业务模块 SHALL 通过注入 `RealtimeService` 并调用 `emit(event, payload, targets)` 方法触发实时推送，不直接操作 WebSocket Server。

#### Scenario: TasksService 触发任务更新通知

- **WHEN** TasksService 完成任务状态更新
- **THEN** TasksService SHALL 调用 `this.realtimeService.emit('task:updated', payload, [assigneeId])`
- **AND** RealtimeService SHALL 负责查找目标用户的 WebSocket 连接并发送消息

### Requirement: 支持房间隔离

RealtimeModule SHALL 支持按团队或项目创建房间，事件可定向推送到特定房间内的所有用户。

#### Scenario: 向团队房间推送通知

- **WHEN** 管理员向团队 `team-456` 发布新任务
- **THEN** 调用 `this.realtimeService.emitToRoom('team-456', 'task:new', payload)`
- **AND** 所有加入 `team-456` 房间的客户端 SHALL 收到该事件

### Requirement: WebSocket 连接需 JWT 鉴权

WebSocket 连接 SHALL 在握手阶段验证 JWT token，未通过鉴权的连接 SHALL 被拒绝。

#### Scenario: 未认证用户尝试连接

- **WHEN** 客户端发送不含有效 JWT 的 WebSocket 握手请求
- **THEN** Gateway SHALL 拒绝连接并返回 401 状态码
- **AND** 连接 SHALL NOT 建立
