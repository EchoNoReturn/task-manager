import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Avatar, Dropdown } from 'antd';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  UserCog,
  LogOut,
  User,
  Shield,
  Archive,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '../stores';
import api from '../api';

const { Sider, Header } = AntLayout;

interface NavItem {
  key: string;
  icon: typeof LayoutDashboard;
  label: string;
  adminOnly?: boolean;
  leaderOnly?: boolean;
}

const navItems: NavItem[] = [
  { key: '/', icon: LayoutDashboard, label: '仪表盘' },
  { key: '/tasks', icon: CheckSquare, label: '任务' },
  { key: '/team-tasks', icon: Users, label: '团队任务' },
  { key: '/team-lead-tasks', icon: Crown, label: '小组管理', leaderOnly: true },
  { key: '/calendar', icon: Calendar, label: '日历' },
  { key: '/archived-tasks', icon: Archive, label: '已归档' },
  { key: '/admin', icon: Settings, label: '管理', adminOnly: true },
  { key: '/users', icon: UserCog, label: '用户管理', adminOnly: true },
  { key: '/teams', icon: Shield, label: '团队管理', adminOnly: true },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuthStore();
  const [isTeamLead, setIsTeamLead] = useState(false);

  useEffect(() => {
    const checkTeamLead = async () => {
      try {
        const { data } = await api.get('/teams/leader-of');
        setIsTeamLead(data.length > 0);
      } catch (error) {
        setIsTeamLead(false);
      }
    };
    checkTeamLead();
  }, []);

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.leaderOnly && !isTeamLead) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: user?.nickname || user?.email,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sider
        width={260}
        className="!bg-[#111113] border-r border-[#27272a] flex flex-col"
      >
        <div className="h-[72px] flex items-center px-6 border-b border-[#27272a] flex-shrink-0">
          <span className="text-xl font-bold text-white tracking-tight">
            Productor
          </span>
        </div>
        <nav className="py-6 px-4 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.key)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                      transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? 'bg-[rgba(225,29,72,0.15)] text-white'
                          : 'text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </Sider>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          className="!bg-[#0a0a0b] border-b border-[#27272a] flex items-center justify-end px-8 flex-shrink-0"
          style={{ height: 72 }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-[#a1a1aa]">
                {user?.nickname || user?.email}
              </span>
              <Avatar
                className="!bg-[#27272a] !text-[#a1a1aa]"
                size={40}
              >
                {(user?.nickname || user?.email || 'U')[0].toUpperCase()}
              </Avatar>
            </div>
          </Dropdown>
        </Header>
        <main className="flex-1 overflow-y-auto !bg-[#0a0a0b] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
