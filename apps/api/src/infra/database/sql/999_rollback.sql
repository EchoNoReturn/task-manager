-- =====================================================
-- Productor 任务分发平台 - 数据库回滚脚本
-- 用于删除所有表和类型 (按依赖顺序)
-- =====================================================

-- 禁用外键检查 (按依赖的反序删除)
SET CONSTRAINTS ALL DEFERRED;

-- 删除表 (按依赖顺序)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS task_files;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

-- 删除枚举类型 (按依赖的反序)
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS comment_type;
DROP TYPE IF EXISTS team_member_role;
DROP TYPE IF EXISTS task_type;
DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS user_role;

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 启用外键检查
RESET CONSTRAINTS;
