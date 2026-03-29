import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal, Select, message, List, Avatar, DatePicker, Input, Form } from 'antd';
import { User, Users as UsersIcon, Clock, ArrowLeft, CheckCircle2, AlertCircle, Timer, ArrowRightLeft, Archive } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../api';
import { useAuthStore } from '../stores';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  assignee: { id: string; nickname: string } | null;
  assigneeId: string | null;
  team: { id: string; name: string } | null;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface Comment {
  id: string;
  content: string;
  type: string;
  user: { nickname: string };
  createdAt: string;
}

interface WorkHour {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string | null;
  createdAt: string;
  user: { nickname: string };
}

interface TransferRequest {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  status: string;
  reason: string | null;
  rejectionReason: string | null;
  createdAt: string;
  task: Task;
  fromUser: { id: string; nickname: string; email: string };
}

interface TeamMember {
  userId: string;
  role: string;
  user: { id: string; nickname: string; email: string };
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

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [workHourModalVisible, setWorkHourModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>();
  const [workHourForm, setWorkHourForm] = useState<{ startTime: dayjs.Dayjs; endTime: dayjs.Dayjs; description: string }>({
    startTime: dayjs(),
    endTime: dayjs(),
    description: '',
  });
  const [workHourLoading, setWorkHourLoading] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<TransferRequest[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferForm] = Form.useForm();
  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveLoading, setArchiveLoading] = useState(false);

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

  const fetchWorkHours = async () => {
    try {
      const [hoursRes, totalRes] = await Promise.all([
        api.get(`/tasks/${id}/work-hours`),
        api.get(`/tasks/${id}/work-hours/total`),
      ]);
      setWorkHours(hoursRes.data);
      setTotalHours(totalRes.data.total);
    } catch (error) {
      console.error('Failed to fetch work hours:', error);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
    fetchWorkHours();
    fetchPendingTransfers();
  }, [id]);

