# AGENTS.md - AI Coding Agent Guidelines

This file provides guidance to AI coding agents when working in this repository.

## Project Overview

**Productor** is a task distribution platform with:
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: Vite + React (not yet implemented)
- **Storage**: RustFS (S3-compatible) via @aws-sdk/client-s3
- **Monorepo**: pnpm workspace at `/apps/api` and `/apps/web`

---

## Build / Lint / Test Commands

### Root Commands
```bash
pnpm dev              # Start API dev server (pnpm --filter api dev)
pnpm dev:web          # Start web dev server (future)
pnpm build            # Build all workspaces
pnpm lint             # Lint all workspaces
pnpm test             # Run all tests
pnpm db:migrate       # Run TypeORM migrations
```

### API (apps/api) Commands
```bash
pnpm --filter api dev              # Start with --watch mode
pnpm --filter api build            # Production build
pnpm --filter api test             # Run all tests
pnpm --filter api test -- src/foo  # Run specific test file
pnpm --filter api test --watch     # Watch mode
pnpm --filter api test:cov         # With coverage
pnpm --filter api lint             # ESLint with --fix
```

### Docker
```bash
docker compose -f docker-compose.yml up -d postgres  # Start PostgreSQL
docker compose -f docker-compose.yml up -d           # Start all services
```

---

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode**: `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`
- **Path aliases**: `@/*` for src, `@infra/*` for infra, `@common/*` for common

### Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Files | kebab-case | `task-status.enum.ts` |
| Classes | PascalCase | `TasksService`, `CreateTaskDto` |
| Variables/Methods | camelCase | `findById`, `teamMembers` |
| DB Tables | snake_case | `team_members`, `task_files` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Enum Values | UPPER_SNAKE_CASE | `TaskStatus.IN_PROGRESS` |

### Imports (order matters)
1. Node.js built-ins (`node:fs`, `node:path`)
2. External packages (`@nestjs/*`, `class-validator`)
3. Internal packages (`@/*`, `@infra/*`)
4. Relative imports (`./`, `../`)

### Error Handling
**Business exceptions** extend `BusinessException`:
```typescript
// From @common/exceptions
throw new NotFoundException('Task', taskId);
throw new ForbiddenException('无权限操作此任务');
throw new UnauthorizedException();

// Custom exceptions inherit from BusinessException
export class TaskDeadlineExceededException extends BusinessException {
  constructor(taskId: string) {
    super(`任务 [${taskId}] 已超过截止日期`, HttpStatus.BAD_REQUEST);
  }
}
```

**Global exception filter** returns:
```typescript
{ statusCode, message, error, timestamp, path }
```

### Dependency Injection
Infrastructure services use interfaces + string tokens:
```typescript
// Define interface
export interface IStorageService {
  upload(file: Buffer, key: string, contentType?: string): Promise<UploadResult>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

// Register
@Module({
  providers: [{ provide: 'IStorageService', useClass: RustFSStorageService }],
  exports: ['IStorageService'],
})

// Inject
constructor(@Inject('IStorageService') private readonly storage: IStorageService) {}
```

### Infra Module Pattern
```
infra/<name>/
├── <name>.module.ts          # Main module
├── index.ts                  # Public exports
├── interfaces/               # Interface definitions
├── services/                 # Implementations
└── exceptions/               # Domain exceptions (optional)
```

### Database / TypeORM
- **Entities** extend `BaseEntity` for id/timestamps
- Use **Repository pattern** via `@InjectRepository()`
- **Config** via `ConfigService`, never `process.env`

```typescript
@Entity('tasks')
export class Task extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;
}
```

### Async/Await
- Always use `async/await` over raw Promises
- Handle errors with try/catch in service layer

---

## Directory Structure

```
apps/api/src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Root module
├── common/                    # Shared utilities (entities, exceptions, filters)
├── infra/                     # Infrastructure modules (database, storage, mail, realtime)
└── modules/                   # Future business modules (auth, users, tasks, etc.)
```

---

## Testing Guidelines
- Test files: `*.spec.ts` suffix next to source file
- Use `@nestjs/testing` for unit tests
- Mock infrastructure services with `overrideProvider`

```typescript
describe('TasksService', () => {
  let service: TasksService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: 'IStorageService', useValue: mockStorageService },
      ],
    }).compile();
    service = module.get(TasksService);
  });
});
```

---

## CI/Quality Gates
- ESLint must pass (`pnpm lint`)
- All tests must pass (`pnpm test`)
- Build must succeed (`pnpm build`)

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@nestjs/common` | Core framework |
| `@nestjs/typeorm` | Database ORM |
| `@aws-sdk/client-s3` | S3-compatible storage |
| `class-validator` | DTO validation |
| `@nestjs/websockets` | WebSocket gateway |
| `@nestjs/config` | Environment config |
