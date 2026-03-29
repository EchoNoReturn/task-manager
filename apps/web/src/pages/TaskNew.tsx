import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, DatePicker, Switch, message, Modal } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeft } from 'lucide-react';
import api from '../api';

interface User {
  id: string;
  nickname: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
}

interface TeamMember {
  userId: string;
  role: string;
  user: User;
}

interface TaskForm {
  title: string;
  description?: string;
  type: string;
  teamId?: string;
  assigneeId?: string;
  estimatedHours?: number;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
  dueDate?: dayjs.Dayjs;
  useMinutePrecision?: boolean;
}

const taskTypeOptions = [
  { value: 'project', label: '项目' },
  { value: 'milestone', label: '里程碑' },
  { value: 'feature', label: '功能' },
  { value: 'subtask', label: '子任务' },
  { value: 'bug', label: '缺陷' },
];

export function TaskNewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const [useMinutePrecision, setUseMinutePrecision] = useState(false);
  const [form] = Form.useForm();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState<TaskForm | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users', { params: { limit: 100 } });
        setUsers(data.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    const fetchTeams = async () => {
      try {
        const { data } = await api.get('/teams/all');
        setTeams(data);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    };
    const fetchMyTeams = async () => {
      try {
        const { data } = await api.get('/teams');
        setMyTeams(data);
      } catch (error) {
        console.error('Failed to fetch my teams:', error);
      }
    };
    fetchUsers();
    fetchTeams();
    fetchMyTeams();
  }, []);

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data } = await api.get(`/admin/teams/${teamId}/members`);
      setTeamMembers((prev) => ({ ...prev, [teamId]: data }));
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const handleTeamChange = (teamId: string | undefined) => {
    setSelectedTeamId(teamId);
    form.setFieldValue('assigneeId', undefined);
    if (teamId && !teamMembers[teamId]) {
      fetchTeamMembers(teamId);
    }
  };

  const handleSubmit = async (values: TaskForm) => {
    const myTeamIds = myTeams.map((t) => t.id);
    if (values.teamId && !myTeamIds.includes(values.teamId)) {
      setPendingValues(values);
      setConfirmModalVisible(true);
      return;
    }
    await doSubmit(values);
  };

  const doSubmit = async (values: TaskForm) => {
    setLoading(true);
    try {
      const rawHours = (values as any).estimatedHours;
      const payload: any = {
        title: values.title,
        description: values.description,
        type: values.type,
        teamId: values.teamId || undefined,
        assigneeId: values.assigneeId || undefined,
        estimatedHours: rawHours !== '' && rawHours != null ? Number(rawHours) : undefined,
        dueDate: values.dueDate?.isValid ? values.dueDate.toISOString() : undefined,
        startDate: values.startDate?.isValid ? values.startDate.toISOString() : undefined,
        endDate: values.endDate?.isValid ? values.endDate.toISOString() : undefined,
      };
      const { data } = await api.post('/tasks', payload);
      message.success('任务创建成功');
      navigate(`/tasks/${data.id}`);
    } catch (error) {
      message.error('任务创建失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = selectedTeamId
    ? (teamMembers[selectedTeamId] || []).map((m) => m.user)
    : users;

  const dateFormat = useMinutePrecision ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
  const showTime = useMinutePrecision;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-[#a1a1aa]" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            创建任务
          </h1>
          <p className="text-[#71717a] mt-1">
            填写任务信息创建新任务
          </p>
        </div>
      </div>

      <div className="card p-8">
        <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              标题 <span className="text-[#e11d48]">*</span>
            </label>
            <Form.Item
              name="title"
              rules={[{ required: true, message: '请输入任务标题' }]}
              className="!mb-0"
            >
              <Input
                placeholder="输入任务标题"
                size="large"
                className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
              />
            </Form.Item>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              描述
            </label>
            <Form.Item name="description" className="!mb-0">
              <Input.TextArea
                rows={4}
                placeholder="详细描述任务内容..."
                className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                类型 <span className="text-[#e11d48]">*</span>
              </label>
              <Form.Item
                name="type"
                rules={[{ required: true, message: '请选择任务类型' }]}
                className="!mb-0"
              >
                <Select
                  placeholder="选择任务类型"
                  size="large"
                  className="!w-full"
                  popupClassName="!bg-[#1c1c1f]"
                  options={taskTypeOptions}
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                分配团队
              </label>
              <Form.Item name="teamId" className="!mb-0">
                <Select
                  placeholder="选择团队（可选）"
                  size="large"
                  allowClear
                  className="!w-full"
                  popupClassName="!bg-[#1c1c1f]"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={handleTeamChange}
                  options={teams.map((t) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                />
              </Form.Item>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                负责人
              </label>
              <Form.Item name="assigneeId" className="!mb-0">
                <Select
                  placeholder={selectedTeamId ? '选择团队成员' : '选择负责人（可选）'}
                  size="large"
                  allowClear
                  className="!w-full"
                  popupClassName="!bg-[#1c1c1f]"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={filteredUsers.map((u) => ({
                    value: u.id,
                    label: `${u.nickname} (${u.email})`,
                  }))}
                />
              </Form.Item>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                预计工时（小时）
              </label>
              <Form.Item name="estimatedHours" className="!mb-0">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  size="large"
                  className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                />
              </Form.Item>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                截止日期
              </label>
              <Form.Item name="dueDate" className="!mb-0">
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format={dateFormat}
                  showTime={showTime}
                  className="!bg-[#111113] !border-[#27272a] !rounded-lg !w-full"
                />
              </Form.Item>
            </div>
          </div>

          <div className="border-t border-[#27272a] pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[#a1a1aa]">精确到分钟</p>
                <p className="text-xs text-[#71717a]">默认精确到日，开启后可选择具体时间</p>
              </div>
              <Switch
                checked={useMinutePrecision}
                onChange={setUseMinutePrecision}
                className="[&.ant-switch-checked]:!bg-[#e11d48]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  开始时间
                </label>
                <Form.Item name="startDate" className="!mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format={dateFormat}
                    showTime={showTime}
                    className="!bg-[#111113] !border-[#27272a] !rounded-lg !w-full"
                    placeholder="选择开始时间"
                  />
                </Form.Item>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  结束时间
                </label>
                <Form.Item name="endDate" className="!mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    size="large"
                    format={dateFormat}
                    showTime={showTime}
                    className="!bg-[#111113] !border-[#27272a] !rounded-lg !w-full"
                    placeholder="选择结束时间"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="!bg-white !text-black !font-semibold !rounded-lg !h-14 !px-8"
            >
              创建任务
            </Button>
            <Button
              onClick={() => navigate('/tasks')}
              size="large"
              className="!bg-[#27272a] !text-white !border-none !rounded-lg !h-14 !px-8 hover:!bg-[#3f3f46]"
            >
              取消
            </Button>
          </div>
        </Form>
      </div>

      <Modal
        title="确认创建任务"
        open={confirmModalVisible}
        onCancel={() => {
          setConfirmModalVisible(false);
          setPendingValues(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setConfirmModalVisible(false);
              setPendingValues(null);
            }}
          >
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={loading}
            onClick={() => {
              if (pendingValues) {
                doSubmit(pendingValues);
              }
              setConfirmModalVisible(false);
              setPendingValues(null);
            }}
            className="!bg-white !text-black !font-semibold !rounded-lg"
          >
            确认创建
          </Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <div className="py-4">
          <p className="text-[#a1a1aa]">
            您选择的团队「{teams.find((t) => t.id === pendingValues?.teamId)?.name}」不在您所在的团队中。确定要创建属于该团队的任务吗？
          </p>
        </div>
      </Modal>
    </div>
  );
}