  const fetchPendingTransfers = async () => {
    try {
      const { data } = await api.get('/tasks/pending-transfers');
      setPendingTransfers(data);
    } catch (error) {
      console.error('Failed to fetch pending transfers:', error);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data } = await api.get(`/admin/teams/${teamId}/members`);
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

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

  const handleTransfer = async (values: { toUserId: string; reason?: string }) => {
    if (!task) return;
    setTransferLoading(true);
    try {
      await api.post(`/tasks/${task.id}/transfer`, { toUserId: values.toUserId, reason: values.reason });
      message.success('流转申请已发送');
      setTransferModalVisible(false);
      transferForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || '流转申请失败');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleAcceptTransfer = async (transferId: string) => {
    try {
      await api.post(`/tasks/transfers/${transferId}/accept`);
      message.success('已同意流转');
      fetchPendingTransfers();
      fetchTask();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleRejectTransfer = async (transferId: string, rejectionReason: string) => {
    try {
      await api.post(`/tasks/transfers/${transferId}/reject`, { rejectionReason });
      message.success('已拒绝流转');
      fetchPendingTransfers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleArchive = async () => {
    if (!task) return;
    setArchiveLoading(true);
    try {
      const payload = task.status === 'completed' || task.status === 'closed'
        ? {}
        : { reason: archiveReason };
      await api.post(`/tasks/${task.id}/archive`, payload);
      message.success('任务已归档');
      setArchiveModalVisible(false);
      setArchiveReason('');
      fetchTask();
    } catch (error: any) {
      message.error(error.response?.data?.message || '归档失败');
    } finally {
      setArchiveLoading(false);
    }
  };

  const canArchive = task && task.status !== 'draft' && task.status !== 'pending';

  const handleReportWorkHour = async () => {
    if (!workHourForm.startTime || !workHourForm.endTime) {
      message.error('请选择开始和结束时间');
      return;
    }

    if (workHourForm.endTime.isBefore(workHourForm.startTime) || workHourForm.endTime.isSame(workHourForm.startTime)) {
      message.error('结束时间必须晚于开始时间');
      return;
    }

    setWorkHourLoading(true);
    try {
      await api.post(`/tasks/${id}/work-hours`, {
        startTime: workHourForm.startTime.toISOString(),
        endTime: workHourForm.endTime.toISOString(),
        description: workHourForm.description || undefined,
      });
      message.success('工时上报成功');
      setWorkHourModalVisible(false);
      setWorkHourForm({ startTime: dayjs(), endTime: dayjs(), description: '' });
      fetchWorkHours();
    } catch (error: any) {
      message.error(error.response?.data?.message || '工时上报失败');
    } finally {
      setWorkHourLoading(false);
    }
  };

  const canReportWorkHour = task && (isAdmin || task.assigneeId === user?.id);

  if (loading || !task) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-[#18181b] rounded animate-pulse" />
        <div className="card p-8 h-64 bg-[#18181b] animate-pulse" />
      </div>
    );
  }

  const config = statusConfig[task.status] || statusConfig.draft;
  const StatusIcon = task.status === 'completed' || task.status === 'closed' ? CheckCircle2 : 
                     task.status === 'blocked' ? AlertCircle : Clock;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => history.back()}
          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-[#a1a1aa]" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {task.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {canReportWorkHour && (
            <Button
              onClick={() => setWorkHourModalVisible(true)}
              className="!bg-[#27272a] !text-white !border-none !rounded-lg !h-11 !px-5 hover:!bg-[#3f3f46]"
            >
              <Timer size={18} className="mr-2" />
              上报工时
            </Button>
          )}
          {task.assigneeId === user?.id && task.team && (
            <Button
              onClick={() => {
                fetchTeamMembers(task.team!.id);
                setTransferModalVisible(true);
              }}
              className="!bg-[#27272a] !text-white !border-none !rounded-lg !h-11 !px-5 hover:!bg-[#3f3f46]"
            >
              <ArrowRightLeft size={18} className="mr-2" />
              流转
            </Button>
          )}
          <Button
            onClick={() => {
              setNewStatus(task.status);
              setStatusModalVisible(true);
            }}
            className="!bg-white !text-black !font-semibold !rounded-lg !h-11 !px-6"
          >
            变更状态
          </Button>
          {canArchive && (
            <Button
              onClick={() => setArchiveModalVisible(true)}
              className="!bg-[#27272a] !text-white !border-none !rounded-lg !h-11 !px-5 hover:!bg-[#3f3f46]"
            >
              <Archive size={18} className="mr-2" />
              归档
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">任务详情</h2>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <span className={`status-badge ${config.class}`}>
                <StatusIcon size={12} className="mr-1" />
                {config.label}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#27272a] text-[#a1a1aa] text-sm">
                {task.type}
              </span>
            </div>

            {task.description && (
              <div className="border-t border-[#27272a] pt-6">
                <h3 className="text-sm font-medium text-[#71717a] mb-2 uppercase tracking-wider">
                  描述
                </h3>
                <p className="text-white leading-relaxed">{task.description}</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              评论与日志
            </h2>
            
            {comments.length === 0 ? (
              <p className="text-[#71717a] text-center py-8">暂无评论</p>
            ) : (
              <List
                dataSource={comments}
                renderItem={(comment) => (
                  <List.Item className="!border-[#27272a] !px-0">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="!bg-[#27272a] !text-[#a1a1aa]">
                          {comment.user.nickname[0].toUpperCase()}
                        </Avatar>
                        <span className="font-medium text-white">
                          {comment.user.nickname}
                        </span>
                        <span className="text-xs text-[#71717a]">
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-[#a1a1aa] ml-10">{comment.content}</p>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                工时记录
              </h2>
              <span className="text-sm text-[#71717a]">
                共计 <span className="text-white font-medium">{totalHours.toFixed(1)}</span> 小时
              </span>
            </div>
            
            {workHours.length === 0 ? (
              <p className="text-[#71717a] text-center py-8">暂无工时记录</p>
            ) : (
              <List
                dataSource={workHours}
                renderItem={(wh) => (
                  <List.Item className="!border-[#27272a] !px-0">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="!bg-[#27272a] !text-[#a1a1aa]" size={24}>
                            {wh.user.nickname[0].toUpperCase()}
                          </Avatar>
                          <span className="text-sm text-white">
                            {wh.user.nickname}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[#e11d48]">
                          {wh.hours.toFixed(1)} 小时
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#71717a] ml-8">
                        <span>
                          {dayjs(wh.startTime).format('MM-DD HH:mm')} - {dayjs(wh.endTime).format('MM-DD HH:mm')}
                        </span>
                      </div>
                      {wh.description && (
                        <p className="text-[#a1a1aa] text-sm mt-2 ml-8">{wh.description}</p>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-medium text-[#71717a] mb-4 uppercase tracking-wider">
              任务信息
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#71717a] flex items-center gap-2">
                  <User size={16} />
                  负责人
                </span>
                <span className="text-white">
                  {task.assignee?.nickname || '-'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[#71717a] flex items-center gap-2">
                  <UsersIcon size={16} />
                  团队
                </span>
                <span className="text-white">
                  {task.team?.name || '-'}
                </span>
              </div>

              {task.startDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a] flex items-center gap-2">
                    <Clock size={16} />
                    开始时间
                  </span>
                  <span className="text-white">
                    {dayjs(task.startDate).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              )}

              {task.endDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a] flex items-center gap-2">
                    <Clock size={16} />
                    结束时间
                  </span>
                  <span className="text-white">
                    {dayjs(task.endDate).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-[#71717a] flex items-center gap-2">
                  <Clock size={16} />
                  截止日期
                </span>
                <span className="text-white">
                  {task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : '-'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#71717a] flex items-center gap-2">
                  <Timer size={16} />
                  已上报工时
                </span>
                <span className="text-white font-medium">
                  {totalHours.toFixed(1)} 小时
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="变更状态"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setStatusModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpdateStatus}
            className="!bg-white !text-black !font-semibold !rounded-lg"
          >
            确认
          </Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <div className="py-4">
          <Select
            value={newStatus}
            onChange={setNewStatus}
            className="!w-full"
            popupClassName="!bg-[#1c1c1f]"
            options={statusOptions}
          />
        </div>
      </Modal>

      <Modal
        title="上报工时"
        open={workHourModalVisible}
        onCancel={() => setWorkHourModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setWorkHourModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={workHourLoading}
            onClick={handleReportWorkHour}
            className="!bg-white !text-black !font-semibold !rounded-lg"
          >
            确认上报
          </Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              开始时间 <span className="text-[#e11d48]">*</span>
            </label>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              value={workHourForm.startTime}
              onChange={(val) => setWorkHourForm({ ...workHourForm, startTime: val || dayjs() })}
              className="!w-full !bg-[#111113] !border-[#27272a] !rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              结束时间 <span className="text-[#e11d48]">*</span>
            </label>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              value={workHourForm.endTime}
              onChange={(val) => setWorkHourForm({ ...workHourForm, endTime: val || dayjs() })}
              className="!w-full !bg-[#111113] !border-[#27272a] !rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              说明（可选）
            </label>
            <Input.TextArea
              rows={3}
              placeholder="描述工作内容..."
              value={workHourForm.description}
              onChange={(e) => setWorkHourForm({ ...workHourForm, description: e.target.value })}
              className="!bg-[#111113] !border-[#27272a] !text-white !rounded-lg"
            />
          </div>
          {workHourForm.startTime && workHourForm.endTime && workHourForm.endTime.isAfter(workHourForm.startTime) && (
            <p className="text-sm text-[#71717a]">
              工时时长：<span className="text-white font-medium">
                {workHourForm.endTime.diff(workHourForm.startTime, 'hour', true).toFixed(1)} 小时
              </span>
            </p>
          )}
        </div>
      </Modal>

      <Modal
        title="任务流转"
        open={transferModalVisible}
        onCancel={() => {
          setTransferModalVisible(false);
          transferForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setTransferModalVisible(false);
            transferForm.resetFields();
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={transferLoading}
            onClick={() => transferForm.submit()}
            className="!bg-white !text-black !font-semibold !rounded-lg"
          >
            发起流转
          </Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransfer}
          className="mt-4"
        >
          <Form.Item
            name="toUserId"
            label={<span className="text-[#a1a1aa]">流转给</span>}
            rules={[{ required: true, message: '请选择要流转的人员' }]}
          >
            <Select
              placeholder="选择团队成员"
              showSearch
              filterOption={(input, option) =>
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={teamMembers
                .filter(m => m.userId !== user?.id)
                .map(m => ({
                  value: m.userId,
                  label: `${m.user.nickname} (${m.user.email})`,
                }))}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label={<span className="text-[#a1a1aa]">流转原因（可选）</span>}
          >
            <Input.TextArea
              rows={3}
              placeholder="描述流转原因..."
              className="!bg-[#111113] !border-[#27272a] !text-white !rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="任务流转待处理"
        open={pendingTransfers.length > 0}
        onCancel={() => setPendingTransfers([])}
        footer={null}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <div className="space-y-4">
          {pendingTransfers.map((transfer) => (
            <div key={transfer.id} className="border border-[#27272a] rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-medium">{transfer.task.title}</p>
                  <p className="text-sm text-[#71717a]">
                    由 {transfer.fromUser.nickname} 流转给你
                  </p>
                  {transfer.reason && (
                    <p className="text-sm text-[#a1a1aa] mt-2">
                      原因：{transfer.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleAcceptTransfer(transfer.id)}
                  className="!bg-white !text-black !font-semibold !rounded-lg"
                >
                  同意
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    Modal.confirm({
                      title: '拒绝流转',
                      content: (
                        <Input.TextArea
                          id="rejection-reason"
                          placeholder="请输入拒绝理由"
                          rows={3}
                        />
                      ),
                      onOk: () => {
                        const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement)?.value;
                        if (!reason) {
                          message.error('请输入拒绝理由');
                          return Promise.reject();
                        }
                        handleRejectTransfer(transfer.id, reason);
                      },
                    });
                  }}
                  className="!bg-[#27272a] !text-white !border-none !rounded-lg"
                >
                  拒绝
                </Button>
                <Button
                  size="small"
                  onClick={() => window.location.href = `/tasks/${transfer.taskId}`}
                  className="!bg-[#27272a] !text-white !border-none !rounded-lg"
                >
                  查看任务
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        title="归档任务"
        open={archiveModalVisible}
        onCancel={() => {
          setArchiveModalVisible(false);
          setArchiveReason('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setArchiveModalVisible(false);
            setArchiveReason('');
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={archiveLoading}
            onClick={handleArchive}
            className="!bg-white !text-black !font-semibold !rounded-lg"
          >
            确认归档
          </Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <div className="py-4">
          {task && (task.status === 'completed' || task.status === 'closed') ? (
            <p className="text-[#a1a1aa]">
              任务状态为「{task.status === 'completed' ? '已完成' : '已关闭'}」，确认归档后将直接归档此任务。
            </p>
          ) : (
            <>
              <p className="text-[#a1a1aa] mb-4">
                归档非完成状态的任务需要提供归档理由，以便后续审计。
              </p>
              <Input.TextArea
                rows={4}
                placeholder="请输入归档理由..."
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="!bg-[#111113] !border-[#27272a] !text-white !rounded-lg"
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
