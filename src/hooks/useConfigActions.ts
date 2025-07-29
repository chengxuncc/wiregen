import { useConfig } from '../contexts/ConfigContext';
import { WireGuardConfig } from '../types/WireGuardConfig';
import { SystemSettings } from '../types/SystemSettings';
import { View } from './useNavigation';

export const useConfigActions = (navigateToView: (view: View, configId?: string) => void) => {
  const { 
    configs, 
    addConfig, 
    updateConfig, 
    deleteConfig, 
    replaceAllConfigs, 
    systemSettings, 
    updateSystemSettings 
  } = useConfig();

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

  // Handle selecting a config
  const handleSelectConfig = (config: WireGuardConfig) => {
    navigateToView(View.DETAIL, config.id);
  };

  // Handle adding a new config
  const handleAddConfig = () => {
    navigateToView(View.FORM);
  };

  // Handle importing a config
  const handleImportConfig = () => {
    navigateToView(View.IMPORT);
  };

  // Handle importing a backup
  const handleRestore = () => {
    navigateToView(View.IMPORT_BACKUP);
  };

  // Handle the imported backup
  const handleBackupImported = (configs: WireGuardConfig[], systemSettings: SystemSettings) => {
    // Replace all existing configs and system settings
    replaceAllConfigs(configs);
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
    navigateToView(View.DETAIL, config.id);
  };

  // Handle editing a config
  const handleEditConfig = (configId: string) => {
    navigateToView(View.FORM, configId);
  };

  // Handle deleting a config
  const handleDeleteConfig = (id: string) => {
    deleteConfig(id);
    navigateToView(View.LIST);
  };

  // Handle saving a config (add or update)
  const handleSaveConfig = (config: WireGuardConfig) => {
    if (configs.find(c => c.id === config.id)) {
      updateConfig(config);
    } else {
      addConfig(config);
    }
    navigateToView(View.DETAIL, config.id);
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
      
      // Add persistent keepalive from individual peer or system settings
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

  // Handle exporting a config
  const handleExportConfig = (config: WireGuardConfig) => {
    // Create WireGuard config file content
    const content = generateWireGuardConfig(config);
    
    // Create a blob and download it
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, '-').toLowerCase()}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    configs,
    systemSettings,
    handleBackup,
    handleSelectConfig,
    handleAddConfig,
    handleImportConfig,
    handleRestore,
    handleBackupImported,
    handleSystemSettings,
    handleConfigImported,
    handleEditConfig,
    handleDeleteConfig,
    handleSaveConfig,
    handleExportConfig,
    generateWireGuardConfig
  };
}; 