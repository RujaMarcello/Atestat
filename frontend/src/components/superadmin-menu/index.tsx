import { BellOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';
import { Menu, Badge } from 'antd';
import { MenuProps } from 'antd/lib/menu';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router';

const SuperAdminDashboard: FC = () => {
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(3); // Mock data pentru numărul de alerte necitite

  const handleMenuClick: MenuProps['onSelect'] = ({ key }) => {
    switch (key) {
      case 'patient-management':
        navigate('patient-management');
        break;
      case 'dashboard':
        navigate('health-charts');
        break;
      case 'alerts':
        navigate('alerts');
        break;
    }
  };
  return (
    <Menu
      mode="inline"
      theme="light"
      items={[
        { label: 'Management Pacienți', key: 'patient-management', icon: <TeamOutlined /> },
        { label: 'Dashboard', key: 'dashboard', icon: <DashboardOutlined /> },
        {
          label: 'Notificări',
          key: 'alerts',
          icon: <Badge count={alertCount} size="small"><BellOutlined /></Badge>
        },
      ]}
      onSelect={handleMenuClick}
    ></Menu>
  );
};

export default SuperAdminDashboard;
