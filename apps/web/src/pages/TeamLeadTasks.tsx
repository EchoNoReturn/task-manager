import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Select, Button, message, Avatar, Card, Statistic, Row, Col, Modal } from 'antd';
import { Users, CheckSquare, Clock, ArrowRight, UserCheck, UserMinus } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../stores/auth';

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
  assignee?: { nickname?: string; email?: string };
}

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
}

interface TeamMemberStatus {
  memberId: string;
  memberName: string;
  taskCount: number;
  claimedCount: number;
  unclaimedCount: number;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'leader' | 'member';
  user: {
    id: string;
    email: string;
    nickname: string;
  };
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

export function TeamLeadTasksPage() {
  const navigate = useNavigate();
  useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memberStatuses, setMemberStatuses] = useState<TeamMemberStatus[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMemberStatus | null>(null);
  const [memberTasksModalVisible, setMemberTasksModalVisible] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams');
      setTeams(data);
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStatuses = async (teamId: string) => {
    try {
      const { data } = await api.get(`/tasks/team/${teamId}/members-status`);
      setMemberStatuses(data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setMemberStatuses([]);
      } else {
        console.error('Failed to fetch member statuses:', error);
      }
    }
  };

  const fetchMembers = async (teamId: string) => {
    try {
      const { data } = await api.get(`/teams/${teamId}/members`);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setMembers([]);
    }
  };

  const fetchAllTasks = async (teamId: string) => {
    setTasksLoading(true);
    try {
      const { data } = await api.get(`/tasks/team/${teamId}/all`);
      setTasks(data.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setTasks([]);
        message.error('只有团队组长可以查看所有任务');
      } else {
        console.error('Failed to fetch tasks:', error);
        setTasks([]);
      }
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      fetchAllTasks(selectedTeamId);
      fetchMemberStatuses(selectedTeamId);
      fetchMembers(selectedTeamId);
    }
  }, [selectedTeamId]);

