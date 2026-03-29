import { useEffect, useState, useMemo } from 'react';
import { Table, Select, message, Button, Modal, Avatar, Form, Input } from 'antd';
import { Shield, ShieldCheck, ShieldAlert, UserMinus, UserPlus } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../stores';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  nickname: string;
  avatarUrl: string | null;
  createdAt: string;
}

const roleConfig: Record<string, { label: string; class: string; icon: typeof Shield }> = {
  admin: { label: '管理员', class: 'status-blocked', icon: ShieldCheck },
  manager: { label: '经理', class: 'status-assigned', icon: Shield },
  member: { label: '成员', class: 'status-draft', icon: ShieldAlert },
};

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '经理' },
  { value: 'member', label: '成员' },
];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const { user: currentUser } = useAuthStore();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { limit: 100 } });
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      message.success('角色更新成功');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '角色更新失败');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      message.success('用户删除成功');
      setDeleteModalVisible(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleCreate = async (values: { email: string; password: string; nickname: string; role?: string }) => {
    try {
      await api.post('/users', values);
      message.success('用户创建成功');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '创建用户失败');
    }
  };

  const columns = useMemo(() => [
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="!bg-[#27272a] !text-[#a1a1aa]">
            {record.nickname[0].toUpperCase()}
          </Avatar>
          <div>
            <p className="font-medium text-white">{record.nickname}</p>
            <p className="text-sm text-[#71717a]">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string, record: User) => {
        const config = roleConfig[role] || roleConfig.member;
        const RoleIcon = config.icon;
        
        if (currentUser?.id === record.id) {
          return (
            <span className={`status-badge ${config.class}`}>
              <RoleIcon size={12} className="mr-1" />
              {config.label}
            </span>
          );
        }

        return (
          <Select
            value={role}
            onChange={(value) => handleRoleChange(record.id, value)}
            className="!w-32"
            popupMatchSelectWidth={128}
            options={roleOptions}
          />
        );
      },
    },
    {
      title: '加入时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <span className="text-[#a1a1aa]">
          {new Date(date).toLocaleDateString('zh-CN')}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: any, record: User) => {
        if (currentUser?.id === record.id) return null;
        
        return (
          <Button
            type="text"
            onClick={() => {
              setSelectedUser(record);
              setDeleteModalVisible(true);
            }}
            className="hover:!text-[#ef4444]"
          >
            <UserMinus size={16} />
          </Button>
        );
      },
    },
  ], [currentUser]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            用户管理
          </h1>
          <p className="text-[#71717a] mt-1">
            管理系统用户和角色
          </p>
        </div>
        <Button
          type="primary"
          icon={<UserPlus size={16} />}
          onClick={() => setCreateModalVisible(true)}
          className="!flex !items-center !gap-2"
        >
          新建用户
        </Button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
          }}
          className="[&_.ant-table]:!bg-transparent [&_.ant-table-thead>tr>th]:!bg-[#111113] [&_.ant-table-thead>tr>th]:!border-[#27272a] [&_.ant-table-tbody>tr>td]:!border-[#27272a] [&_.ant-table-tbody>tr:hover>td]:!bg-[rgba(255,255,255,0.02)]"
        />
      </div>

      <Modal
        title="删除用户"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        okText="确认删除"
        okButtonProps={{ danger: true }}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <p className="text-[#a1a1aa]">
          确定要删除用户 <span className="text-white font-medium">{selectedUser?.nickname}</span> 吗？此操作不可恢复。
        </p>
      </Modal>

      <Modal
        title="新建用户"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCreateModalVisible(false);
            createForm.resetFields();
          }}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => createForm.submit()}>创建</Button>,
        ]}
        className="[&_.ant-modal-content]:!bg-[#1c1c1f] [&_.ant-modal-header]:!bg-[#1c1c1f]"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
        >
          <Form.Item
            name="email"
            label={<span className="text-[#a1a1aa]">邮箱</span>}
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效邮箱' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="text-[#a1a1aa]">密码</span>}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8位' },
            ]}
          >
            <Input.Password placeholder="至少8位" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label={<span className="text-[#a1a1aa]">昵称</span>}
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="用户昵称" />
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
