import {useConfig} from '../contexts/ConfigContext';
import {WireGuardConfig} from '../types/WireGuardConfig';
import {Settings} from '../types/Settings';
import {View} from './useNavigation';

export const useConfigActions = (navigateToView: (view: View, configId?: string) => void) => {
  const {
    configs,
    addConfig,
    updateConfig,
    deleteConfig,
    replaceAllConfigs,
    settings,
    updateSettings,
    resetAllData
  } = useConfig();

  // Handle backing up all configurations and settings as JSON
  const handleBackup = () => {
    if (configs.length === 0 && !settings) {
      alert('No configurations or settings to backup');
      return;
    }

    // Create backup object with configs and settings
    const backupData = {
      backupDate: new Date().toISOString(),
      settings: settings,
      configs: configs
    };

    // Create a blob and download it
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wiregen-backup-${new Date().toISOString().split('T')[0]}.json`;
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
    navigateToView(View.DETAIL);
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
  const handleBackupImported = (configs: WireGuardConfig[], settings: Settings) => {
    // Replace all existing configs and settings
    replaceAllConfigs(configs);
    updateSettings(settings);
    navigateToView(View.LIST);
  };

  // Handle settings
  const handleSettings = () => {
    navigateToView(View.SETTINGS);
  };

  // Handle the imported config
  const handleConfigImported = (config: WireGuardConfig) => {
    addConfig(config);
    navigateToView(View.DETAIL, config.id);
  };

  // Handle editing a config
  const handleEditConfig = (configId: string) => {
    navigateToView(View.DETAIL, configId);
  };

  // Handle deleting a config
  const handleDeleteConfig = (id: string) => {
    deleteConfig(id);
    navigateToView(View.LIST);
  };

  // Handle saving a config (add or update)
  const handleSaveConfig = (config: WireGuardConfig) => {
    const isNewConfig = !configs.find(c => c.id === config.id);

    if (isNewConfig) {
      addConfig(config);
      navigateToView(View.LIST);
    } else {
      updateConfig(config);
      navigateToView(View.DETAIL, config.id);
    }
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

    // Add MTU from individual config or settings
    const mtu = config.interface.mtu || settings.mtu;
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

      // Add persistent keepalive from individual peer or settings
      const persistentKeepalive = peer.persistentKeepalive !== undefined
        ? peer.persistentKeepalive
        : settings.persistentKeepalive;

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
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, '-').toLowerCase()}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle resetting all data with two-step confirmation
  const handleReset = () => {
    const configCount = configs.length;
    resetAllData();
    navigateToView(View.LIST);
  };

  return {
    configs,
    settings,
    handleBackup,
    handleSelectConfig,
    handleAddConfig,
    handleImportConfig,
    handleRestore,
    handleBackupImported,
    handleSettings,
    handleConfigImported,
    handleEditConfig,
    handleDeleteConfig,
    handleSaveConfig,
    handleExportConfig,
    handleReset,
    generateWireGuardConfig
  };
};
