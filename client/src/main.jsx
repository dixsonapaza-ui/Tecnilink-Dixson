import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './context/AuthContext.jsx';
import { router } from './routes/router.jsx';
import './styles.css';

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
