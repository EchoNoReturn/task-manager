import { useEffect, useState, useMemo } from 'react';
import { Table, Select, message, Button, Modal, Avatar, Form, Input } from 'antd';
import { Plus, UserPlus, UserMinus } from 'lucide-react';
import api from '../api';

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
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

interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  nickname: string;
}

const roleOptions = [
  { value: 'leader', label: '组长' },
  { value: 'member', label: '成员' },
];

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Record<string, TeamMember[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [addMemberForm] = Form.useForm();
  const [createTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [createTeamForm] = Form.useForm();

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/teams');
      setTeams(data);
      const allMembers: Record<string, TeamMember[]> = {};
      await Promise.all(
        data.map(async (team: Team) => {
          try {
            const { data: memberData } = await api.get(`/admin/teams/${team.id}/members`);
            allMembers[team.id] = memberData;
          } catch (error) {
            console.error(`Failed to fetch members for team ${team.id}:`, error);
            allMembers[team.id] = [];
          }
        })
      );
      setMembers(allMembers);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      message.error('获取团队列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users', { params: { limit: 100 } });
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchMembers = async (teamId: string) => {
    try {
      const { data } = await api.get(`/admin/teams/${teamId}/members`);
      setMembers((prev) => ({ ...prev, [teamId]: data }));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleCreateTeam = async (values: { name: string; description?: string }) => {
    try {
      await api.post('/teams', values);
      message.success('团队创建成功');
      setCreateTeamModalVisible(false);
      createTeamForm.resetFields();
      fetchTeams();
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建团队失败');
    }
  };

  const handleAddMember = async (values: { userId: string; role: string }) => {
    if (!selectedTeam) return;
    try {
      await api.post(`/admin/teams/${selectedTeam.id}/members`, values);
      message.success('成员添加成功');
      setAddMemberModalVisible(false);
      addMemberForm.resetFields();
      fetchMembers(selectedTeam.id);
    } catch (error: any) {
      message.error(error.response?.data?.message || '添加成员失败');
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await api.delete(`/admin/teams/${teamId}/members/${userId}`);
      message.success('成员移除成功');
      fetchMembers(teamId);
    } catch (error: any) {
      message.error(error.response?.data?.message || '移除成员失败');
    }
  };

  const handleUpdateMemberRole = async (teamId: string, userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/teams/${teamId}/members/${userId}`, { role: newRole });
      message.success('角色更新成功');
      fetchMembers(teamId);
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新角色失败');
    }
  };

  const teamColumns = useMemo(() => [
    {
      title: '团队',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Team) => (
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-sm text-[#71717a]">{record.description || '无描述'}</p>
        </div>
      ),
    },
    {
      title: '成员数',
      key: 'memberCount',
      width: 100,
      render: (_: any, record: Team) => {
        const teamMembers = members[record.id] || [];
        return <span className="text-[#a1a1aa]">{teamMembers.length} 人</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Team) => (
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={() => {
              setSelectedTeam(record);
              fetchMembers(record.id);
            }}
          >
            查看成员
          </Button>
        </div>
      ),
    },
  ], [members]);

  const memberColumns = [
    {
      title: '成员',
      key: 'user',
      render: (_: any, record: TeamMember) => (
        <div className="flex items-center gap-3">
          <Avatar className="!bg-[#27272a] !text-[#a1a1aa]">
            {record.user.nickname[0].toUpperCase()}
          </Avatar>
          <div>
            <p className="font-medium text-white">{record.user.nickname}</p>
            <p className="text-sm text-[#71717a]">{record.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string, record: TeamMember) => (
        <Select
          value={role}
          onChange={(value) => handleUpdateMemberRole(selectedTeam!.id, record.userId, value)}
          className="!w-28"
          popupMatchSelectWidth={100}
          options={roleOptions}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: TeamMember) => (
        <Button
          type="text"
          onClick={() => handleRemoveMember(selectedTeam!.id, record.userId)}
          className="hover:!text-[#ef4444]"
        >
          <UserMinus size={16} />
        </Button>
      ),
    },
  ];

  const availableUsers = useMemo(() => {
    if (!selectedTeam) return [];
    const currentMemberIds = (members[selectedTeam.id] || []).map((m) => m.userId);
    return users.filter((u) => !currentMemberIds.includes(u.id));
  }, [selectedTeam, users, members]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            团队管理
          </h1>
          <p className="text-[#71717a] mt-1">
            管理系统团队和成员配置
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setCreateTeamModalVisible(true)}
          className="!flex !items-center !gap-2"
        >
          新建团队
        </Button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={teamColumns}
          dataSource={teams}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
          }}
          className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
        />
      </div>

      {selectedTeam && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {selectedTeam.name} - 成员管理
            </h2>
            <Button
              icon={<UserPlus size={16} />}
              onClick={() => setAddMemberModalVisible(true)}
            >
              添加成员
            </Button>
          </div>
          <Table
            columns={memberColumns}
            dataSource={members[selectedTeam.id] || []}
            rowKey="id"
            pagination={false}
            className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
          />
        </div>
      )}

      <Modal
        title="新建团队"
        open={createTeamModalVisible}
        onCancel={() => {
          setCreateTeamModalVisible(false);
          createTeamForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateTeamModalVisible(false);
            createTeamForm.resetFields();
          }}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => createTeamForm.submit()}>创建</Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <Form
          form={createTeamForm}
          layout="vertical"
          onFinish={handleCreateTeam}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label={<span className="text-[#a1a1aa]">团队名称</span>}
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input placeholder="团队名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-[#a1a1aa]">描述</span>}
          >
            <Input.TextArea placeholder="团队描述（可选）" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加成员"
        open={addMemberModalVisible}
        onCancel={() => {
          setAddMemberModalVisible(false);
          addMemberForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setAddMemberModalVisible(false);
            addMemberForm.resetFields();
          }}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => addMemberForm.submit()}>添加</Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <Form
          form={addMemberForm}
          layout="vertical"
          onFinish={handleAddMember}
          className="mt-4"
        >
          <Form.Item
            name="userId"
            label={<span className="text-[#a1a1aa]">选择用户</span>}
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select
              placeholder="选择用户"
              showSearch
              optionFilterProp="label"
              options={availableUsers.map((u) => ({
                value: u.id,
                label: `${u.nickname} (${u.email})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label={<span className="text-[#a1a1aa]">角色</span>}
            initialValue="member"
          >
            <Select options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}