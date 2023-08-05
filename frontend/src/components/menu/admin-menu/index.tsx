import { BuildOutlined, GroupOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { FC } from 'react';
import { useNavigate } from 'react-router';

import { PAGE } from '../map';
const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const handleMenuClick: MenuProps['onSelect'] = ({ key }) => {
    switch (key) {
      case PAGE.MY_GROUPS:
        navigate(PAGE.MY_GROUPS);
        break;
      case PAGE.PROFILE:
        navigate(PAGE.PROFILE);
        break;
      case PAGE.CREATE_GROUP:
        navigate(PAGE.CREATE_GROUP);
        break;
    }
  };
  return (
    <Menu
      mode="inline"
      theme="light"
      items={[
        { label: 'My Groups', key: PAGE.MY_GROUPS, icon: <GroupOutlined /> },
        { label: 'Create Group', key: PAGE.CREATE_GROUP, icon: <BuildOutlined /> },
        { label: 'Profile', key: PAGE.PROFILE, icon: <UserOutlined /> },
      ]}
      onSelect={handleMenuClick}
    ></Menu>
  );
};

export default AdminDashboard;
