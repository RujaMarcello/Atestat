import { LogoutOutlined, SettingFilled } from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { FC } from 'react';
import { useNavigate } from 'react-router';

import { useUserProvider } from '../../context/User';

const BottomDashboard: FC = () => {
  const navigate = useNavigate();
  const { signOut } = useUserProvider();
  const handleMenuClick: MenuProps['onSelect'] = ({ key }) => {
    switch (key) {
      case 'settings':
        navigate('settings');
        break;
      case 'logout':
        navigate('/login');
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
        { label: 'Logout', key: 'logout', icon: <LogoutOutlined /> },
        // { label: 'Settings', key: 'settings', icon: <SettingFilled /> },
      ]}
      onSelect={handleMenuClick}
    ></Menu>
  );
};

export default BottomDashboard;
