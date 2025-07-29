import { useState, useEffect } from 'react';

export enum View {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  FORM = 'FORM',
  IMPORT = 'IMPORT',
  IMPORT_BACKUP = 'IMPORT_BACKUP',
  SETTINGS = 'SETTINGS'
}

// URL path mapping
const VIEW_PATHS: Record<View, string> = {
  [View.LIST]: '/',
  [View.DETAIL]: '/config',
  [View.FORM]: '/edit',
  [View.IMPORT]: '/import',
  [View.IMPORT_BACKUP]: '/import-backup',
  [View.SETTINGS]: '/settings'
};

const PATH_VIEWS: Record<string, View> = {
  '/': View.LIST,
  '/config': View.DETAIL,
  '/edit': View.FORM,
  '/import': View.IMPORT,
  '/import-backup': View.IMPORT_BACKUP,
  '/settings': View.SETTINGS
};

export const useNavigation = () => {
  const [currentView, setCurrentView] = useState<View>(View.LIST);
  const [selectedConfigId, setSelectedConfigId] = useState<string | undefined>(undefined);

  // Initialize view from current URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const view = PATH_VIEWS[currentPath] || View.LIST;
    setCurrentView(view);
    
    // Extract config ID from URL if present
    const pathParts = currentPath.split('/');
    if (pathParts.length > 2) {
      setSelectedConfigId(pathParts[2]);
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const view = PATH_VIEWS[currentPath] || View.LIST;
      setCurrentView(view);
      
      // Extract config ID from URL if present
      const pathParts = currentPath.split('/');
      if (pathParts.length > 2) {
        setSelectedConfigId(pathParts[2]);
      } else {
        setSelectedConfigId(undefined);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when view changes
  const navigateToView = (view: View, configId?: string) => {
    const path = VIEW_PATHS[view];
    const url = configId ? `${path}/${configId}` : path;
    
    if (window.location.pathname !== url) {
      window.history.pushState({ view, configId }, '', url);
    }
    
    setCurrentView(view);
    setSelectedConfigId(configId);
  };

  return {
    currentView,
    selectedConfigId,
    navigateToView,
    View
  };
}; 