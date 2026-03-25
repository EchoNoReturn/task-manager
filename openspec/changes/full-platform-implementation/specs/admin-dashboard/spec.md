# Admin Dashboard

## ADDED Requirements

### Requirement: Admin can view all tasks globally

The system SHALL allow admin to view all tasks across all teams with advanced filtering.

#### Scenario: Admin fetches all tasks
- **WHEN** admin requests GET /api/admin/tasks
- **THEN** system returns all tasks with pagination

### Requirement: Admin can filter tasks by multiple criteria

Admin SHALL be able to filter tasks by: status, type, team, assignee, date range.

#### Scenario: Filter tasks by status
- **WHEN** admin requests GET /api/admin/tasks?status=pending
- **THEN** system returns only tasks with pending status

#### Scenario: Filter tasks by multiple criteria
- **WHEN** admin requests GET /api/admin/tasks?status=in_progress&teamId=:id
- **THEN** system returns filtered results

### Requirement: Admin can view team statistics

Admin SHALL be able to view statistics per team: member count, task count by status.

#### Scenario: Admin views team stats
- **WHEN** admin requests GET /api/admin/teams/:id/stats
- **THEN** system returns { memberCount, taskCounts: { draft: n, pending: n, ... } }

### Requirement: Admin can view user activity

Admin SHALL be able to view user activity: tasks created, tasks completed, comments made.

#### Scenario: Admin views user activity
- **WHEN** admin requests GET /api/admin/users/:id/activity
- **THEN** system returns activity summary

### Requirement: Admin dashboard provides overview metrics

Admin SHALL see overview metrics: total users, total tasks, tasks by status distribution.

#### Scenario: Admin views overview
- **WHEN** admin requests GET /api/admin/overview
- **THEN** system returns { totalUsers, totalTasks, taskDistribution }
