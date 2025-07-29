import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">WireGuard Config Manager</h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8 min-h-full">
          {children}
        </div>
      </main>
      <footer className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          WireGuard Config Manager &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;