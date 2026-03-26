import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Modal, Select, message, List, Avatar } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  assignee: { id: string; nickname: string } | null;
  team: { id: string; name: string } | null;
  dueDate: string | null;
}

interface Comment {
  id: string;
  content: string;
  type: string;
  user: { nickname: string };
  createdAt: string;
}

const { Option } = Select;

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>();

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${id}`);
      setTask(data);
    } catch (error) {
      message.error('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${id}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    try {
      await api.post(`/tasks/${id}/status`, { status: newStatus });
      message.success('状态更新成功');
      setStatusModalVisible(false);
      fetchTask();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

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

  if (loading || !task) return <Card loading />;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        title={task.title}
        extra={
          <Button type="primary" onClick={() => setStatusModalVisible(true)}>
            变更状态
          </Button>
        }
      >
        <Descriptions column={2}>
          <Descriptions.Item label="状态">
            <Tag color={statusColors[task.status]}>{task.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="类型">{task.type}</Descriptions.Item>
          <Descriptions.Item label="负责人">
            {task.assignee ? (
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                {task.assignee.nickname}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="团队">
            {task.team ? (
              <Space>
                <TeamOutlined />
                {task.team.name}
              </Space>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="截止日期">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
          </Descriptions.Item>
        </Descriptions>
        {task.description && (
          <div style={{ marginTop: 16 }}>
            <h4>描述</h4>
            <p>{task.description}</p>
          </div>
        )}
      </Card>

      <Card title="评论与日志">
        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={comment.user.nickname}
                description={
                  <Space>
                    <Tag>{comment.type}</Tag>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  </Space>
                }
              />
              <div>{comment.content}</div>
            </List.Item>
          )}
        />
      </Card>

      <Modal title="变更状态" open={statusModalVisible} onOk={handleUpdateStatus} onCancel={() => setStatusModalVisible(false)}>
        <Select value={newStatus} onChange={setNewStatus} style={{ width: '100%' }}>
          <Option value="draft">草稿</Option>
          <Option value="pending">待认领</Option>
          <Option value="assigned">已指派</Option>
          <Option value="in_progress">进行中</Option>
          <Option value="in_review">审核中</Option>
          <Option value="completed">已完成</Option>
          <Option value="closed">已关闭</Option>
        </Select>
      </Modal>
    </Space>
  );
}
