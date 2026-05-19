import { createBrowserRouter } from 'react-router-dom';

import { CategoriesPage } from '../pages/CategoriesPage.jsx';
import { CreateRequestPage } from '../pages/CreateRequestPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { PrivateLayout } from '../layouts/PrivateLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { RequestDetailPage } from '../pages/RequestDetailPage.jsx';
import { RequestsPage } from '../pages/RequestsPage.jsx';
import { ServerErrorPage } from '../pages/ServerErrorPage.jsx';
import { UnauthorizedPage } from '../pages/UnauthorizedPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/requests',
            element: <RequestsPage />,
          },
          {
            element: <ProtectedRoute allowedRoles={['CLIENTE']} />,
            children: [
              {
                path: '/requests/new',
                element: <CreateRequestPage />,
              },
            ],
          },
          {
            path: '/requests/:id',
            element: <RequestDetailPage />,
          },
          {
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: '/categories',
                element: <CategoriesPage />,
              },
            ],
          },
          {
            path: '/unauthorized',
            element: <UnauthorizedPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/server-error',
    element: <ServerErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
