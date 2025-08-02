import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WireGuardConfig } from '../types/WireGuardConfig';
import { Settings, DEFAULT_SETTINGS } from '../types/Settings';

interface ConfigContextType {
  configs: { [id: string]: WireGuardConfig };
  addConfig: (config: WireGuardConfig) => void;
  updateConfig: (config: WireGuardConfig) => void;
  deleteConfig: (id: string) => void;
  replaceAllConfigs: (configs: { [id: string]: WireGuardConfig }) => void;
  getConfig: (id: string) => WireGuardConfig | undefined;
  settings: Settings;
  updateSettings: (settings: Settings) => void;
  resetAllData: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [configs, setConfigs] = useState<{ [id: string]: WireGuardConfig }>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
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

  // Load configs and settings from localStorage on initial render
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Configurations will not persist.');
      setIsInitialized(true);
      return;
    }

    try {
      const savedConfigs = localStorage.getItem('wiregen.configs');
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

      const savedSettings = localStorage.getItem('wiregen.settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load saved configs or settings:', error);
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
      localStorage.setItem('wiregen.configs', JSON.stringify(configs));
    } catch (error) {
      console.error('Failed to save configs to localStorage:', error);
      // You could add user notification here if needed
    }
  }, [configs, isInitialized]);

  // Save settings to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isInitialized || !isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem('wiregen.settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings, isInitialized]);

  const addConfig = (config: WireGuardConfig) => {
    setConfigs(prev => ({ ...prev, [config.id]: config }));
  };

  const updateConfig = (config: WireGuardConfig) => {
    setConfigs(prev => ({ ...prev, [config.id]: config }));
  };

  const deleteConfig = (id: string) => {
    setConfigs(prev => {
      const newConfigs = { ...prev };
      delete newConfigs[id];
      return newConfigs;
    });
  };

  const replaceAllConfigs = (configs: { [id: string]: WireGuardConfig }) => {
    setConfigs(configs);
  };

  const getConfig = (id: string) => {
    return configs[id];
  };

  const updateSettings = (settings: Settings) => {
    setSettings(settings);
  };

  const resetAllData = () => {
    setConfigs({});
    setSettings(DEFAULT_SETTINGS);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('wiregen.configs');
      localStorage.removeItem('wiregen.settings');
    }
  };

  return (
    <ConfigContext.Provider value={{ 
      configs, 
      addConfig, 
      updateConfig, 
      deleteConfig, 
      replaceAllConfigs,
      getConfig,
      settings,
      updateSettings,
      resetAllData
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