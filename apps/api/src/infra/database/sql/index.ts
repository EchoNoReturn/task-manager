/**
 * Database SQL Scripts
 * 
 * These scripts are used to initialize the PostgreSQL database.
 * 
 * Scripts:
 * - 001_init.sql: Create all tables, types, indexes, triggers, and initial data
 * - 999_rollback.sql: Drop all tables and types (for development/testing)
 * 
 * Usage:
 * 1. Create database: CREATE DATABASE taskmanager;
 * 2. Run init script: psql -U taskmanager -d taskmanager -f sql/001_init.sql
 * 3. To rollback: psql -U taskmanager -d taskmanager -f sql/999_rollback.sql
 * 
 * Note: The init script includes ENUM type definitions that must be
 * run before the tables are created.
 */

export const SQL_FILES = {
  INIT: 'sql/001_init.sql',
  ROLLBACK: 'sql/999_rollback.sql',
} as const;
