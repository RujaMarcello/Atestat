import { FC, lazy, Suspense, useEffect } from 'react';
import { Navigate, RouteObject, useLocation, useRoutes } from 'react-router';

import FullscreenLoader from '../components/fullscreen-loader';
import { Role } from '../context/Role';
import AuthenticatedGuard from '../guards/authenticated';
import GuestGuard from '../guards/guest';
import DefaultLayout from '../layouts/Default';
import EmptyLayout from '../layouts/Empty';

// eslint-disable-next-line @typescript-eslint/no-explicit-any,react/display-name
const Loadable = (Component: FC) => (props: any) => {
  return (
    <Suspense fallback={<FullscreenLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

const Page = {
  Project: {
    Dashboard: {
      AllUsers: Loadable(lazy(() => import('./dashboard/all-users/all-users'))),
      Notification: Loadable(lazy(() => import('./dashboard/notification'))),
      HealthCharts: Loadable(lazy(() => import('./dashboard/health-charts'))),
      Alerts: Loadable(lazy(() => import('./dashboard/alerts'))),
      PatientManagement: Loadable(lazy(() => import('./dashboard/patient-management'))),
    },
  },
  Login: Loadable(lazy(() => import('./login'))),
  Register: Loadable(lazy(() => import('./register'))),
  Error404: Loadable(lazy(() => import('./404'))),
  Dashboard: Loadable(lazy(() => import('./dashboard'))),
};

const routes: Array<RouteObject> = [
  {
    path: '/',
    element: (
      <AuthenticatedGuard>
        <EmptyLayout />
      </AuthenticatedGuard>
    ),
    children: [{ path: '/', element: <Navigate to="/dashboard/health-charts" replace /> }],
  },
  {
    path: '/dashboard',
    element: (
      <AuthenticatedGuard inProjectGuard>
        <DefaultLayout />
      </AuthenticatedGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <>
            <Role renderIf={({ SUPERADMIN }) => SUPERADMIN}>
              <Page.Dashboard />
            </Role>
            <Role renderIf={({ USER, ADMIN }) => USER || ADMIN}>
              <Page.Dashboard />
            </Role>
          </>
        ),
      },
      {
        path: 'all-users',
        children: [
          {
            index: true,
            element: (
              <>
                <Role renderIf={({ SUPERADMIN }) => SUPERADMIN}>
                  <Page.Project.Dashboard.AllUsers />
                </Role>
                <Role renderIf={({ USER, ADMIN }) => USER || ADMIN}>
                  <EmptyLayout>
                    <Page.Error404 />
                  </EmptyLayout>
                </Role>
              </>
            ),
          },
        ],
      },
      {
        path: 'health-charts',
        children: [
          {
            index: true,
            element: (
              <>
                <Role renderIf={({ SUPERADMIN, ADMIN, USER }) => SUPERADMIN || ADMIN || USER}>
                  <Page.Project.Dashboard.HealthCharts />
                </Role>
              </>
            ),
          },
        ],
      },
      {
        path: 'alerts',
        children: [
          {
            index: true,
            element: (
              <>
                <Role renderIf={({ SUPERADMIN, ADMIN, USER }) => SUPERADMIN || ADMIN || USER}>
                  <Page.Project.Dashboard.Alerts />
                </Role>
              </>
            ),
          },
        ],
      },
      {
        path: 'patient-management',
        children: [
          {
            index: true,
            element: (
              <>
                <Role renderIf={({ SUPERADMIN, ADMIN }) => SUPERADMIN || ADMIN}>
                  <Page.Project.Dashboard.PatientManagement />
                </Role>
                <Role renderIf={({ USER }) => USER}>
                  <EmptyLayout>
                    <Page.Error404 />
                  </EmptyLayout>
                </Role>
              </>
            ),
          },
        ],
      },
    ],
  },

  {
    path: '/register',
    element: (
      <GuestGuard>
        <EmptyLayout />
      </GuestGuard>
    ),
    children: [{ index: true, element: <Page.Register /> }],
  },
  {
    path: '/login',
    element: (
      <GuestGuard>
        <EmptyLayout />
      </GuestGuard>
    ),
    children: [{ index: true, element: <Page.Login /> }],
  },
  {
    path: '*',
    element: <Page.Error404 />,
  },
];

const Router: FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return useRoutes(routes);
};

export default Router;
