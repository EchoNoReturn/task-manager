export enum TaskType {
  PROJECT = 'project',
  MILESTONE = 'milestone',
  FEATURE = 'feature',
  SUBTASK = 'subtask',
  BUG = 'bug',
}

export const TASK_HIERARCHY: Record<TaskType, TaskType | null> = {
  [TaskType.PROJECT]: null,
  [TaskType.MILESTONE]: TaskType.PROJECT,
  [TaskType.FEATURE]: TaskType.MILESTONE,
  [TaskType.SUBTASK]: TaskType.FEATURE,
  [TaskType.BUG]: TaskType.FEATURE,
};
