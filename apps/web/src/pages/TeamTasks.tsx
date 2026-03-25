import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
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

  return (
    <Card title="小组自选池">
      <Table
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        columns={[
          { title: '标题', dataIndex: 'title' },
          { title: '类型', dataIndex: 'type' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (status: string) => <Tag color="orange">{status}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            render: (_: any, record: Task) => (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleClaim(record.id)}
              >
                认领
              </Button>
            ),
          },
        ]}
      />
    </Card>
  );
}
