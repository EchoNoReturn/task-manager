import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Tag, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api';

const { Option } = Select;

interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  assigneeId: string | null;
  teamId: string | null;
  dueDate: string | null;
}

export function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/tasks', { params });
      setTasks(data.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const statusColors: Record<string, string> = {
    draft: 'default',
    pending: 'orange',
    assigned: 'blue',
    in_progress: 'green',
    blocked: 'red',
    in_review: 'purple',
    completed: 'green',
    closed: 'gray',
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    { title: '类型', dataIndex: 'type', key: 'type' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Button type="link" onClick={() => navigate(`/tasks/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Space>
        <Input
          placeholder="搜索任务..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="筛选状态"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="draft">草稿</Option>
          <Option value="pending">待认领</Option>
          <Option value="assigned">已指派</Option>
          <Option value="in_progress">进行中</Option>
          <Option value="in_review">审核中</Option>
          <Option value="completed">已完成</Option>
          <Option value="closed">已关闭</Option>
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tasks/new')}>
          创建任务
        </Button>
      </Space>
      <Table columns={columns} dataSource={filteredTasks} rowKey="id" loading={loading} />
    </Space>
  );
}
