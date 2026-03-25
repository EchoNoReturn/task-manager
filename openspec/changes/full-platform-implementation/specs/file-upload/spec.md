# File Upload

## ADDED Requirements

### Requirement: Files are stored in RustFS

All uploaded files SHALL be stored in RustFS (S3-compatible storage) with key format: `{module}/{entityId}/{filename}`.

#### Scenario: File upload generates correct key
- **WHEN** user uploads file to task with id=123
- **THEN** file key is tasks/123/document.pdf

### Requirement: File size limit enforced

Uploaded files SHALL be limited to 10MB by default.

#### Scenario: Upload file within limit
- **WHEN** user uploads file smaller than 10MB
- **THEN** system uploads successfully

#### Scenario: Upload file exceeding limit
- **WHEN** user uploads file larger than 10MB
- **THEN** system returns 413 Payload Too Large error

### Requirement: File type validation

Uploaded files SHALL be validated against allowed MIME types (image/png, image/jpeg, image/gif, application/pdf).

#### Scenario: Upload allowed file type
- **WHEN** user uploads PDF file
- **THEN** system uploads successfully

#### Scenario: Upload disallowed file type
- **WHEN** user uploads executable file
- **THEN** system returns 415 Unsupported Media Type error

### Requirement: Files are associated with entities

Files SHALL be associated with entities via junction tables (task_files, etc.).

#### Scenario: Get task attachments
- **WHEN** user requests GET /api/tasks/:id/files
- **THEN** system returns list of task_file records with URLs

### Requirement: Files can be deleted

Files SHALL be deletable by authorized users.

#### Scenario: Delete file
- **WHEN** user requests DELETE /api/files/:key
- **THEN** system removes file from RustFS and deletes record

### Requirement: File URLs are accessible

The system SHALL generate accessible URLs for uploaded files via getUrl method.

#### Scenario: Get file URL
- **WHEN** system generates URL for file key
- **THEN** URL is in format {STORAGE_ENDPOINT}/{BUCKET}/{key}
