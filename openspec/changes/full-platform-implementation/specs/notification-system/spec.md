# Notification System

## ADDED Requirements

### Requirement: Notification entity structure

The notification entity SHALL contain:
- id (UUID), userId (FK), type (task_assigned/task_claimed/overdue/completed)
- title, message, relatedTaskId (FK, nullable), relatedUserId (FK, nullable)
- isRead (boolean), createdAt

#### Scenario: Notification entity structure
- **WHEN** system creates notification
- **THEN** notification has all required fields

### Requirement: Notifications are sent via WebSocket

Real-time notifications SHALL be delivered via WebSocket (Socket.io).

#### Scenario: Task assigned notification
- **WHEN** task is assigned to user
- **THEN** system emits notification via WebSocket to target user

### Requirement: Users can fetch notifications

Users SHALL be able to fetch their notifications via REST API.

#### Scenario: Fetch notifications
- **WHEN** user requests GET /api/notifications
- **THEN** system returns user's notifications ordered by createdAt desc

### Requirement: Users can mark notifications as read

Users SHALL be able to mark individual or all notifications as read.

#### Scenario: Mark single notification as read
- **WHEN** user requests PATCH /api/notifications/:id/read
- **THEN** notification.isRead = true

#### Scenario: Mark all notifications as read
- **WHEN** user requests POST /api/notifications/read-all
- **THEN** all user's notifications have isRead = true

### Requirement: Overdue task notifications

Pending tasks exceeding claimDeadline SHALL trigger notifications to team leader and admin.

#### Scenario: Task becomes overdue
- **WHEN** pending task's claimDeadline passes without being claimed
- **THEN** system creates notification for team leader and admin
