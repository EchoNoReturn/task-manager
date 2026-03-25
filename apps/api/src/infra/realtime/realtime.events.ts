/**
 * WebSocket 事件命名空间
 * 格式: {domain}:{action}
 *
 * 示例:
 *   task:created, task:updated, task:deleted
 *   notification:new
 *   comment:added
 */
export const REALTIME_EVENTS = {
  TASK: {
    CREATED: 'task:created',
    UPDATED: 'task:updated',
    DELETED: 'task:deleted',
    STATUS_CHANGED: 'task:status_changed',
  },
  NOTIFICATION: {
    NEW: 'notification:new',
  },
  COMMENT: {
    ADDED: 'comment:added',
  },
} as const;
