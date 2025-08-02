import React, {useState} from 'react';
import {useConfig} from '../contexts/ConfigContext';
import {DEFAULT_SETTINGS, Settings} from '../types/Settings';
import {
  validateIPv4CIDR,
  validateIPv6CIDR,
  validateMTU,
  validatePersistentKeepalive,
  validatePort
} from '../utils/validation';

interface SettingsProps {
  onBack: () => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({onBack}) => {
  const {settings, updateSettings} = useConfig();
  const [formData, setFormData] = useState<Settings>(settings);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.mtu !== undefined) {
      const mtuError = validateMTU(formData.mtu);
      if (mtuError) {
        newErrors.mtu = mtuError;
      }
    }

    if (formData.persistentKeepalive !== undefined) {
      const keepaliveError = validatePersistentKeepalive(formData.persistentKeepalive);
      if (keepaliveError) {
        newErrors.persistentKeepalive = keepaliveError;
      }
    }

    if (formData.listenPort !== undefined) {
      const portError = validatePort(formData.listenPort);
      if (portError) {
        newErrors.listenPort = portError;
      }
    }

    if (formData.IPv4CIDR) {
      const ipv4Error = validateIPv4CIDR(formData.IPv4CIDR);
      if (ipv4Error) {
        newErrors.IPv4CIDR = ipv4Error;
      }
    }

    if (formData.IPv6CIDR) {
      const ipv6Error = validateIPv6CIDR(formData.IPv6CIDR);
      if (ipv6Error) {
        newErrors.IPv6CIDR = ipv6Error;
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
    setFormData({...DEFAULT_SETTINGS});
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
              <label htmlFor="IPv4CIDR" className="block text-sm font-medium text-gray-700">
                IPv4 CIDR
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="IPv4CIDR"
                  value={formData.IPv4CIDR || ''}
                  onChange={(e) => handleStringInputChange('IPv4CIDR', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="10.0.0.0/24"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('IPv4CIDR')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                </button>
              </div>
              {errors.IPv4CIDR && (
                <p className="mt-2 text-sm text-red-600">{errors.IPv4CIDR}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Default IPv4 network range for new configurations. Common values: 10.0.0.0/24, 192.168.1.0/24
              </p>
            </div>

            <div>
              <label htmlFor="IPv6CIDR" className="block text-sm font-medium text-gray-700">
                IPv6 CIDR
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  id="IPv6CIDR"
                  value={formData.IPv6CIDR || ''}
                  onChange={(e) => handleStringInputChange('IPv6CIDR', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="fd00::/64"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('IPv6CIDR')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                </button>
              </div>
              {errors.IPv6CIDR && (
                <p className="mt-2 text-sm text-red-600">{errors.IPv6CIDR}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Default IPv6 network range for new configurations. Use ULA range (fd00::/8) for private networks.
              </p>
            </div>

            <div>
              <label htmlFor="listenPort" className="block text-sm font-medium text-gray-700">
                Listen Port
              </label>
              <div className="mt-1 flex">
                <input
                  type="number"
                  id="listenPort"
                  min="1"
                  max="65535"
                  value={formData.listenPort || ''}
                  onChange={(e) => handleInputChange('listenPort', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="51821"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('listenPort')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                </button>
              </div>
              {errors.listenPort && (
                <p className="mt-2 text-sm text-red-600">{errors.listenPort}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Default listen port for new server configurations. Common ports: 51820, 51821.
              </p>
            </div>

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
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
              <label htmlFor="persistentKeepalive" className="block text-sm font-medium text-gray-700">
                Persistent Keepalive (seconds)
              </label>
              <div className="mt-1 flex">
                <input
                  type="number"
                  id="persistentKeepalive"
                  min="0"
                  max="65535"
                  value={formData.persistentKeepalive || ''}
                  onChange={(e) => handleInputChange('persistentKeepalive', e.target.value)}
                  className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                  placeholder="25 (default)"
                />
                <button
                  type="button"
                  onClick={() => handleUseDefault('persistentKeepalive')}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                  title="Use default value"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                  </svg>
                </button>
              </div>
              {errors.persistentKeepalive && (
                <p className="mt-2 text-sm text-red-600">{errors.persistentKeepalive}</p>
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
            className="inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Use Defaults
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
