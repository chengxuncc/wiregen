import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Settings, DEFAULT_SETTINGS } from '../types/Settings';
import { validateIPv4CIDR, validateIPv6CIDR } from '../utils/validation';

interface SettingsProps {
  onBack: () => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSettings } = useConfig();
  const [formData, setFormData] = useState<Settings>(settings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.mtu !== undefined) {
      if (formData.mtu < 576 || formData.mtu > 1500) {
        newErrors.mtu = 'MTU must be between 576 and 1500';
      }
    }

    if (formData.defaultPersistentKeepalive !== undefined) {
      if (formData.defaultPersistentKeepalive < 0 || formData.defaultPersistentKeepalive > 65535) {
        newErrors.defaultPersistentKeepalive = 'Persistent Keepalive must be between 0 and 65535 seconds';
      }
    }

    if (formData.defaultIPv4CIDR) {
      const ipv4Errors = validateIPv4CIDR(formData.defaultIPv4CIDR);
      if (ipv4Errors.length > 0) {
        newErrors.defaultIPv4CIDR = ipv4Errors[0];
      }
    }

    if (formData.defaultIPv6CIDR) {
      const ipv6Errors = validateIPv6CIDR(formData.defaultIPv6CIDR);
      if (ipv6Errors.length > 0) {
        newErrors.defaultIPv6CIDR = ipv6Errors[0];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateSettings(formData);
      onBack();
    }
  };

  const handleInputChange = (field: keyof Settings, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleStringInputChange = (field: keyof Settings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleUseDefault = (field: keyof Settings) => {
    const defaultValue = DEFAULT_SETTINGS[field];
    setFormData(prev => ({
      ...prev,
      [field]: defaultValue
    }));
  };

  const handleUseAllDefaults = () => {
    setFormData({ ...DEFAULT_SETTINGS });
    setErrors({});
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Settings</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Configure default settings that apply to all WireGuard configurations.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="mtu" className="block text-sm font-medium text-gray-700">
                MTU (Maximum Transmission Unit)
              </label>
              <div className="mt-1 flex">
                <input
                  type="number"
                  id="mtu"
                  min="576"
                  max="1500"
                  value={formData.mtu || ''}
                  onChange={(e) => handleInputChange('mtu', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="1380 (default)"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('mtu')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>
              {errors.mtu && (
                <p className="mt-2 text-sm text-red-600">{errors.mtu}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to use default 1380.
              </p>
            </div>

            <div>
              <label htmlFor="defaultIPv4CIDR" className="block text-sm font-medium text-gray-700">
                Default IPv4 CIDR
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="defaultIPv4CIDR"
                  value={formData.defaultIPv4CIDR || ''}
                  onChange={(e) => handleStringInputChange('defaultIPv4CIDR', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="10.0.0.0/24"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('defaultIPv4CIDR')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>
              {errors.defaultIPv4CIDR && (
                <p className="mt-2 text-sm text-red-600">{errors.defaultIPv4CIDR}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Default IPv4 network range for new configurations. Common values: 10.0.0.0/24, 192.168.1.0/24
              </p>
            </div>

            <div>
              <label htmlFor="defaultIPv6CIDR" className="block text-sm font-medium text-gray-700">
                Default IPv6 CIDR
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="defaultIPv6CIDR"
                  value={formData.defaultIPv6CIDR || ''}
                  onChange={(e) => handleStringInputChange('defaultIPv6CIDR', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="fd00::/64"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('defaultIPv6CIDR')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>
              {errors.defaultIPv6CIDR && (
                <p className="mt-2 text-sm text-red-600">{errors.defaultIPv6CIDR}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Default IPv6 network range for new configurations. Use ULA range (fd00::/8) for private networks.
              </p>
            </div>
            <div>
              <label htmlFor="defaultPersistentKeepalive" className="block text-sm font-medium text-gray-700">
                Default Persistent Keepalive (seconds)
              </label>
              <div className="mt-1 flex">
                <input
                  type="number"
                  id="defaultPersistentKeepalive"
                  min="0"
                  max="65535"
                  value={formData.defaultPersistentKeepalive || ''}
                  onChange={(e) => handleInputChange('defaultPersistentKeepalive', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="25 (default)"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('defaultPersistentKeepalive')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              </div>
              {errors.defaultPersistentKeepalive && (
                <p className="mt-2 text-sm text-red-600">{errors.defaultPersistentKeepalive}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Default keepalive interval for new peer configurations. Set to 0 to disable.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUseAllDefaults}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Use All Defaults
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsComponent;