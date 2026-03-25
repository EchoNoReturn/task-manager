# User Authentication

## ADDED Requirements

### Requirement: User can register with email and password

The system SHALL allow users to register using email and password. The password SHALL be hashed using bcrypt with a salt rounds of 10.

#### Scenario: Successful registration
- **WHEN** user submits valid email and password (min 8 chars)
- **THEN** system creates user record and returns JWT tokens

#### Scenario: Registration with duplicate email
- **WHEN** user submits email that already exists
- **THEN** system returns 409 Conflict error

#### Scenario: Registration with weak password
- **WHEN** user submits password shorter than 8 characters
- **THEN** system returns 400 Bad Request with validation error

### Requirement: User can login with email and password

The system SHALL allow users to login with email and password. Upon successful login, the system SHALL return an access token (valid 15 minutes) and a refresh token (valid 7 days).

#### Scenario: Successful login
- **WHEN** user submits valid credentials
- **THEN** system returns access token and refresh token

#### Scenario: Login with invalid credentials
- **WHEN** user submits wrong password
- **THEN** system returns 401 Unauthorized error

#### Scenario: Login with non-existent email
- **WHEN** user submits email that does not exist
- **THEN** system returns 401 Unauthorized error

### Requirement: User can refresh access token

The system SHALL allow users to refresh their access token using a valid refresh token.

#### Scenario: Successful token refresh
- **WHEN** user submits valid refresh token
- **THEN** system returns new access token and refresh token

#### Scenario: Refresh with expired token
- **WHEN** user submits expired refresh token
- **THEN** system returns 401 Unauthorized error

### Requirement: User can logout

The system SHALL allow users to invalidate their refresh token.

#### Scenario: Successful logout
- **WHEN** user submits valid refresh token to logout endpoint
- **THEN** system invalidates the refresh token

### Requirement: JWT tokens contain user identity

The access token SHALL contain user ID and role. The system SHALL use this token to authenticate API requests.

#### Scenario: Accessing protected endpoint with valid token
- **WHEN** user sends request with valid access token in Authorization header
- **THEN** system extracts user ID and role from token

#### Scenario: Accessing protected endpoint with expired token
- **WHEN** user sends request with expired access token
- **THEN** system returns 401 Unauthorized error

### Requirement: Password reset flow

The system SHALL support password reset via email. User requests reset, receives email with token, submits new password.

#### Scenario: Request password reset
- **WHEN** user submits email for password reset
- **THEN** system sends reset email if email exists (always return 200 to prevent email enumeration)

#### Scenario: Reset password with valid token
- **WHEN** user submits valid reset token and new password
- **THEN** system updates password and invalidates token

#### Scenario: Reset password with invalid token
- **WHEN** user submits invalid or expired reset token
- **THEN** system returns 400 Bad Request error
