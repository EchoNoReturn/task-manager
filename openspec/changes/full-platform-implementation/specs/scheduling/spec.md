# Scheduling

## ADDED Requirements

### Requirement: Schedule calculation based on active tasks

The system SHALL calculate estimated completion date using formula: active_tasks.totalEstimatedHours / 8 hours per day.

#### Scenario: Calculate schedule for user
- **WHEN** user requests GET /api/tasks/assignee/:id/schedule
- **THEN** system returns { totalHours, estimatedDays, availableDate }

### Requirement: Active tasks are tasks assigned to user with in_progress status

Active tasks SHALL be tasks where assigneeId = user.id AND status IN (assigned, in_progress).

#### Scenario: Count active tasks
- **WHEN** system calculates schedule
- **THEN** only tasks with status assigned or in_progress are included

### Requirement: Overdue task detection runs every minute

The system SHALL run a cron job every minute to check for overdue pending tasks.

#### Scenario: Detect overdue task
- **WHEN** task has status=pending AND claimDeadline < now
- **THEN** system creates overdue notifications

### Requirement: Cron jobs use distributed locking

The system SHALL use distributed locks to prevent duplicate cron execution in multi-instance deployment.

#### Scenario: Multiple instances run cron
- **WHEN** cron job triggers on multiple instances simultaneously
- **THEN** only one instance actually executes the job
