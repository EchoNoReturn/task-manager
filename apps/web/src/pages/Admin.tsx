import { useEffect, useState } from 'react';
import { Table, Select } from 'antd';
import { Users, CheckSquare, Clock } from 'lucide-react';
import api from '../api';

interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  createdBy: string;
}

interface Overview {
  totalUsers: number;
  totalTasks: number;
  taskDistribution: Record<string, number>;
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

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待认领' },
  { value: 'assigned', label: '已指派' },
  { value: 'in_progress', label: '进行中' },
  { value: 'in_review', label: '审核中' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' },
];

export function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const [tasksRes] = await Promise.all([
        api.get('/tasks', { params }),
      ]);
      setTasks(tasksRes.data.data);
      setOverview({
        totalUsers: 0,
        totalTasks: tasksRes.data.total,
        taskDistribution: {},
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const columns = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <span className="font-medium text-white">{title}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.draft;
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <span className="text-[#a1a1aa]">{type}</span>
      ),
    },
  ];

  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          管理后台
        </h1>
        <p className="text-[#71717a] mt-1">
          系统概览与任务管理
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#27272a]">
              <Users size={24} className="text-[#e11d48]" />
            </div>
            <div>
              <p className="text-[#71717a] text-sm">总用户数</p>
              <p className="text-3xl font-bold text-white">{overview?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#27272a]">
              <CheckSquare size={24} className="text-[#22c55e]" />
            </div>
            <div>
              <p className="text-[#71717a] text-sm">总任务数</p>
              <p className="text-3xl font-bold text-white">{overview?.totalTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#27272a]">
              <Clock size={24} className="text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-[#71717a] text-sm">进行中任务</p>
              <p className="text-3xl font-bold text-white">{inProgressCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">任务列表</h2>
          <Select
            placeholder="筛选状态"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            className="!w-40"
            popupClassName="!bg-[#1c1c1f]"
            options={statusOptions}
          />
        </div>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
          }}
          className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
        />
      </div>
    </div>
  );
}
