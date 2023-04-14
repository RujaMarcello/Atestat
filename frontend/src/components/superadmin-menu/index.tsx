import { TableOutlined, UserOutlined, WechatOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { FC } from 'react';
import { useNavigate } from 'react-router';

const SuperAdminDashboard: FC = () => {
  const navigate = useNavigate();
  const handleMenuClick: MenuProps['onSelect'] = ({ key }) => {
    switch (key) {
      case 'all-users':
        navigate('all-users');
        break;
      case 'chat':
        navigate('chat');
        break;
      case 'settings':
        navigate('settings');
        break;
      case 'profile':
        navigate('profile');
        break;
    }
  };
  return (
    <Menu
      mode="inline"
      theme="light"
      items={[
        { label: 'All Users', key: 'all-users', icon: <TableOutlined /> },
        { label: 'Chat', key: 'chat', icon: <WechatOutlined /> },
        { label: 'Profile', key: 'profile', icon: <UserOutlined /> },
      ]}
      onSelect={handleMenuClick}
    ></Menu>
  );
};

export default SuperAdminDashboard;
