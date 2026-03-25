# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 交互规范

- 所有对话的交互和反馈均使用中文描述。

## Project Overview

Productor is a task distribution platform (任务分发平台) for team collaboration. It supports task publishing, AI enhancement (planned), team collaboration, calendar scheduling, and admin views.

**Status:** Pre-implementation. PLAN.md contains the full spec; no source code exists yet.

## Tech Stack

- **Monorepo:** pnpm workspace
- **Frontend:** Vite + React, Ant Design 5, React Router v6, Zustand (state), react-big-calendar, Milkdown (markdown)
- **Backend:** NestJS, TypeORM, PostgreSQL, @nestjs/websockets (socket.io), @nestjs/schedule
- **Storage:** RustFS via @aws-sdk/client-s3
- **Auth:** JWT (15min access + 7d refresh)
- **Infra:** docker-compose (PostgreSQL + RustFS)

## Architecture

### Monorepo layout

```
apps/api/    — NestJS backend
apps/web/    — Vite + React frontend
packages/shared/ — Shared types, enums, constants
```

### Backend modules

`auth`, `users`, `teams`, `tasks`, `comments`, `files`, `notifications`, `ai` (reserved), plus a `scheduler` for cron-based timeout detection.

### Task hierarchy

Project → Milestone → Feature → Subtask → Bug (simplified Scrum model).

### Task status flow

`draft → pending/assigned → in_progress → in_review → completed → closed`, with `blocked` as a side state.

### Key business rules

- Assigning to an individual sets status = assigned
- Assigning to a team sets status = pending with 30-minute claim_deadline
- Schedule estimation: `active_tasks total hours ÷ 8 hours/day = estimated available date`
- Cron checks pending tasks every minute; notifies team lead + admin if claim exceeds 30 min
- Comments table mixes comments, status logs, and system messages (sorted by `created_at`, rendered by `type`)

### Roles and permissions

- **admin:** Full access, manages user roles, sees admin view
- **manager:** Creates projects/milestones, assigns tasks, manages teams
- **member:** Creates subtasks/bugs, claims team tasks, modifies own task statuses

### Frontend routes

`/login`, `/` (dashboard), `/calendar`, `/tasks`, `/tasks/new`, `/tasks/:id`, `/team-tasks`, `/admin`

## Development Commands

```bash
# Start infrastructure
docker-compose up

# Start dev servers (frontend + backend)
pnpm dev
```

## Implementation Phases

See PLAN.md for the full phased plan. Summary:
1. Monorepo init + NestJS + TypeORM + Auth + Frontend scaffold
2. Task CRUD + file upload + status engine + comments
3. Team management + self-claim pool + timeout cron + WebSocket notifications
4. Admin view + calendar view
5. Claude API integration for AI-enhanced task descriptions
