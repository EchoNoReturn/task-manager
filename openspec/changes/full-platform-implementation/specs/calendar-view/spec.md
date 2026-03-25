# Calendar View

## ADDED Requirements

### Requirement: Calendar displays tasks by due date

The system SHALL display tasks on a calendar view based on their dueDate.

#### Scenario: View tasks on calendar
- **WHEN** user navigates to calendar view for month January 2024
- **THEN** system returns tasks where dueDate falls within January 2024

### Requirement: Calendar supports month and week views

The system SHALL support switching between month view and week view.

#### Scenario: Switch to week view
- **WHEN** user requests GET /api/calendar?view=week&date=2024-01-15
- **THEN** system returns tasks for the week containing 2024-01-15

### Requirement: Tasks without due date are excluded from calendar

Tasks without dueDate SHALL NOT appear in calendar view.

#### Scenario: Task without due date
- **WHEN** task has dueDate = null
- **THEN** task does not appear in calendar results

### Requirement: Calendar events show task summary

Calendar events SHALL show: task title, status, assignee avatar.

#### Scenario: Calendar event display
- **WHEN** frontend renders calendar
- **THEN** each event shows task title and status color indicator
