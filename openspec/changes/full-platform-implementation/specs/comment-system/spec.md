# Comment System

## ADDED Requirements

### Requirement: Comment entity structure

The comment entity SHALL contain:
- id (UUID), taskId (FK), userId (FK), type (comment/status_log/system)
- content (text), metadata (JSON, nullable)
- createdAt, updatedAt, deletedAt

#### Scenario: Comment entity structure
- **WHEN** system creates comment
- **THEN** comment has all required fields

### Requirement: Comments support mixed types

The system SHALL support comments, status logs, and system events in the same stream.

#### Scenario: User posts comment
- **WHEN** user submits comment content
- **THEN** system creates comment with type=comment

#### Scenario: System logs status change
- **WHEN** task status changes
- **THEN** system creates comment with type=status_log and metadata containing old/new status

#### Scenario: System logs assignment
- **WHEN** task is assigned
- **THEN** system creates comment with type=system

### Requirement: Comments are ordered chronologically

Comments SHALL be returned ordered by createdAt ascending (oldest first).

#### Scenario: Get comments for task
- **WHEN** user requests GET /api/tasks/:id/comments
- **THEN** system returns comments in chronological order

### Requirement: Comments can be updated and deleted

Users SHALL be able to update and delete their own comments.

#### Scenario: User updates own comment
- **WHEN** user requests PATCH /api/comments/:id with new content
- **THEN** system updates comment content

#### Scenario: User deletes own comment
- **WHEN** user requests DELETE /api/comments/:id
- **THEN** system soft-deletes comment

#### Scenario: User tries to delete other's comment
- **WHEN** user requests DELETE /api/comments/:id where comment belongs to another user
- **THEN** system returns 403 Forbidden error

### Requirement: Comments support Markdown

Comment content SHALL support Markdown formatting.

#### Scenario: User posts Markdown content
- **WHEN** user posts comment with Markdown formatting
- **THEN** frontend renders formatted content
