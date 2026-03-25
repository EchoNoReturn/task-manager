import { useEffect, useState } from 'react';
import { Card, List, Avatar, Tag, Space } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';
import api from '../api';

interface Task {
  id: string;
  title: string;
  status: string;
  type: string;
  dueDate: string | null;
}

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks', { params: { limit: 10 } });
        setTasks(data.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

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

  return (
    <Card title="我的任务" loading={loading}>
      <List
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<CheckSquareOutlined />} />}
              title={task.title}
              description={
                <Space>
                  <Tag color={statusColors[task.status]}>{task.status}</Tag>
                  {task.dueDate && <span>截止: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
