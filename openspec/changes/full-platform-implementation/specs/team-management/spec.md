# Team Management

## ADDED Requirements

### Requirement: Team entity structure

The team entity SHALL contain: id (UUID), name, description, ownerId (FK to users), createdAt, updatedAt, deletedAt.

#### Scenario: Team entity structure
- **WHEN** system creates team
- **THEN** team has all required fields

### Requirement: Team member entity structure

The team_member entity SHALL contain: id (UUID), teamId (FK), userId (FK), role (leader/member), joinedAt.

#### Scenario: Team member entity structure
- **WHEN** user joins team
- **THEN** system creates team_member record

### Requirement: Team owner can CRUD team

The team owner SHALL be able to create, update, and delete teams.

#### Scenario: Owner creates team
- **WHEN** owner requests POST /api/teams with name and description
- **THEN** system creates team with owner as implicit leader

#### Scenario: Owner deletes team
- **WHEN** owner requests DELETE /api/teams/:id
- **THEN** system soft-deletes team and all memberships

### Requirement: Team owner can manage members

The team owner SHALL be able to add/remove members and promote members to leader.

#### Scenario: Owner adds member
- **WHEN** owner requests POST /api/teams/:id/members with userId
- **THEN** system creates team_member record

#### Scenario: Owner removes member
- **WHEN** owner requests DELETE /api/teams/:id/members/:userId
- **THEN** system removes team_member record

#### Scenario: Owner promotes member to leader
- **WHEN** owner requests PATCH /api/teams/:id/members/:userId with role=leader
- **THEN** system updates member role

### Requirement: Users can view teams they belong to

The system SHALL allow users to view teams they are members of.

#### Scenario: User fetches own teams
- **WHEN** user requests GET /api/teams
- **THEN** system returns teams where user is a member

### Requirement: Team leader can assign task to team

The system SHALL allow team leaders to assign tasks to their team.

#### Scenario: Leader assigns task to team
- **WHEN** leader requests POST /api/tasks/:id/assign with teamId
- **THEN** task status becomes pending and claim_deadline is set to 30 minutes
