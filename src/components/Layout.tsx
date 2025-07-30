import React, { ReactNode, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  onSettings?: () => void;
  onBackup?: () => void;
  onRestore?: () => void;
  onReset?: () => void;
  onHome?: () => void;
  showHeaderButtons?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onSettings, onBackup, onRestore, onReset, onHome, showHeaderButtons = true }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleResetClick = () => {
    if (showConfirmReset) {
      // Second click - actually reset
      onReset?.();
      setShowConfirmReset(false);
    } else {
      // First click - show confirmation
      setShowConfirmReset(true);
      // Auto-hide confirmation after 5 seconds
      setTimeout(() => setShowConfirmReset(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1
              className={`text-2xl font-bold text-gray-900 ${onHome ? 'cursor-pointer hover:text-indigo-600 transition-colors duration-200' : ''}`}
              onClick={onHome}
              title={onHome ? 'Return to main view' : undefined}
            >
              WireGen
            </h1>
            {showHeaderButtons && (
              <div className="flex space-x-3">
                {onReset && (
                  <button
                    onClick={handleResetClick}
                    className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                      showConfirmReset
                        ? 'border-red-500 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
                    }`}
                    title={showConfirmReset ? 'Click again to confirm reset' : 'Reset All Data - This will delete all configurations and settings'}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {showConfirmReset ? 'Confirm Reset' : 'Reset'}
                  </button>
                )}
                {onRestore && (
                  <button
                    onClick={onRestore}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Restore from Backup"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Restore
                  </button>
                )}
                {onBackup && (
                  <button
                    onClick={onBackup}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Backup Configurations and Settings"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Backup
                  </button>
                )}
                {onSettings && (
                  <button
                    onClick={onSettings}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Settings"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8 min-h-full">
          {children}
        </div>
      </main>
      <footer className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          WireGen &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;