import React, {useState} from 'react';
import {useConfig} from '../contexts/ConfigContext';
import {DEFAULT_SETTINGS, Settings, AmneziaWGSettings} from '../types/Settings';
import {
  validateIPv4CIDR,
  validateIPv6CIDR,
  validateMTU,
  validatePersistentKeepalive,
  validatePort
} from '../utils/common';

interface SettingsProps {
  onBack: () => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({onBack}) => {
  const {settings, updateSettings} = useConfig();
  const [formData, setFormData] = useState<Settings>({...DEFAULT_SETTINGS, ...settings});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateAmnezia = (amz?: AmneziaWGSettings) => {
    if (!amz || !amz.enabled) return undefined;
    const hVals = [amz.H1, amz.H2, amz.H3, amz.H4].filter(v => v !== undefined) as number[];
    // H uniqueness
    const errors: { [key: string]: string } = {};
    const set = new Set(hVals);
    if (hVals.length !== set.size) {
      errors['amneziaWG.Hx'] = 'H1-H4 must be unique';
    }
    const checkH = (key: keyof AmneziaWGSettings) => {
      const v = amz[key];
      if (v === undefined) return;
      if (v < 0 || v > 2147483647) errors[`amneziaWG.${key}`] = 'Value must be 0-2147483647';
    };
    ['H1','H2','H3','H4'].forEach(k=>checkH(k as keyof AmneziaWGSettings));
    if (amz.S1 !== undefined) {
      if (amz.S1 > 1132) errors['amneziaWG.S1'] = 'S1 must be ≤ 1132';
      if (amz.S1 <= 0) errors['amneziaWG.S1'] = 'S1 must be positive';
    }
    if (amz.S2 !== undefined) {
      if (amz.S2 > 1188) errors['amneziaWG.S2'] = 'S2 must be ≤ 1188';
      if (amz.S2 <= 0) errors['amneziaWG.S2'] = 'S2 must be positive';
    }
    if (amz.S1 !== undefined && amz.S2 !== undefined && (amz.S1 + 56 === amz.S2)) {
      errors['amneziaWG.S1S2'] = 'S1 + 56 must not equal S2';
    }
    const hexRegex = /^[0-9a-fA-F]*$/;
    ['I1','I2','I3','I4','I5'].forEach(k => {
      const v = (amz as any)[k];
      if (v && !hexRegex.test(v)) errors[`amneziaWG.${k}`] = 'Hex only';
    });
    if (amz.Jc !== undefined) {
      if (amz.Jc < 0 || amz.Jc > 128) errors['amneziaWG.Jc'] = 'Jc 0-128';
    }
    if (amz.Jmin !== undefined) {
      if (amz.Jmin >= 1280) errors['amneziaWG.Jmin'] = 'Jmin < 1280';
    }
    if (amz.Jmax !== undefined) {
      if (amz.Jmax > 1280) errors['amneziaWG.Jmax'] = 'Jmax ≤ 1280';
    }
    if (amz.Jmin !== undefined && amz.Jmax !== undefined) {
      if (!(amz.Jmax > amz.Jmin)) errors['amneziaWG.JminJmax'] = 'Jmax must be > Jmin';
    }
    return errors;
  };

  const validateForm = (): boolean => {
    let newErrors: { [key: string]: string } = {};

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

    newErrors = {
      ...newErrors,
      ...validateAmnezia(formData.amneziaWG)
    };

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

  const handleAmzNumberChange = (field: keyof AmneziaWGSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      amneziaWG: {
        ...prev.amneziaWG,
        [field]: value === '' ? undefined : parseInt(value,10)
      }
    }));
  };

  const handleAmzStringChange = (field: keyof AmneziaWGSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      amneziaWG: {
        ...prev.amneziaWG,
        [field]: value === '' ? undefined : value
      }
    }));
  };

  const toggleAmnezia = () => {
    setFormData(prev => ({
      ...prev,
      amneziaWG: {
        ...(prev.amneziaWG || DEFAULT_SETTINGS.amneziaWG),
        enabled: !(prev.amneziaWG && prev.amneziaWG.enabled)
      }
    }));
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
                  placeholder="15"
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

            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">AmneziaWG</h4>
                <button type="button" onClick={toggleAmnezia} className="text-sm text-indigo-600 hover:underline">
                  {formData.amneziaWG?.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Protocol imitation parameters. All parameters must match between client and server except Jc, Jmin, Jmax (may vary).</p>
              {formData.amneziaWG?.enabled && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['H1','H2','H3','H4'].map(h => (
                    <div key={h}>
                      <label className="block text-sm font-medium text-gray-700">{h}</label>
                      <input type="number" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={(formData.amneziaWG as any)[h] || ''} onChange={e=>handleAmzNumberChange(h as any, e.target.value)} placeholder="e.g. 5" />
                      {errors[`amneziaWG.${h}`] && <p className="mt-1 text-xs text-red-600">{errors[`amneziaWG.${h}`]}</p>}
                    </div>
                  ))}
                  {errors['amneziaWG.Hx'] && <p className="col-span-full text-xs text-red-600">{errors['amneziaWG.Hx']}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">S1</label>
                    <input type="number" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={formData.amneziaWG?.S1 || ''} onChange={e=>handleAmzNumberChange('S1', e.target.value)} placeholder="≤1132" />
                    {errors['amneziaWG.S1'] && <p className="mt-1 text-xs text-red-600">{errors['amneziaWG.S1']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">S2</label>
                    <input type="number" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={formData.amneziaWG?.S2 || ''} onChange={e=>handleAmzNumberChange('S2', e.target.value)} placeholder="≤1188" />
                    {errors['amneziaWG.S2'] && <p className="mt-1 text-xs text-red-600">{errors['amneziaWG.S2']}</p>}
                  </div>
                  {errors['amneziaWG.S1S2'] && <p className="col-span-full text-xs text-red-600">{errors['amneziaWG.S1S2']}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jc</label>
                    <input type="number" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={formData.amneziaWG?.Jc || ''} onChange={e=>handleAmzNumberChange('Jc', e.target.value)} placeholder="4-12" />
                    {errors['amneziaWG.Jc'] && <p className="mt-1 text-xs text-red-600">{errors['amneziaWG.Jc']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jmin</label>
                    <input type="number" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={formData.amneziaWG?.Jmin || ''} onChange={e=>handleAmzNumberChange('Jmin', e.target.value)} placeholder="8" />
                    {errors['amneziaWG.Jmin'] && <p className="mt-1 text-xs text-red-600">{errors['amneziaWG.Jmin']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jmax</label>
                    <input type="number" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={formData.amneziaWG?.Jmax || ''} onChange={e=>handleAmzNumberChange('Jmax', e.target.value)} placeholder="80" />
                    {errors['amneziaWG.Jmax'] && <p className="mt-1 text-xs text-red-600">{errors['amneziaWG.Jmax']}</p>}
                  </div>
                  {(errors['amneziaWG.JminJmax']) && <p className="col-span-full text-xs text-red-600">{errors['amneziaWG.JminJmax']}</p>}
                  {['I1','I2','I3','I4','I5'].map(i => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700">{i} (hex)</label>
                      <input type="text" className="shadow-sm border-b focus:outline-none focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none" value={(formData.amneziaWG as any)[i] || ''} onChange={e=>handleAmzStringChange(i as any, e.target.value)} placeholder="optional" />
                      {errors[`amneziaWG.${i}`] && <p className="mt-1 text-xs text-red-600">{errors[`amneziaWG.${i}`]}</p>}
                    </div>
                  ))}
                </div>
              )}
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
