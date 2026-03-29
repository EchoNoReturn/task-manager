import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, message } from 'antd';
import { Archive, Search, Clock } from 'lucide-react';
import api from '../api';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  assignee: { id: string; nickname: string } | null;
  assigneeId: string | null;
  archivedAt: string;
  archiveReason: string | null;
}

const statusConfig: Record<string, { label: string; class: string }> = {
  draft: { label: '草稿', class: 'status-draft' },
  pending: { label: '待认领', class: 'status-pending' },
  assigned: { label: '已指派', class: 'status-assigned' },
  in_progress: { label: '进行中', class: 'status-in_progress' },
  blocked: { label: '受阻', class: 'status-blocked' },
  in_review: { label: '审核中', class: 'status-in_review' },
  completed: { label: '已完成', class: 'status-completed' },
  closed: { label: '已关闭', class: 'status-closed' },
};

export function ArchivedTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchArchivedTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks/archived', {
        params: { search: search || undefined },
      });
      setTasks(data.data);
    } catch (error) {
      message.error('获取归档任务失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            已归档任务
          </h1>
          <p className="text-[#71717a] mt-1">查看您已归档的任务</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索归档任务..."
            prefix={<Search size={16} className="text-[#71717a]" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!w-64 !bg-[#111113] !border-[#27272a] !rounded-lg !h-11"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card !bg-[#18181b] animate-pulse h-24" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-16 text-center">
          <Archive size={48} className="mx-auto text-[#3f3f46] mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">暂无归档任务</h3>
          <p className="text-[#71717a]">您归档的任务将在此处显示</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const config = statusConfig[task.status] || statusConfig.draft;
            return (
              <div
                key={task.id}
                className="card p-6 hover:border-[#3f3f46] transition-colors cursor-pointer"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${config.class}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-[#71717a] uppercase tracking-wider">
                      {task.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#71717a]">
                    <Clock size={14} />
                    <span>归档于 {new Date(task.archivedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <h3 className="text-white font-medium text-lg mb-2">{task.title}</h3>
                {task.archiveReason && (
                  <p className="text-sm text-[#71717a] mb-2">
                    归档理由：{task.archiveReason}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-[#71717a]">
                  {task.assignee && (
                    <span>负责人：{task.assignee.nickname}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}