  const handleClaim = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/claim`);
      message.success('任务认领成功');
      if (selectedTeamId) {
        fetchAllTasks(selectedTeamId);
        fetchMemberStatuses(selectedTeamId);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '认领失败');
    }
  };

  const getCreatorName = (task: Task) => {
    if (task.creator?.nickname) return task.creator.nickname;
    if (task.creator?.email) return task.creator.email;
    return task.createdBy;
  };

  const getAssigneeName = (task: Task) => {
    if (!task.assigneeId) return null;
    if (task.assignee?.nickname) return task.assignee.nickname;
    return task.assigneeId;
  };

  const taskColumns = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Task) => (
        <div>
          <button
            onClick={() => navigate(`/tasks/${record.id}`)}
            className="text-left hover:text-[#e11d48] transition-colors font-medium text-white"
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
      width: 120,
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
      width: 100,
      render: (type: string) => (
        <span className="text-[#a1a1aa]">{type}</span>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assigneeId',
      key: 'assigneeId',
      width: 120,
      render: (assigneeId: string | null, record: Task) => {
        if (!assigneeId) {
          return <span className="status-badge status-pending">待认领</span>;
        }
        return (
          <span className="text-[#a1a1aa]">{getAssigneeName(record)}</span>
        );
      },
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
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
      width: 100,
      render: (_: any, record: Task) =>
        record.status === 'pending' ? (
          <Button
            onClick={() => handleClaim(record.id)}
            className="!bg-white !text-black !font-semibold !rounded-lg !h-8 !px-3"
          >
            认领
          </Button>
        ) : (
          <button
            onClick={() => navigate(`/tasks/${record.id}`)}
            className="p-2 rounded-lg hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <ArrowRight size={16} className="text-[#71717a]" />
          </button>
        ),
    },
  ];

  const memberColumns = [
    {
      title: '成员',
      key: 'member',
      render: (_: any, record: TeamMemberStatus) => (
        <button
          onClick={() => {
            setSelectedMember(record);
            setMemberTasksModalVisible(true);
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Avatar className="!bg-[#27272a] !text-[#a1a1aa]">
            {record.memberName[0].toUpperCase()}
          </Avatar>
          <span className="font-medium text-white">{record.memberName}</span>
        </button>
      ),
    },
    {
      title: '任务数',
      dataIndex: 'taskCount',
      key: 'taskCount',
      width: 100,
      render: (count: number) => (
        <span className="text-[#a1a1aa] flex items-center gap-1">
          <CheckSquare size={14} />
          {count}
        </span>
      ),
    },
    {
      title: '已认领',
      dataIndex: 'claimedCount',
      key: 'claimedCount',
      width: 100,
      render: (count: number) => (
        <span className="text-[#22c55e] flex items-center gap-1">
          <UserCheck size={14} />
          {count}
        </span>
      ),
    },
    {
      title: '待认领',
      dataIndex: 'unclaimedCount',
      key: 'unclaimedCount',
      width: 100,
      render: (count: number) => (
        <span className={count > 0 ? 'text-[#e11d48]' : 'text-[#52525b]'}>
          <UserMinus size={14} className="inline mr-1" />
          {count}
        </span>
      ),
    },
  ];

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const totalTasks = tasks.length;
  const claimedTasks = tasks.filter(t => t.assigneeId).length;
  const pendingTasks = tasks.filter(t => !t.assigneeId).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-20 bg-[#18181b] rounded-lg animate-pulse" />
        <div className="h-96 bg-[#18181b] rounded-lg animate-pulse" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            小组管理
          </h1>
          <p className="text-[#71717a] mt-1">
            您还不是任何团队的组长
          </p>
        </div>
        <div className="card p-16 text-center">
          <Users size={48} className="mx-auto text-[#3f3f46] mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">暂无管理的小组</h3>
          <p className="text-[#71717a]">您还没有成为任何团队的组长，无法使用此功能</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            小组管理
          </h1>
          <p className="text-[#71717a] mt-1">
            查看小组所有任务和组员状态
          </p>
        </div>
        <Select
          placeholder="选择团队"
          value={selectedTeamId}
          onChange={setSelectedTeamId}
          className="!w-64"
          popupClassName="!bg-[#1c1c1f] !border-[#27272a]"
          options={teams.map(t => ({ value: t.id, label: t.name }))}
        />
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card className="!bg-[#18181b] !border-[#27272a]" bordered={false}>
            <Statistic
              title={<span className="text-[#71717a]">团队任务总数</span>}
              value={totalTasks}
              prefix={<CheckSquare size={20} className="mr-2 text-[#e11d48]" />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!bg-[#18181b] !border-[#27272a]" bordered={false}>
            <Statistic
              title={<span className="text-[#71717a]">已认领</span>}
              value={claimedTasks}
              prefix={<UserCheck size={20} className="mr-2 text-[#22c55e]" />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!bg-[#18181b] !border-[#27272a]" bordered={false}>
            <Statistic
              title={<span className="text-[#71717a]">待认领</span>}
              value={pendingTasks}
              prefix={<UserMinus size={20} className="mr-2 text-[#e11d48]" />}
              valueStyle={{ color: pendingTasks > 0 ? '#e11d48' : '#71717a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="!bg-[#18181b] !border-[#27272a]" bordered={false}>
            <Statistic
              title={<span className="text-[#71717a]">小组成员</span>}
              value={members.length}
              prefix={<Users size={20} className="mr-2 text-[#a1a1aa]" />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
      </Row>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">组员任务状态</h2>
        <div className="card overflow-hidden">
          <Table
            dataSource={memberStatuses}
            rowKey="memberId"
            loading={tasksLoading}
            columns={memberColumns}
            pagination={false}
            className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          {selectedTeam?.name} - 所有任务
        </h2>
        <div className="card overflow-hidden">
          <Table
            dataSource={tasks}
            rowKey="id"
            loading={tasksLoading}
            columns={taskColumns}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
            }}
            className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
          />
        </div>
      </div>

      <Modal
        title={
          <span className="text-white">
            {selectedMember?.memberName} - 任务列表
          </span>
        }
        open={memberTasksModalVisible}
        onCancel={() => {
          setMemberTasksModalVisible(false);
          setSelectedMember(null);
        }}
        footer={null}
        width={800}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f] [&_.ant-modal-close-x]:!text-[#a1a1aa]"
      >
        <Table
          dataSource={tasks.filter(
            (t) =>
              t.assigneeId === selectedMember?.memberId &&
              ['assigned', 'in_progress', 'blocked', 'in_review', 'completed', 'closed'].includes(t.status)
          )}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
          }}
          columns={[
            {
              title: '任务',
              dataIndex: 'title',
              key: 'title',
              render: (title: string, record: Task) => (
                <button
                  onClick={() => {
                    setMemberTasksModalVisible(false);
                    navigate(`/tasks/${record.id}`);
                  }}
                  className="text-left hover:text-[#e11d48] transition-colors font-medium text-white"
                >
                  {title}
                </button>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 120,
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
              width: 100,
              render: (type: string) => (
                <span className="text-[#a1a1aa]">{type}</span>
              ),
            },
            {
              title: '截止日期',
              dataIndex: 'dueDate',
              key: 'dueDate',
              width: 120,
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
          ]}
          className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
        />
      </Modal>
    </div>
  );
}