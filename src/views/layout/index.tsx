import { useEffect, useState } from "react";
import { Layout, Menu, Button, MenuProps } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { generateMenu } from "../../router";
import { clearLocal, getLocal, setLocal } from "../../utils/auth";
import styles from "./index.module.less";
const { Header, Sider, Content } = Layout;

const menuItems = generateMenu(getLocal("menus")); // 获取菜单 - 放到全局, 防止每次渲染都重新生成

const Index = () => {
  const navigate = useNavigate();

  const [currentMenu, setCurrentMenu] = useState("/dashboard");
  const [parentMenu, setParentMenu] = useState<any>([]);

  /** 监听浏览器地址栏路由变化 - 防止刷新选中菜单错位 */
  useEffect(() => {
    const pageCurrentMenu = location.pathname;
    const parts = pageCurrentMenu.split("/");
    const pageParentMenu = parts.length > 2 ? ["/" + parts[1]] : []; // 当选中二级菜单时，重新设置父级菜单
    // console.log("pageCurrentMenu", pageCurrentMenu, pageParentMenu);

    setCurrentMenu(pageCurrentMenu);
    setParentMenu(pageParentMenu);
  }, [location.pathname]);

  /** 点击菜单触发事件 */
  const handleMenu: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  /** 点击父菜单触发事件 */
  const handleParentMenu: MenuProps["onOpenChange"] = (keys) => {
    const latestOpenKey = keys.find((key: any) => parentMenu.indexOf(key) === -1); // 最后打开的菜单
    setParentMenu(latestOpenKey ? [latestOpenKey] : []); // 如果有最后打开的菜单，就展开，否则收起
  };

  /**
   * 退出登录
   */
  const handleLogout = async () => {
    clearLocal();
    navigate("/login", { replace: true });
  }

  return (
    <Layout>
      <Sider className={styles.sider} trigger={null} collapsible >
        <div className={styles.title}>Demo</div>

        <Menu theme="dark" mode="inline" openKeys={parentMenu} selectedKeys={[currentMenu]} items={menuItems} onClick={handleMenu} onOpenChange={handleParentMenu} />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div className={styles.right}>
            <Button type="primary" onClick={handleLogout}>退出登录</Button>
          </div>
        </Header>

        <Content className={styles.content}>

          {/* 指定路由组件呈现的位置 */}
          <Outlet />

        </Content>
      </Layout>
    </Layout>
  );
};

export default Index;
