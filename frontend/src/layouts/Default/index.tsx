import { Layout } from 'antd';
import { FC, ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';

import AdminDashboard from '../../components/admin-menu';
import BottomDashboard from '../../components/bottom-menu';
import HeaderContent from '../../components/header-content';
import SuperAdminDashboard from '../../components/superadmin-menu';
import UserDashboard from '../../components/user-menu';
import { Role } from '../../context/Role';
import { ReactComponent as Logo } from '../../pages/svg/logo.svg';
import styles from './index.module.scss';

interface DefaultLayoutProps {
  children?: ReactNode;
}

const DefaultLayout: FC<DefaultLayoutProps> = ({ children }) => {
  const [collappsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <Layout.Sider
        style={{ minHeight: '100vh', background: '#FFFFFF' }}
        collapsible
        theme="light"
        collapsed={collappsed}
        onCollapse={(value) => {
          setCollapsed(value);
        }}
        collapsedWidth={64}
        width={200}
      >
        <div className={styles.logo}>
          <Logo className={styles.svgLogo} />
        </div>
        <Role renderIf={({ SUPERADMIN }) => SUPERADMIN}>
          <SuperAdminDashboard />
        </Role>
        <Role renderIf={({ ADMIN }) => ADMIN}>
          <AdminDashboard />
        </Role>
        <Role renderIf={({ USER }) => USER}>
          <UserDashboard />
        </Role>
        <div className={styles.Spacer}></div>
        <BottomDashboard />
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <HeaderContent />
        </Layout.Header>
        <Layout.Content style={{ margin: '24px' }}>{children || <Outlet />}</Layout.Content>
        <Layout.Footer>
          <h1 className={styles.footer}></h1>
        </Layout.Footer>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
