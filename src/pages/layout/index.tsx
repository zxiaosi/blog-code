import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps, theme } from 'antd';
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

  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  /** 菜单点击事件 */
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKey([e.key]);
    navigate(`/${e.key}`);
  };

  useEffect(() => {
    const path = location.pathname.slice(1); // 去掉开头的斜杠
    setSelectedKey([path]);
  }, [location]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKey}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: 16 }}>
          <div
            style={{
              padding: 24,
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
