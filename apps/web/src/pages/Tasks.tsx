import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Select, Tabs } from 'antd';
import { Plus, Search, Clock, ArrowRight, CheckSquare, Users } from 'lucide-react';
import api from '../api';

interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  assigneeId: string | null;
  teamId: string | null;
  dueDate: string | null;
  createdBy: string;
  creator?: { nickname?: string; email?: string };
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

export function TasksPage() {
  const navigate = useNavigate();
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [createdRes, assignedRes] = await Promise.all([
        api.get('/tasks/my/created'),
        api.get('/tasks/my/assigned'),
      ]);
      setCreatedTasks(createdRes.data.data);
      setAssignedTasks(assignedRes.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getCreatorName = (task: Task) => {
    if (task.creator?.nickname) return task.creator.nickname;
    if (task.creator?.email) return task.creator.email;
    return task.createdBy;
  };

  const columns = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Task) => (
        <div>
          <button
            onClick={() => navigate(`/tasks/${record.id}`)}
            className="text-left hover:text-[#e11d48] transition-colors font-medium"
          >
            {title}
          </button>
          <div className="text-xs text-[#71717a] mt-1">
            创建人：{getCreatorName(record)}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.draft;
        return (
          <span className={`status-badge ${config.class}`}>
            {config.label}
          </span>
        );
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
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 140,
      render: (dueDate: string | null) =>
        dueDate ? (
          <span className="text-[#a1a1aa] flex items-center gap-1">
            <Clock size={14} />
            {new Date(dueDate).toLocaleDateString('zh-CN')}
          </span>
        ) : (
          <span className="text-[#52525b]">-</span>
        ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: Task) => (
        <button
          onClick={() => navigate(`/tasks/${record.id}`)}
          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors cursor-pointer"
        >
          <ArrowRight size={16} className="text-[#71717a]" />
        </button>
      ),
    },
  ];

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const renderEmpty = (text: string) => (
    <div className="card p-16 text-center">
      <CheckSquare size={48} className="mx-auto text-[#3f3f46] mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">{text}</h3>
      <p className="text-[#71717a]">暂无相关任务</p>
    </div>
  );

  const tabItems = [
    {
      key: 'created',
      label: (
        <span className="flex items-center gap-2">
          <Users size={16} />
          我创建的
        </span>
      ),
      children: (
        <>
          <div className="card p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="搜索任务..."
                prefix={<Search size={18} className="text-[#71717a]" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="!bg-[#111113] !border-[#27272a] !text-white !w-64 !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
              />
              <Select
                placeholder="筛选状态"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                className="!w-40"
                popupClassName="!bg-[#1c1c1f] !border-[#27272a]"
                options={statusOptions}
              />
            </div>
          </div>
          {loading ? (
            <div className="card overflow-hidden">
              <Table
                columns={columns}
                dataSource={[]}
                rowKey="id"
                loading={loading}
                pagination={false}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
              />
            </div>
          ) : filterTasks(createdTasks).length === 0 ? (
            renderEmpty('暂无我创建的任务')
          ) : (
            <div className="card overflow-hidden">
              <Table
                columns={columns}
                dataSource={filterTasks(createdTasks)}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: false,
                }}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: 'assigned',
      label: (
        <span className="flex items-center gap-2">
          <CheckSquare size={16} />
          我认领的
        </span>
      ),
      children: (
        <>
          <div className="card p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="搜索任务..."
                prefix={<Search size={18} className="text-[#71717a]" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="!bg-[#111113] !border-[#27272a] !text-white !w-64 !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
              />
              <Select
                placeholder="筛选状态"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                className="!w-40"
                popupClassName="!bg-[#1c1c1f] !border-[#27272a]"
                options={statusOptions}
              />
            </div>
          </div>
          {loading ? (
            <div className="card overflow-hidden">
              <Table
                columns={columns}
                dataSource={[]}
                rowKey="id"
                loading={loading}
                pagination={false}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
              />
            </div>
          ) : filterTasks(assignedTasks).length === 0 ? (
            renderEmpty('暂无我认领的任务')
          ) : (
            <div className="card overflow-hidden">
              <Table
                columns={columns}
                dataSource={filterTasks(assignedTasks)}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: false,
                }}
                className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
              />
            </div>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            任务列表
          </h1>
          <p className="text-[#71717a] mt-1">
            管理所有任务
          </p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          创建任务
        </button>
      </div>

      <Tabs
        items={tabItems}
        className="[&_.ant-tabs-nav]:!mb-0"
      />
    </div>
  );
}