# Task Management

## ADDED Requirements

### Requirement: Task entity structure

The task entity SHALL contain:
- id (UUID), title, description, status, type (project/milestone/feature/subtask/bug)
- parentId (FK to tasks, nullable for project-level)
- assigneeId (FK to users, nullable)
- teamId (FK to teams, nullable)
- estimatedHours (number, nullable)
- claimDeadline (datetime, nullable)
- dueDate (datetime, nullable)
- createdBy (FK to users)
- createdAt, updatedAt, deletedAt

#### Scenario: Task entity structure
- **WHEN** system creates task
- **THEN** task has all required fields with correct types

### Requirement: Task types form hierarchy

Tasks SHALL support types: project → milestone → feature → subtask → bug. Parent task type SHALL be one level higher in hierarchy.

#### Scenario: Creating subtask under feature
- **WHEN** user creates task with type=subtask and parentId pointing to feature
- **THEN** system creates subtask successfully

#### Scenario: Creating project under milestone
- **WHEN** user tries to create task with type=project and parentId pointing to milestone
- **THEN** system returns 400 Bad Request (invalid hierarchy)

### Requirement: Task status transitions

Tasks SHALL support statuses: draft → pending → assigned → in_progress → in_review → completed → closed. Additional blocked status MAY be set alongside other statuses.

#### Scenario: Valid status transition
- **WHEN** task is draft and user changes status to pending
- **THEN** system updates status

#### Scenario: Invalid status transition
- **WHEN** task is draft and user tries to change status to completed
- **THEN** system returns 400 Bad Request (invalid transition)

### Requirement: Assigning task to individual

When assigning task to individual user, status SHALL become assigned.

#### Scenario: Assign task to user
- **WHEN** user requests POST /api/tasks/:id/assign with userId
- **THEN** task status becomes assigned and assigneeId is set

### Requirement: Assigning task to team

When assigning task to team, status SHALL become pending and claimDeadline SHALL be set to 30 minutes from now.

#### Scenario: Assign task to team
- **WHEN** user requests POST /api/tasks/:id/assign with teamId
- **THEN** task status becomes pending, teamId is set, claimDeadline = now + 30min

### Requirement: Team member can claim pending task

Team members SHALL be able to claim tasks assigned to their team that are pending and before claimDeadline.

#### Scenario: Member claims task
- **WHEN** member requests POST /api/tasks/:id/claim
- **THEN** task status becomes assigned, assigneeId = member.id

#### Scenario: Claim after deadline
- **WHEN** member tries to claim task where claimDeadline has passed
- **THEN** system returns 400 Bad Request (deadline exceeded)

### Requirement: Task can have attachments

Tasks SHALL support multiple attachments via task_files table (taskId, fileKey, filename, createdAt).

#### Scenario: Upload attachment
- **WHEN** user uploads file to task
- **THEN** system stores file in RustFS and creates task_file record

### Requirement: Task filtering and search

The system SHALL support filtering tasks by status, type, assignee, team, createdBy.

#### Scenario: Filter tasks by assignee
- **WHEN** user requests GET /api/tasks?assigneeId=:id
- **THEN** system returns tasks assigned to user

### Requirement: Schedule estimation

The system SHALL calculate estimated completion date based on active tasks' estimatedHours.

#### Scenario: Calculate schedule
- **WHEN** user requests GET /api/tasks/assignee/:id/schedule
- **THEN** system returns sum(estimatedHours) / 8 hours per day = estimated days
