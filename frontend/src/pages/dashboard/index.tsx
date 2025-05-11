import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecționare către dashboard-ul medical
    navigate('/dashboard/health-charts');
  }, [navigate]);

  return null; // Nu mai afișăm nimic, deoarece redirecționăm
};

export default Dashboard;
