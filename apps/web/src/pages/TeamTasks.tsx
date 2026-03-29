import { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { CheckSquare } from 'lucide-react';
import api from '../api';

interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  claimDeadline: string | null;
}

export function TeamTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params: { status: 'pending', limit: 100 } });
      setTasks(data.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClaim = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/claim`);
      message.success('任务认领成功');
      fetchTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || '认领失败');
    }
  };

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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <span className="text-[#a1a1aa]">{type}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: () => (
        <span className="status-badge status-pending">待认领</span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_: any, record: Task) => (
        <Button
          onClick={() => handleClaim(record.id)}
          className="!bg-white !text-black !font-semibold !rounded-lg !h-10 !px-4"
        >
          认领
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          团队任务
        </h1>
        <p className="text-[#71717a] mt-1">
          选择并认领可用任务
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card !bg-[#18181b] animate-pulse h-32" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckSquare size={48} className="mx-auto text-[#3f3f46] mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">暂无待认领任务</h3>
          <p className="text-[#71717a]">稍后再来看看有新任务</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <Table
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            columns={columns}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
            }}
            className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
          />
        </div>
      )}
    </div>
  );
}