import {useConfig} from '../contexts/ConfigContext';
import {WireGuardConfig} from '../types/WireGuardConfig';
import {Settings} from '../types/Settings';
import {View} from './useNavigation';
import {generateWireGuardConfig} from "../utils/wireguard";

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
    if (Object.keys(configs).length === 0 && !settings) {
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
  const handleBackupImported = (configs: { [id: string]: WireGuardConfig }, settings: Settings) => {
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
    const isNewConfig = !config.id || !configs[config.id];

    if (isNewConfig) {
      addConfig(config);
      navigateToView(View.LIST);
    } else {
      updateConfig(config);
      navigateToView(View.DETAIL, config.id);
    }
  };

  // Handle exporting a config
  const handleExportConfig = (config: WireGuardConfig) => {
    // Create WireGuard config file content
    const content = generateWireGuardConfig(settings, config);

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
    handleReset
  };
};
