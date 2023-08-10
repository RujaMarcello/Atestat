import { LogoutOutlined, SettingFilled } from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { FC } from 'react';
import { useNavigate } from 'react-router';

import { useUserProvider } from '../../context/User/User';
import { BOTTOMPAGE } from './map';

const BottomDashboard: FC = () => {
  const navigate = useNavigate();
  const { signOut } = useUserProvider();
  const handleMenuClick: MenuProps['onSelect'] = ({ key }) => {
    switch (key) {
      case BOTTOMPAGE.SETTINGS:
        navigate(BOTTOMPAGE.SETTINGS);
        break;
      case BOTTOMPAGE.LOGOUT:
        navigate(`/${BOTTOMPAGE.LOGOUT}`);
        signOut();
        break;
    }
  };
  return (
    <Menu
      selectedKeys={[]}
      mode="inline"
      theme="light"
      items={[
        { label: 'Logout', key: BOTTOMPAGE.LOGOUT, icon: <LogoutOutlined /> },
        { label: 'Settings', key: BOTTOMPAGE.SETTINGS, icon: <SettingFilled /> },
      ]}
      onSelect={handleMenuClick}
    ></Menu>
  );
};

export default BottomDashboard;
