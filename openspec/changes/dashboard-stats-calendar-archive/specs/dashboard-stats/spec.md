## ADDED Requirements

### Requirement: Dashboard displays task completion count
The system SHALL display the current user's count of completed tasks.

#### Scenario: View completed task count
- **WHEN** user navigates to the dashboard
- **THEN** system SHALL show the total number of tasks with status "已完成" where the current user is the assignee or creator

### Requirement: Dashboard displays weekly and monthly accepted task count
The system SHALL display the total number of tasks accepted by the current user this week and this month.

#### Scenario: View weekly accepted task count
- **WHEN** user navigates to the dashboard
- **THEN** system SHALL show the count of tasks accepted (status changed from any to non-draft) within the current week

#### Scenario: View monthly accepted task count
- **WHEN** user navigates to the dashboard
- **THEN** system SHALL show the count of tasks accepted within the current calendar month

### Requirement: Dashboard displays in-progress task count
The system SHALL display the count of tasks currently being executed by the current user.

#### Scenario: View in-progress task count
- **WHEN** user navigates to the dashboard
- **THEN** system SHALL show the number of tasks with status "进行中" where the current user is the assignee

### Requirement: Dashboard displays weekly and monthly work hours
The system SHALL display the total work hours logged by the current user this week and this month.

#### Scenario: View weekly work hours
- **WHEN** user navigates to the dashboard
- **THEN** system SHALL show the sum of work hours logged within the current week

#### Scenario: View monthly work hours
- **WHEN** user navigates to the dashboard
- **THEN** system SHALL show the sum of work hours logged within the current calendar month

### Requirement: Dashboard statistics refresh on navigation
The system SHALL refresh dashboard statistics each time the user navigates to the dashboard.

#### Scenario: Refresh statistics on return
- **WHEN** user returns to the dashboard after visiting another page
- **THEN** system SHALL fetch and display the most current statistics
