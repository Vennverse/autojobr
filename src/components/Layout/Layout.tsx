import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { UserProfile } from '../../types';

interface LayoutProps {
  user: UserProfile;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;