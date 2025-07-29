import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import ConfigList from './components/ConfigList';
import ConfigForm from './components/ConfigForm';
import ConfigDetail from './components/ConfigDetail';
import ImportConfig from './components/ImportConfig';
import ImportBackup from './components/ImportBackup';
import SystemSettings from './components/SystemSettings';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { WireGuardConfig } from './types/WireGuardConfig';
import { SystemSettings as SystemSettingsType } from './types/SystemSettings';

// Enum for application views
enum View {
  LIST,
  DETAIL,
  FORM,
  IMPORT,
  IMPORT_BACKUP,
  SETTINGS
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

// Main App content
const AppContent: React.FC = () => {
  const { configs, addConfig, updateConfig, deleteConfig, replaceAllConfigs, systemSettings, updateSystemSettings } = useConfig();
  const [currentView, setCurrentView] = useState<View>(View.LIST);
  const [selectedConfig, setSelectedConfig] = useState<WireGuardConfig | undefined>(undefined);

  // Initialize view from current URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const view = PATH_VIEWS[currentPath] || View.LIST;
    setCurrentView(view);
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const view = PATH_VIEWS[currentPath] || View.LIST;
      setCurrentView(view);
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
  };
  
  // Handle backing up all configurations and system settings as JSON
  const handleBackup = () => {
    if (configs.length === 0 && !systemSettings) {
      alert('No configurations or system settings to backup');
      return;
    }
    
    // Create backup object with configs and system settings
    const backupData = {
      configs: configs,
      systemSettings: systemSettings,
      backupDate: new Date().toISOString(),
      version: '1.0'
    };
    
    // Create a blob and download it
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wireguard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle selecting a config to view details
  const handleSelectConfig = (config: WireGuardConfig) => {
    setSelectedConfig(config);
    navigateToView(View.DETAIL, config.id);
  };

  // Handle adding a new config
  const handleAddConfig = () => {
    setSelectedConfig(undefined);
    navigateToView(View.FORM);
  };
  
  // Handle importing a config
  const handleImportConfig = () => {
    navigateToView(View.IMPORT);
  };

  // Handle importing a backup
  const handleImportBackup = () => {
    navigateToView(View.IMPORT_BACKUP);
  };

  // Handle the imported backup
  const handleBackupImported = (configs: WireGuardConfig[], systemSettings: SystemSettingsType) => {
    // Replace all existing configs and system settings
    // Clear existing configs and add new ones
    replaceAllConfigs(configs);
    
    // Update system settings
    updateSystemSettings(systemSettings);
    
    navigateToView(View.LIST);
  };

  // Handle system settings
  const handleSystemSettings = () => {
    navigateToView(View.SETTINGS);
  };
  
  // Handle the imported config
  const handleConfigImported = (config: WireGuardConfig) => {
    addConfig(config);
    setSelectedConfig(config);
    navigateToView(View.DETAIL, config.id);
  };

  // Handle editing a config
  const handleEditConfig = () => {
    navigateToView(View.FORM, selectedConfig?.id);
  };

  // Handle deleting a config
  const handleDeleteConfig = (id: string) => {
    deleteConfig(id);
    setSelectedConfig(undefined);
    navigateToView(View.LIST);
  };

  // Handle saving a config (add or update)
  const handleSaveConfig = (config: WireGuardConfig) => {
    if (selectedConfig) {
      updateConfig(config);
    } else {
      addConfig(config);
    }
    setSelectedConfig(config);
    navigateToView(View.DETAIL, config.id);
  };

  // Handle exporting a config
  const handleExportConfig = () => {
    if (!selectedConfig) return;
    
    // Create WireGuard config file content
    const content = generateWireGuardConfig(selectedConfig);
    
    // Create a blob and download it
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedConfig.name.replace(/\s+/g, '-').toLowerCase()}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate WireGuard config file content
  const generateWireGuardConfig = (config: WireGuardConfig): string => {
    let content = '[Interface]\n';
    content += `PrivateKey = ${config.interface.privateKey}\n`;
    content += config.interface.address.map(addr => `Address = ${addr}\n`).join('');
    
    if (config.interface.listenPort) {
      content += `ListenPort = ${config.interface.listenPort}\n`;
    }
    
    if (config.interface.dns && config.interface.dns.length > 0) {
      content += `DNS = ${config.interface.dns.join(', ')}\n`;
    }
    
    // Add MTU from individual config or system settings
    const mtu = config.interface.mtu || systemSettings.mtu;
    if (mtu) {
      content += `MTU = ${mtu}\n`;
    }
    
    config.peers.forEach(peer => {
      content += '\n[Peer]\n';
      content += `PublicKey = ${peer.publicKey}\n`;
      content += peer.allowedIPs.map(ip => `AllowedIPs = ${ip}\n`).join('');
      
      if (peer.endpoint) {
        content += `Endpoint = ${peer.endpoint}\n`;
      }
      
      // Use peer's persistent keepalive or system default
      const persistentKeepalive = peer.persistentKeepalive !== undefined 
        ? peer.persistentKeepalive 
        : systemSettings.defaultPersistentKeepalive;
      
      if (persistentKeepalive !== undefined && persistentKeepalive > 0) {
        content += `PersistentKeepalive = ${persistentKeepalive}\n`;
      }
      
      if (peer.presharedKey) {
        content += `PresharedKey = ${peer.presharedKey}\n`;
      }
    });
    
    return content;
  };

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case View.LIST:
        return (
          <ConfigList
            configs={configs}
            onSelect={handleSelectConfig}
            onDelete={handleDeleteConfig}
            onAdd={handleAddConfig}
            onImport={handleImportConfig}
          />
        );
      case View.DETAIL:
        if (!selectedConfig) return null;
        return (
          <ConfigDetail
            config={selectedConfig}
            onEdit={handleEditConfig}
            onDelete={() => handleDeleteConfig(selectedConfig.id)}
            onExport={handleExportConfig}
            onBack={() => navigateToView(View.LIST)}
          />
        );
      case View.FORM:
        return (
          <ConfigForm
            config={selectedConfig}
            onSave={handleSaveConfig}
            onCancel={() => {
              if (selectedConfig) {
                navigateToView(View.DETAIL, selectedConfig.id);
              } else {
                navigateToView(View.LIST);
              }
            }}
          />
        );
      case View.IMPORT:
        return (
          <ImportConfig
            onImport={handleConfigImported}
            onCancel={() => navigateToView(View.LIST)}
          />
        );
      case View.IMPORT_BACKUP:
        return (
          <ImportBackup
            onImport={handleBackupImported} // Assuming ImportBackup also adds to configs
            onCancel={() => navigateToView(View.LIST)}
          />
        );
      case View.SETTINGS:
        return (
          <SystemSettings
            onBack={() => navigateToView(View.LIST)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      onSettings={handleSystemSettings}
      onBackup={handleBackup}
      onRecover={handleImportBackup}
      showHeaderButtons={currentView === View.LIST}
    >
      {renderView()}
    </Layout>
  );
};

// Wrap the app with the ConfigProvider
function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

export default App;
