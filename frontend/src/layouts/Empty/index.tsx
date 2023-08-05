import { Layout } from 'antd';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import { LayoutInterface } from '../map';

const EmptyLayout: FC<LayoutInterface> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content>{children || <Outlet />}</Layout.Content>
    </Layout>
  );
};

export default EmptyLayout;
