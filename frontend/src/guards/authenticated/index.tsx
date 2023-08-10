import { Spin } from 'antd';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useUserProvider } from '../../context/User/User';
import EmptyLayout from '../../layouts/Empty';
import LoginPage from '../../pages/login';
import { AuthenticatedGuardProps } from './map';

const AuthenticatedGuard: FC<AuthenticatedGuardProps> = ({ children }) => {
  const { user, userLoading } = useUserProvider();

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(user));
  const [requestedLocation, setRequestedLocation] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(Boolean(user));
  }, [user]);

  const renderComponent = useCallback(() => {
    const isDifferentLocation = location.pathname !== requestedLocation;
    if (isDifferentLocation) {
      setRequestedLocation(location.pathname);
    }

    if (!isAuthenticated) {
      return <EmptyLayout>{!userLoading ? <LoginPage requestedLocation={requestedLocation} /> : <Spin />}</EmptyLayout>;
    }

    /*
     * This is done so that in case the route changes by any chance through other
     * means between the moment of request and the render we navigate to the initially
     * requested route.
     */

    return <>{children}</>;
  }, [children, isAuthenticated, location.pathname, requestedLocation, userLoading]);

  return renderComponent();
};

export default memo(AuthenticatedGuard);
