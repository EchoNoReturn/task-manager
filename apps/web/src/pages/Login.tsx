import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Tabs } from 'antd';
import { Mail, Lock, User } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../stores';

type RegistrationMode = 'open' | 'approval_required' | 'disabled';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  nickname: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>('open');
  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/system-settings/registration');
        setRegistrationMode(data.mode);
      } catch (error) {
        console.error('Failed to fetch registration settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterForm) => {
    setLoading(true);
    try {
      await api.post('/auth/register', values);
      message.success('注册成功，请登录');
      window.location.reload();
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen !bg-[#0a0a0b] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#111113] flex-col justify-between p-16">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Productor
          </h1>
          <p className="text-[#a1a1aa] mt-2">任务分配与管理平台</p>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            高效管理团队任务
            <br />
            专注核心工作
          </h2>
          <p className="text-[#71717a] text-lg">
            简化任务分配流程，提升团队协作效率
          </p>
        </div>
        <p className="text-[#52525b] text-sm">
          © 2024 Productor. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Productor
            </h1>
            <p className="text-[#a1a1aa] mt-2">任务分配与管理平台</p>
          </div>

          {registrationMode !== 'disabled' ? (
            <Tabs
              defaultActiveKey="login"
              className="[&_.ant-tabs-nav]:!mb-6 [&_.ant-tabs-tab]:!text-[#a1a1aa] [&_.ant-tabs-tab-active]:!text-white [&_.ant-tabs-ink-bar]:!bg-[#e11d48]"
              items={[
                {
                  key: 'login',
                  label: '登录',
                  children: (
                    <Form onFinish={handleLogin} layout="vertical" className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                          邮箱
                        </label>
                        <Form.Item
                          name="email"
                          rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效邮箱' },
                          ]}
                          className="!mb-0"
                        >
                          <Input
                            prefix={<Mail size={18} className="text-[#71717a]" />}
                            placeholder="you@example.com"
                            size="large"
                            className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                          />
                        </Form.Item>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                          密码
                        </label>
                        <Form.Item
                          name="password"
                          rules={[{ required: true, message: '请输入密码' }]}
                          className="!mb-0"
                        >
                          <Input.Password
                            prefix={<Lock size={18} className="text-[#71717a]" />}
                            placeholder="••••••••"
                            size="large"
                            className="!bg-[#111113] !border-[#27272a] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                          />
                        </Form.Item>
                      </div>

                      <Form.Item className="!mb-0 !mt-10">
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          size="large"
                          className="!bg-white !text-black !font-semibold !rounded-lg !h-14 !text-base hover:!bg-[rgba(255,255,255,0.9)] !border-none"
                        >
                          登录
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: 'register',
                  label: '注册',
                  children: (
                    <>
                      {registrationMode === 'approval_required' && (
                        <div className="mb-6 p-4 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                          <p className="text-[#f59e0b] text-sm">
                            注册需要管理员审核通过后才能使用
                          </p>
                        </div>
                      )}
                      <Form onFinish={handleRegister} layout="vertical" className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                            昵称
                          </label>
                          <Form.Item
                            name="nickname"
                            rules={[{ required: true, message: '请输入昵称' }]}
                            className="!mb-0"
                          >
                            <Input
                              prefix={<User size={18} className="text-[#71717a]" />}
                              placeholder="输入昵称"
                              size="large"
                              className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                            邮箱
                          </label>
                          <Form.Item
                            name="email"
                            rules={[
                              { required: true, message: '请输入邮箱' },
                              { type: 'email', message: '请输入有效邮箱' },
                            ]}
                            className="!mb-0"
                          >
                            <Input
                              prefix={<Mail size={18} className="text-[#71717a]" />}
                              placeholder="you@example.com"
                              size="large"
                              className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                            密码
                          </label>
                          <Form.Item
                            name="password"
                            rules={[
                              { required: true, message: '请输入密码' },
                              { min: 6, message: '密码至少6位' },
                            ]}
                            className="!mb-0"
                          >
                            <Input.Password
                              prefix={<Lock size={18} className="text-[#71717a]" />}
                              placeholder="••••••••"
                              size="large"
                              className="!bg-[#111113] !border-[#27272a] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                            />
                          </Form.Item>
                        </div>

                        <Form.Item className="!mb-0 !mt-10">
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            size="large"
                            className="!bg-white !text-black !font-semibold !rounded-lg !h-14 !text-base hover:!bg-[rgba(255,255,255,0.9)] !border-none"
                          >
                            注册
                          </Button>
                        </Form.Item>
                      </Form>
                    </>
                  ),
                },
              ]}
            />
          ) : (
            <div className="text-center">
              <div className="mb-6 p-6 rounded-lg bg-[#1c1c1f] border border-[#27272a]">
                <h3 className="text-xl font-bold text-white mb-4">注册已禁用</h3>
                <p className="text-[#71717a] mb-4">
                  当前系统不允许自主注册，请联系管理员为您创建账号。
                </p>
                <p className="text-[#52525b] text-sm">
                  管理员邮箱：admin@taskmanager.local
                </p>
              </div>
              <Form onFinish={handleLogin} layout="vertical" className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    邮箱
                  </label>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效邮箱' },
                    ]}
                    className="!mb-0"
                  >
                    <Input
                      prefix={<Mail size={18} className="text-[#71717a]" />}
                      placeholder="you@example.com"
                      size="large"
                      className="!bg-[#111113] !border-[#27272a] !text-white !placeholder:text-[#52525b] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                    />
                  </Form.Item>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                    密码
                  </label>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                    className="!mb-0"
                  >
                    <Input.Password
                      prefix={<Lock size={18} className="text-[#71717a]" />}
                      placeholder="••••••••"
                      size="large"
                      className="!bg-[#111113] !border-[#27272a] !rounded-lg hover:!border-[#3f3f46] focus:!border-[#e11d48]"
                    />
                  </Form.Item>
                </div>

                <Form.Item className="!mb-0 !mt-10">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="!bg-white !text-black !font-semibold !rounded-lg !h-14 !text-base hover:!bg-[rgba(255,255,255,0.9)] !border-none"
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
