## ADDED Requirements

### Requirement: MailModule 定义统一的邮件发送接口

MailModule SHALL 定义 `IMailService` 接口，包含 `send(to, subject, body)` 和 `sendTemplate(to, templateName, context)` 两个方法。

#### Scenario: 发送超时通知邮件

- **WHEN** 任务 claim 超过 30 分钟未被接取
- **THEN** NotificationService SHALL 调用 `IMailService.send(teamLeadEmail, subject, body)` 发送通知
- **AND** 发送逻辑 SHALL 不关心底层邮件实现

### Requirement: 提供 MockMailService 用于开发和测试

MailModule SHALL 提供 `MockMailService` 实现，开发阶段和单元测试 SHALL 使用 MockMailService，不发送真实邮件。

#### Scenario: 开发环境不发送真实邮件

- **WHEN** `NODE_ENV=development` 或 `NODE_ENV=test`
- **THEN** MailModule SHALL 注册 `MockMailService` 作为 `IMailService` 的实现
- **AND** 邮件内容 SHALL 输出到日志而非实际发送

### Requirement: 邮件模板支持变量替换

`sendTemplate` 方法 SHALL 支持通过 context 对象传入模板变量，模板引擎 SHALL 替换 `{{variable}}` 占位符。

#### Scenario: 使用任务通知模板

- **WHEN** 发送任务分配通知
- **THEN** 调用 `sendTemplate(email, 'task-assigned', { taskName: 'XXX', assignee: '张三' })`
- **AND** 模板中 `{{taskName}}` SHALL 被替换为实际任务名称

### Requirement: MailModule 在当前阶段仅保留骨架

MailModule SHALL 包含接口定义、MockMailService 实现和基础的模板目录结构，不实现真实的邮件发送逻辑。

#### Scenario: 检查 MailModule 文件数量

- **WHEN** 查看 `apps/api/src/infra/mail/` 目录
- **THEN** 文件 SHALL 不超过 4 个：`mail.module.ts`、`mail-service.interface.ts`、`mock-mail.service.ts`、`nodemailer-mail.service.ts`（空实现）
