# User Management

## ADDED Requirements

### Requirement: User profile contains essential information

The user entity SHALL contain: id (UUID), email, passwordHash, role (admin/manager/member), nickname, avatarUrl, createdAt, updatedAt, deletedAt.

#### Scenario: User entity structure
- **WHEN** system creates user
- **THEN** user has all required fields with correct types

### Requirement: Admin can list all users

The system SHALL allow admin to list all users with pagination (default 20 per page).

#### Scenario: Admin fetches user list
- **WHEN** admin requests GET /api/users?page=1&limit=20
- **THEN** system returns paginated user list without password hashes

#### Scenario: Non-admin fetches user list
- **WHEN** non-admin requests GET /api/users
- **THEN** system returns 403 Forbidden error

### Requirement: Admin can update user role

The system SHALL allow admin to change user role (admin ↔ manager ↔ member).

#### Scenario: Admin changes user role
- **WHEN** admin requests PATCH /api/users/:id/role with new role
- **THEN** system updates user role

#### Scenario: Admin demotes self
- **WHEN** admin tries to change own role to member
- **THEN** system returns 400 Bad Request (cannot demote self)

### Requirement: Admin can delete user (soft delete)

The system SHALL allow admin to soft-delete users by setting deletedAt.

#### Scenario: Admin deletes user
- **WHEN** admin requests DELETE /api/users/:id
- **THEN** system sets deletedAt timestamp

### Requirement: Users can view and update own profile

The system SHALL allow users to view and update their own profile (nickname, avatarUrl).

#### Scenario: User updates own nickname
- **WHEN** user requests PATCH /api/users/me with new nickname
- **THEN** system updates nickname

#### Scenario: User cannot update other user's profile
- **WHEN** user requests PATCH /api/users/:otherId
- **THEN** system returns 403 Forbidden error

### Requirement: User role determines permissions

The system SHALL enforce role-based permissions:
- **admin**: Full access, can manage users and roles
- **manager**: Can create projects/milestones, assign tasks, manage teams
- **member**: Can create subtasks/bugs, claim team tasks, modify own task status

#### Scenario: Member tries to create project
- **WHEN** member requests POST /api/projects
- **THEN** system returns 403 Forbidden error
