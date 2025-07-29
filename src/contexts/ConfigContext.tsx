import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WireGuardConfig } from '../types/WireGuardConfig';
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../types/SystemSettings';

interface ConfigContextType {
  configs: WireGuardConfig[];
  addConfig: (config: WireGuardConfig) => void;
  updateConfig: (config: WireGuardConfig) => void;
  deleteConfig: (id: string) => void;
  replaceAllConfigs: (configs: WireGuardConfig[]) => void;
  getConfig: (id: string) => WireGuardConfig | undefined;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: SystemSettings) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [configs, setConfigs] = useState<WireGuardConfig[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if localStorage is available
  const isLocalStorageAvailable = (): boolean => {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  };

  // Load configs and system settings from localStorage on initial render
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Configurations will not persist.');
      setIsInitialized(true);
      return;
    }

    try {
      const savedConfigs = localStorage.getItem('wireguardConfigs');
      if (savedConfigs) {
        // Parse the JSON string and convert date strings back to Date objects
        const parsedConfigs = JSON.parse(savedConfigs, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        });
        setConfigs(parsedConfigs);
      }

      const savedSystemSettings = localStorage.getItem('wireguardSystemSettings');
      if (savedSystemSettings) {
        const parsedSettings = JSON.parse(savedSystemSettings);
        setSystemSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load saved configs or system settings:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save configs to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isInitialized || !isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem('wireguardConfigs', JSON.stringify(configs));
    } catch (error) {
      console.error('Failed to save configs to localStorage:', error);
      // You could add user notification here if needed
    }
  }, [configs, isInitialized]);

  // Save system settings to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isInitialized || !isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem('wireguardSystemSettings', JSON.stringify(systemSettings));
    } catch (error) {
      console.error('Failed to save system settings to localStorage:', error);
    }
  }, [systemSettings, isInitialized]);

  const addConfig = (config: WireGuardConfig) => {
    setConfigs(prev => [...prev, config]);
  };

  const updateConfig = (config: WireGuardConfig) => {
    setConfigs(prev => prev.map(c => c.id === config.id ? config : c));
  };

  const deleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(c => c.id !== id));
  };

  const replaceAllConfigs = (configs: WireGuardConfig[]) => {
    setConfigs(configs);
  };

  const getConfig = (id: string) => {
    return configs.find(c => c.id === id);
  };

  const updateSystemSettings = (settings: SystemSettings) => {
    setSystemSettings(settings);
  };

  return (
    <ConfigContext.Provider value={{ 
      configs, 
      addConfig, 
      updateConfig, 
      deleteConfig, 
      replaceAllConfigs,
      getConfig, 
      systemSettings, 
      updateSystemSettings 
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};