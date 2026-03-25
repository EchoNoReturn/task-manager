import { useEffect, useState } from 'react';
import { Card, Table, Space, Tag, Select, Statistic, Row, Col } from 'antd';
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
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="总用户数" value={overview?.totalUsers || 0} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="总任务数" value={overview?.totalTasks || 0} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="进行中任务" value={tasks.filter((t) => t.status === 'in_progress').length} />
          </Card>
        </Col>
      </Row>

      <Card title="任务列表">
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="筛选状态"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="pending">待认领</Select.Option>
            <Select.Option value="assigned">已指派</Select.Option>
            <Select.Option value="in_progress">进行中</Select.Option>
            <Select.Option value="in_review">审核中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="closed">已关闭</Select.Option>
          </Select>
        </Space>
        <Table columns={columns} dataSource={tasks} rowKey="id" loading={loading} />
      </Card>
    </Space>
  );
}
