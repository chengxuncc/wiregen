import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WireGuardConfig } from '../types/WireGuardConfig';

interface ConfigContextType {
  configs: WireGuardConfig[];
  addConfig: (config: WireGuardConfig) => void;
  updateConfig: (config: WireGuardConfig) => void;
  deleteConfig: (id: string) => void;
  getConfig: (id: string) => WireGuardConfig | undefined;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [configs, setConfigs] = useState<WireGuardConfig[]>([]);

  // Load configs from localStorage on initial render
  useEffect(() => {
    const savedConfigs = localStorage.getItem('wireguardConfigs');
    if (savedConfigs) {
      try {
        // Parse the JSON string and convert date strings back to Date objects
        const parsedConfigs = JSON.parse(savedConfigs, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        });
        setConfigs(parsedConfigs);
      } catch (error) {
        console.error('Failed to parse saved configs:', error);
      }
    }
  }, []);

  // Save configs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wireguardConfigs', JSON.stringify(configs));
  }, [configs]);

  const addConfig = (config: WireGuardConfig) => {
    setConfigs(prev => [...prev, config]);
  };

  const updateConfig = (config: WireGuardConfig) => {
    setConfigs(prev => prev.map(c => c.id === config.id ? config : c));
  };

  const deleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(c => c.id !== id));
  };

  const getConfig = (id: string) => {
    return configs.find(c => c.id === id);
  };

  return (
    <ConfigContext.Provider value={{ configs, addConfig, updateConfig, deleteConfig, getConfig }}>
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