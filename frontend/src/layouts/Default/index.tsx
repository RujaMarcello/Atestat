import { Layout } from 'antd';
import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';

import BottomDashboard from '../../components/bottom-menu';
import HeaderContent from '../../components/header-content';
import AdminDashboard from '../../components/menu/admin-menu';
import SuperAdminDashboard from '../../components/menu/superadmin-menu';
import UserDashboard from '../../components/menu/user-menu';
import { Role } from '../../context/Role/Role';
import { ReactComponent as Logo } from '../../pages/svg/logo.svg';
import { LayoutInterface } from '../map';
import styles from './index.module.scss';

const DefaultLayout: FC<LayoutInterface> = ({ children }) => {
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
          <h1 className={styles.footer}>Copyright © 2023 MxO. All Rights Reserved</h1>
        </Layout.Footer>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;
