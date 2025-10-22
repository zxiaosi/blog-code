import { DashboardOutlined, GithubOutlined, UserOutlined } from '@ant-design/icons';
import { FloatButton, Layout, Menu, MenuProps, theme } from 'antd';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: 'home',
    label: 'Home',
    icon: <DashboardOutlined />,
  },
  {
    key: 'about',
    label: 'About',
    icon: <UserOutlined />,
  },
];

const BaseLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  /** 模拟用户登录 - 类型定义在 vite-env.d.ts */
  window.sdk = { userId: 'Admin' };

  /** 菜单点击事件 */
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKey([e.key]);
    navigate(`/${e.key}`);
  };

  /** 跳转到Github */
  const handleToGithub = () => {
    window.open('https://github.com/zxiaosi/blog-code/tree/monitor');
  };

  useEffect(() => {
    const path = location.pathname.slice(1); // 去掉开头的斜杠
    setSelectedKey([path]);
  }, [location]);

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        width={160}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKey}
          onClick={handleMenuClick}
        />

        <FloatButton
          type="primary"
          icon={<GithubOutlined />}
          onClick={handleToGithub}
          style={{ insetInlineEnd: 16, insetBlockStart: '20px' }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: 'var(--padding-lg)' }}>
          <div
            style={{
              padding: 'var(--padding-lg)',
              height: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BaseLayout;
