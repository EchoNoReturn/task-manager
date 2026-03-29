import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Plus, TrendingUp, Target } from 'lucide-react';
import api from '../api';

interface DashboardStats {
  completedTaskCount: number;
  weeklyAcceptedCount: number;
  monthlyAcceptedCount: number;
  inProgressCount: number;
  weeklyWorkHours: number;
  monthlyWorkHours: number;
}

interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  dueDate: string | null;
}

const statusConfig: Record<string, { icon: typeof CheckSquare; label: string; class: string }> = {
  draft: { icon: Clock, label: '草稿', class: 'status-draft' },
  pending: { icon: Clock, label: '待认领', class: 'status-pending' },
  assigned: { icon: AlertCircle, label: '已指派', class: 'status-assigned' },
  in_progress: { icon: Clock, label: '进行中', class: 'status-in_progress' },
  blocked: { icon: AlertCircle, label: '受阻', class: 'status-blocked' },
  in_review: { icon: CheckCircle2, label: '审核中', class: 'status-in_review' },
  completed: { icon: CheckCircle2, label: '已完成', class: 'status-completed' },
  closed: { icon: CheckCircle2, label: '已关闭', class: 'status-closed' },
};

function StatCard({ icon: Icon, label, value, subLabel, color }: {
  icon: typeof CheckSquare;
  label: string;
  value: string | number;
  subLabel?: string;
  color: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#71717a] text-sm">{label}</span>
        <Icon size={20} className={color} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subLabel && <div className="text-xs text-[#71717a]">{subLabel}</div>}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tasks', { params: { limit: 10 } }),
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            仪表盘
          </h1>
          <p className="text-[#71717a] mt-1">查看您的最新任务动态</p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          创建任务
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card !bg-[#18181b] animate-pulse h-32" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard
            icon={Target}
            label="已完成任务"
            value={stats.completedTaskCount}
            subLabel="累计完成"
            color="text-green-500"
          />
          <StatCard
            icon={TrendingUp}
            label="本周接取"
            value={stats.weeklyAcceptedCount}
            subLabel="本周新接任务"
            color="text-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="本月接取"
            value={stats.monthlyAcceptedCount}
            subLabel="本月新接任务"
            color="text-purple-500"
          />
          <StatCard
            icon={Clock}
            label="进行中"
            value={stats.inProgressCount}
            subLabel="正在执行"
            color="text-orange-500"
          />
          <StatCard
            icon={Clock}
            label="本周工时"
            value={`${stats.weeklyWorkHours}h`}
            subLabel="本周记录"
            color="text-cyan-500"
          />
          <StatCard
            icon={Clock}
            label="本月工时"
            value={`${stats.monthlyWorkHours}h`}
            subLabel="本月记录"
            color="text-pink-500"
          />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">最新任务</h2>
        {tasks.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckSquare size={48} className="mx-auto text-[#3f3f46] mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">暂无任务</h3>
            <p className="text-[#71717a] mb-6">创建您的第一个任务开始使用</p>
            <button
              onClick={() => navigate('/tasks/new')}
              className="btn-primary"
            >
              创建任务
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task) => {
              const config = statusConfig[task.status] || statusConfig.draft;
              const StatusIcon = config.icon;
              return (
                <button
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="card card-hover p-6 text-left cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`status-badge ${config.class}`}
                    >
                      <StatusIcon size={12} className="mr-1" />
                      {config.label}
                    </span>
                    <span className="text-xs text-[#71717a] uppercase tracking-wider">
                      {task.type}
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-lg leading-snug mb-4 line-clamp-2 group-hover:text-[#e11d48] transition-colors">
                    {task.title}
                  </h3>
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-[#71717a]">
                      <Clock size={14} />
                      <span>截止 {new Date(task.dueDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}