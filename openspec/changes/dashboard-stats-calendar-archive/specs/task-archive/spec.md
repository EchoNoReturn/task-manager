## ADDED Requirements

### Requirement: Tasks with draft or unassigned status can be deleted
The system SHALL allow users to delete tasks only when the task status is "草稿" or "未分配".

#### Scenario: Delete draft task
- **WHEN** user attempts to delete a task with status "草稿"
- **THEN** system SHALL allow the deletion after confirmation

#### Scenario: Delete unassigned task
- **WHEN** user attempts to delete a task with status "未分配"
- **THEN** system SHALL allow the deletion after confirmation

#### Scenario: Cannot delete in-progress task
- **WHEN** user attempts to delete a task with status "进行中"
- **THEN** system SHALL display an error message and prevent deletion

### Requirement: Tasks can be archived instead of deleted
The system SHALL allow users to archive tasks instead of deleting them, except for draft and unassigned tasks.

#### Scenario: Archive task from any non-deletable status
- **WHEN** user clicks archive on a task with status other than "草稿" or "未分配"
- **THEN** system SHALL mark the task as archived and remove it from normal views

### Requirement: Archive reason is required for non-completed statuses
The system SHALL require users to provide an archive reason when archiving a task that is not in "已完成" or "已关闭" status.

#### Scenario: Archive in-progress task requires reason
- **WHEN** user attempts to archive a task with status "进行中"
- **THEN** system SHALL display a required reason input field

#### Scenario: Archive completed task without reason
- **WHEN** user archives a task with status "已完成"
- **THEN** system SHALL archive the task without requiring a reason, automatically recording the status as "已完成"

#### Scenario: Archive closed task without reason
- **WHEN** user archives a task with status "已关闭"
- **THEN** system SHALL archive the task without requiring a reason, automatically recording the status as "已关闭"

### Requirement: Archived tasks have separate listing page
The system SHALL provide a dedicated page for viewing and searching archived tasks.

#### Scenario: View archived tasks page
- **WHEN** user navigates to the archived tasks page
- **THEN** system SHALL display all tasks where archivedAt is not null for that user

#### Scenario: Search archived tasks
- **WHEN** user searches on the archived tasks page
- **THEN** system SHALL filter archived tasks by title or description matching the search query

### Requirement: Users can view archived tasks they are involved in
The system SHALL allow users to view archived tasks where they are either the creator or the assignee.

#### Scenario: View own archived tasks as creator
- **WHEN** user views the archived tasks page
- **THEN** system SHALL display tasks created by the user that have been archived

#### Scenario: View own archived tasks as assignee
- **WHEN** user views the archived tasks page
- **THEN** system SHALL display tasks assigned to the user that have been archived
