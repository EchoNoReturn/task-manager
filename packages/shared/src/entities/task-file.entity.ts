export interface TaskFile {
  id: string;
  taskId: string;
  fileKey: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}
