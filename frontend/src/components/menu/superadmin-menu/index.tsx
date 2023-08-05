import { AppstoreAddOutlined, TableOutlined, UserOutlined, WechatOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { FC } from 'react';
import { useNavigate } from 'react-router';

import { PAGE } from '../map';
const SuperAdminDashboard: FC = () => {
  const navigate = useNavigate();
  const handleMenuClick: MenuProps['onSelect'] = ({ key }) => {
    switch (key) {
      case PAGE.ALL_USERS:
        navigate(PAGE.ALL_USERS);
        break;
      case PAGE.CHAT:
        navigate(PAGE.CHAT);
        break;
      case PAGE.SETTINGS:
        navigate(PAGE.SETTINGS);
        break;
      case PAGE.PROFILE:
        navigate(PAGE.PROFILE);
        break;
      case PAGE.NEW_GROUP:
        navigate(PAGE.NEW_GROUP);
        break;
    }
  };
  return (
    <Menu
      mode="inline"
      theme="light"
      items={[
        { label: 'All Users', key: PAGE.ALL_USERS, icon: <TableOutlined /> },
        { label: 'Chat', key: PAGE.CHAT, icon: <WechatOutlined /> },
        { label: 'Profile', key: PAGE.PROFILE, icon: <UserOutlined /> },
        { label: 'New Group', key: PAGE.NEW_GROUP, icon: <AppstoreAddOutlined /> },
      ]}
      onSelect={handleMenuClick}
    ></Menu>
  );
};

export default SuperAdminDashboard;
