import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import ConfigList from './components/ConfigList';
import ConfigForm from './components/ConfigForm';
import ConfigDetail from './components/ConfigDetail';
import ImportConfig from './components/ImportConfig';
import SystemSettings from './components/SystemSettings';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { WireGuardConfig } from './types/WireGuardConfig';

// Enum for application views
enum View {
  LIST,
  DETAIL,
  FORM,
  IMPORT,
  SETTINGS
}

// Main App content
const AppContent: React.FC = () => {
  const { configs, addConfig, updateConfig, deleteConfig, systemSettings } = useConfig();
  const [currentView, setCurrentView] = useState<View>(View.LIST);
  const [selectedConfig, setSelectedConfig] = useState<WireGuardConfig | undefined>(undefined);
  
  // Handle exporting all configurations as JSON
  const handleExportAllConfigs = () => {
    if (configs.length === 0) {
      alert('No configurations to export');
      return;
    }
    
    // Create a blob and download it
    const blob = new Blob([JSON.stringify(configs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wireguard-configs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle selecting a config to view details
  const handleSelectConfig = (config: WireGuardConfig) => {
    setSelectedConfig(config);
    setCurrentView(View.DETAIL);
  };

  // Handle adding a new config
  const handleAddConfig = () => {
    setSelectedConfig(undefined);
    setCurrentView(View.FORM);
  };
  
  // Handle importing a config
  const handleImportConfig = () => {
    setCurrentView(View.IMPORT);
  };

  // Handle system settings
  const handleSystemSettings = () => {
    setCurrentView(View.SETTINGS);
  };
  
  // Handle the imported config
  const handleConfigImported = (config: WireGuardConfig) => {
    addConfig(config);
    setSelectedConfig(config);
    setCurrentView(View.DETAIL);
  };

  // Handle editing a config
  const handleEditConfig = () => {
    setCurrentView(View.FORM);
  };

  // Handle deleting a config
  const handleDeleteConfig = (id: string) => {
    deleteConfig(id);
    setCurrentView(View.LIST);
  };

  // Handle saving a config (add or update)
  const handleSaveConfig = (config: WireGuardConfig) => {
    if (selectedConfig) {
      updateConfig(config);
    } else {
      addConfig(config);
    }
    setSelectedConfig(config);
    setCurrentView(View.DETAIL);
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
            onExport={handleExportAllConfigs}
            onSettings={handleSystemSettings}
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
            onBack={() => setCurrentView(View.LIST)}
          />
        );
      case View.FORM:
        return (
          <ConfigForm
            config={selectedConfig}
            onSave={handleSaveConfig}
            onCancel={() => {
              if (selectedConfig) {
                setCurrentView(View.DETAIL);
              } else {
                setCurrentView(View.LIST);
              }
            }}
          />
        );
      case View.IMPORT:
        return (
          <ImportConfig
            onImport={handleConfigImported}
            onCancel={() => setCurrentView(View.LIST)}
          />
        );
      case View.SETTINGS:
        return (
          <SystemSettings
            onBack={() => setCurrentView(View.LIST)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
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
