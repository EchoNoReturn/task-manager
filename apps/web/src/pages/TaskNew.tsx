import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, Space, message } from 'antd';
import api from '../api';

const { Option } = Select;
const { TextArea } = Input;

interface TaskForm {
  title: string;
  description?: string;
  type: string;
  estimatedHours?: number;
  dueDate?: string;
}

export function TaskNewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: TaskForm) => {
    setLoading(true);
    try {
      const { data } = await api.post('/tasks', values);
      message.success('任务创建成功');
      navigate(`/tasks/${data.id}`);
    } catch (error) {
      message.error('任务创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="创建任务">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入任务标题' }]}>
          <Input placeholder="任务标题" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <TextArea rows={4} placeholder="任务描述" />
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择任务类型' }]}>
          <Select placeholder="选择任务类型">
            <Option value="project">项目</Option>
            <Option value="milestone">里程碑</Option>
            <Option value="feature">功能</Option>
            <Option value="subtask">子任务</Option>
            <Option value="bug">缺陷</Option>
          </Select>
        </Form.Item>
        <Form.Item name="estimatedHours" label="预计工时（小时）">
          <Input type="number" placeholder="0" />
        </Form.Item>
        <Form.Item name="dueDate" label="截止日期">
          <Input type="date" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建
            </Button>
            <Button onClick={() => navigate('/tasks')}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
