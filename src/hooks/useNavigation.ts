import { useState, useEffect } from 'react';

export enum View {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  IMPORT = 'IMPORT',
  IMPORT_BACKUP = 'IMPORT_BACKUP',
  SETTINGS = 'SETTINGS'
}

// URL path mapping
const VIEW_PATHS: Record<View, string> = {
  [View.LIST]: '/',
  [View.DETAIL]: '/config',
  [View.IMPORT]: '/import',
  [View.IMPORT_BACKUP]: '/import-backup',
  [View.SETTINGS]: '/settings'
};

const PATH_VIEWS: Record<string, View> = {
  '/': View.LIST,
  '/config': View.DETAIL,
  '/import': View.IMPORT,
  '/import-backup': View.IMPORT_BACKUP,
  '/settings': View.SETTINGS
};

export const useNavigation = () => {
  const [currentView, setCurrentView] = useState<View>(View.LIST);
  const [selectedConfigId, setSelectedConfigId] = useState<string | undefined>(undefined);

  // Parse URL to extract view and config ID
  const parseUrl = (pathname: string): { view: View; configId?: string } => {
    // Handle /config/:id pattern
    if (pathname.startsWith('/config/')) {
      const configId = pathname.substring(8); // Remove '/config/' prefix
      return { view: View.DETAIL, configId };
    }
    
    // Handle other paths
    const view = PATH_VIEWS[pathname] || View.LIST;
    return { view, configId: undefined };
  };

  // Initialize view from current URL
  useEffect(() => {
    const { view, configId } = parseUrl(window.location.pathname);
    setCurrentView(view);
    setSelectedConfigId(configId);
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const { view, configId } = parseUrl(window.location.pathname);
      setCurrentView(view);
      setSelectedConfigId(configId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when view changes
  const navigateToView = (view: View, configId?: string) => {
    const basePath = VIEW_PATHS[view];
    let url: string;
    
    if (view === View.DETAIL && configId) {
      url = `/config/${configId}`;
    } else {
      url = basePath;
    }

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