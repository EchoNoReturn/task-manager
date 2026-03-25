import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import {
  HomeOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores';

const { Header, Content } = AntLayout;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '仪表盘' },
  { key: '/tasks', icon: <CheckSquareOutlined />, label: '任务' },
  { key: '/team-tasks', icon: <TeamOutlined />, label: '小组任务' },
  { key: '/calendar', icon: <CalendarOutlined />, label: '日历' },
  { key: '/admin', icon: <SettingOutlined />, label: '管理' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: user?.nickname || user?.email },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Productor</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, marginLeft: 24 }}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
        </Dropdown>
      </Header>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
}
