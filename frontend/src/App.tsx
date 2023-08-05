import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

import { UserProvider } from './context/User/User';
import Router from './pages/routes';

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <UserProvider>
          <Router />
        </UserProvider>
        <Toaster />
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
