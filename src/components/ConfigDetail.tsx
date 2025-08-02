import React, {useEffect, useState} from 'react';
import {PeerConfig, WireGuardConfig} from '../types/WireGuardConfig';
import {DEFAULT_SETTINGS, Settings} from '../types/Settings';
import {v4 as uuidv4} from 'uuid';
import QRCode from 'qrcode';
import {useConfig} from '../contexts/ConfigContext';
import {generatePrivateKey, getPublicKey} from '../utils/wireguard';
import {
  validateCIDR,
  validateEndpoint,
  validateIPAddress,
  validatePort,
  validatePresharedKey,
  validatePrivateKey,
  validatePublicKey,
} from '../utils/validation';

interface ConfigDetailProps {
  config?: WireGuardConfig;
  settings: Settings;
  onSave: (config: WireGuardConfig) => void;
  onDelete?: () => void;
  onBack: () => void;
  onCancel?: () => void;
}

interface EditableFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  errorMessage?: string;
  className?: string;
}

const EditableField = ({
                         label,
                         value,
                         onChange,
                         type = 'text',
                         placeholder = '',
                         errorMessage,
                         className = ''
                       }: EditableFieldProps) => (
  <div>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <input
      type={type}
      value={value?.toString() || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={
        `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ` +
        (className ? className + ' ' : '') +
        (errorMessage
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500')
      }
    />
    {errorMessage && (
      <div className="text-xs text-red-600 mt-1">{errorMessage}</div>
    )}
  </div>
);

const EditableTextAreaField = ({label, value, onChange, placeholder = '', className = ''}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className={className}>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[64px] resize-y"
      rows={3}
    />
  </div>
);

const EditableArrayField = ({label, values, onChange, placeholder = 'Add new item', errorMessages = [], buttons}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  errorMessages?: (string | undefined)[];
  buttons?: React.ReactNode[];
}) => (
  <div>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="relative flex items-center">
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const newValues = [...values];
                newValues[index] = e.target.value;
                onChange(newValues);
              }}
              placeholder={placeholder}
              className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 pr-8 ${errorMessages[index] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
            />
            <button
              onClick={() => {
                const newValues = values.filter((_, i) => i !== index);
                onChange(newValues);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 focus:outline-none flex-shrink-0"
              type="button"
              tabIndex={-1}
              aria-label="Remove"
              style={{padding: 0, background: 'none', border: 'none'}}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          {errorMessages[index] && (
            <div className="text-xs text-red-600 mt-1">{errorMessages[index]}</div>
          )}
        </div>
      ))}
      <div className="flex gap-4">
        <button
          onClick={() => onChange([...values, ''])}
          className="text-indigo-600 hover:text-indigo-700 text-sm"
        >
          Add {label}
        </button>
        {buttons}
      </div>
    </div>
  </div>
);


const ConfigDetail: React.FC<ConfigDetailProps> = ({config, settings, onSave, onDelete, onBack, onCancel}) => {
  const configContext = useConfig();
  // Create empty config for new configurations
  const createEmptyConfig = (): WireGuardConfig => ({
    id: uuidv4(),
    name: 'New Configuration',
    interface: {
      privateKey: generatePrivateKey(), // Generate private key by default
      address: [],
      listenPort: settings.listenPort ? settings.listenPort : DEFAULT_SETTINGS.listenPort,
      dns: [],
    },
    peers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [editedConfig, setEditedConfig] = useState<WireGuardConfig>(config || createEmptyConfig());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [publicKey, setPublicKey] = useState('');
  const isNewConfig = !config;

  // Update edited config when prop changes
  useEffect(() => {
    if (config) {
      setEditedConfig(config);
    }
  }, [config]);

  // Generate QR code when config changes
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const configText = generateWireGuardConfig();
        const qrUrl = await QRCode.toDataURL(configText, {
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrCodeUrl('');
      }
    };

    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedConfig, settings]);

  useEffect(() => {
    if (editedConfig.interface.privateKey) {
      setPublicKey(getPublicKey(editedConfig.interface.privateKey));
    } else {
      setPublicKey('');
    }
  }, [editedConfig.interface.privateKey]);

  // Validation state
  const privateKeyError = validatePrivateKey(editedConfig.interface.privateKey);
  const endpointError = validateEndpoint(editedConfig.interface.endpoint || '');
  const portError = validatePort(editedConfig.interface.listenPort);
  const addressErrors = editedConfig.interface.address?.map(validateCIDR);
  const dnsErrors = editedConfig.interface.dns?.map(validateIPAddress);

  // Save button enabled only if all required fields are valid
  const isFormValid =
    !privateKeyError &&
    !endpointError &&
    !portError &&
    addressErrors.every(e => !e) &&
    dnsErrors.every(e => !e) &&
    editedConfig.peers.every(peer =>
      !validatePublicKey(peer.publicKey) &&
      (peer.allowedIPs || []).every(ip => !validateCIDR(ip)) &&
      !validateEndpoint(peer.endpoint) &&
      !validatePresharedKey(peer.presharedKey)
    );

  const handleSave = () => {
    if (!isFormValid) return;
    setIsSaving(true);
    // Update the timestamp when saving
    const configToSave = {
      ...editedConfig,
      updatedAt: new Date()
    };
    // Reset saving state after a brief delay for visual feedback
    setTimeout(() => {
      onSave(configToSave);
      setIsSaving(false);
    }, 500);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onBack();
    }
  };

  const updateConfig = (updates: Partial<WireGuardConfig>) => {
    setEditedConfig(prev => ({
      ...prev,
      ...updates
    }));
  };

  const updateInterface = (updates: Partial<WireGuardConfig['interface']>) => {
    setEditedConfig(prev => ({
      ...prev,
      interface: {
        ...prev.interface,
        ...updates
      }
    }));
  };

  const updatePeer = (index: number, updates: Partial<WireGuardConfig['peers'][0]>) => {
    setEditedConfig(prev => ({
      ...prev,
      peers: prev.peers.map((peer, i) =>
        i === index ? {...peer, ...updates} : peer
      )
    }));
  };

  const addPeer = () => {
    const newPeer = {
      publicKey: '',
      allowedIPs: [],
      endpoint: '',
      presharedKey: '',
      persistentKeepalive: settings.persistentKeepalive,
    };
    setEditedConfig(prev => ({
      ...prev,
      peers: [...prev.peers, newPeer]
    }));
  };

  // Add peer as another config
  const addPeerFromConfig = (configId: string) => {
    const peerConfig = configContext.configs[configId];
    if (!peerConfig) return;
    // Map allowedIPs to /32 for IPv4 and /128 for IPv6
    const mappedAllowedIPs = (peerConfig.interface.address || []).map(addr => {
      if (addr.includes('.')) {
        // IPv4
        return addr.replace(/\/(\d+)$/, '/32');
      } else if (addr.includes(':')) {
        // IPv6
        return addr.replace(/\/(\d+)$/, '/128');
      }
      return addr;
    });
    const newPeer: PeerConfig = {
      publicKey: getPublicKey(peerConfig.interface.privateKey),
      allowedIPs: mappedAllowedIPs,
      endpoint: peerConfig.interface.endpoint,
      presharedKey: '',
      persistentKeepalive: settings.persistentKeepalive,
      configId: peerConfig.id
    };
    setEditedConfig(prev => ({
      ...prev,
      peers: [...prev.peers, newPeer]
    }));
  };

  const removePeer = (index: number) => {
    setEditedConfig(prev => ({
      ...prev,
      peers: prev.peers.filter((_, i) => i !== index)
    }));
  };

  const updatePeerAllowedIPs = (index: number, allowedIPs: string[]) => {
    updatePeer(index, {allowedIPs});
  };

  const updateInterfaceAddresses = (addresses: string[]) => {
    updateInterface({address: addresses});
  };

  const updateInterfaceDNS = (dns: string[]) => {
    updateInterface({dns});
  };

  // Generate WireGuard config text - memoized to prevent re-computation on every render
  const generateWireGuardConfig = (): string => {
    let content = '[Interface]\n';
    content += `PrivateKey = ${editedConfig.interface.privateKey}\n`;
    content += `# PublicKey = ${publicKey}\n`;
    if (editedConfig.interface.address && editedConfig.interface.address.length > 0) {
      content += `Address = ${editedConfig.interface.address.join(', ')}\n`;
    }

    if (editedConfig.interface.listenPort) {
      content += `ListenPort = ${editedConfig.interface.listenPort}\n`;
    }

    if (editedConfig.interface.dns && editedConfig.interface.dns.length > 0) {
      content += `DNS = ${editedConfig.interface.dns.join(', ')}\n`;
    }

    // Remove interface MTU from config text, use only settings.mtu
    const mtu = settings.mtu;
    if (mtu) {
      content += `MTU = ${mtu}\n`;
    }

    editedConfig.peers.forEach(peer => {
      content += '\n[Peer]\n';
      content += `PublicKey = ${peer.publicKey}\n`;
      if (peer.allowedIPs && peer.allowedIPs.length > 0) {
        content += `AllowedIPs = ${peer.allowedIPs.join(', ')}\n`;
      }

      if (peer.endpoint) {
        content += `Endpoint = ${peer.endpoint}\n`;
      }

      if (peer.persistentKeepalive !== undefined && peer.persistentKeepalive > 0) {
        content += `PersistentKeepalive = ${peer.persistentKeepalive}\n`;
      }

      if (peer.presharedKey) {
        content += `PresharedKey = ${peer.presharedKey}\n`;
      }
    });

    if (editedConfig.interface.postUp) {
      content += `PostUp = ${editedConfig.interface.postUp.replace(/\r?\n/g, '; ')}\n`;
    }
    if (editedConfig.interface.postDown) {
      content += `PostDown = ${editedConfig.interface.postDown.replace(/\r?\n/g, '; ')}\n`;
    }

    return content;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <input
                type="text"
                value={editedConfig.name}
                onChange={(e) => updateConfig({name: e.target.value})}
                className="text-lg font-medium text-gray-900 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Created: {editedConfig.createdAt.toLocaleString()} |
                Last updated: {editedConfig.updatedAt.toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isNewConfig ? 'Cancel' : 'Back'}
              </button>
              {!isNewConfig && onDelete && (
                showDeleteConfirm ? (
                  <button
                    onClick={handleDeleteConfirm}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Confirm Delete
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteClick}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || !isFormValid}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  isSaving
                    ? 'bg-green-600 cursor-not-allowed'
                    : !isFormValid
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                }`}
              >
                {isSaving ? (
                  isNewConfig ? 'Created' : 'Saved'
                ) : (
                  isNewConfig ? 'Create' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Interface Section */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Interface</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative">
              <EditableField
                label="Private Key"
                value={editedConfig.interface.privateKey}
                onChange={(value) => updateInterface({privateKey: value})}
                placeholder="Enter private key"
                errorMessage={privateKeyError}
              />
              <button
                type="button"
                onClick={() => updateInterface({privateKey: generatePrivateKey()})}
                className="absolute top-6 right-2 p-1 text-gray-400 hover:text-indigo-600"
                title="Generate new private key"
                style={{background: 'none', border: 'none'}}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 2v6h-6"/>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                  <path d="M3 22v-6h6"/>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
              </button>
            </div>
            <div className="sm:grid-cols-2">
              <div className="text-xs text-gray-500 mb-1">Public Key</div>
              <input
                type="text"
                value={publicKey}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700"
                placeholder="Public key will be generated from private key"
              />
            </div>
            <EditableField
              label="Endpoint"
              value={editedConfig.interface.endpoint || ''}
              onChange={(value) => updateInterface({endpoint: value || undefined})}
              placeholder="e.g., vpn.example.com:51820"
              errorMessage={endpointError}
            />
            <EditableField
              label="Listen Port"
              value={editedConfig.interface.listenPort || ''}
              onChange={(value) => updateInterface({listenPort: value ? parseInt(value) : undefined})}
              type="number"
              placeholder={settings.listenPort ? settings.listenPort.toString() : DEFAULT_SETTINGS.listenPort!.toString()}
              errorMessage={portError}
            />
            <div className="sm:col-span-2">
              <EditableArrayField
                label="Addresses"
                values={editedConfig.interface.address || []}
                onChange={updateInterfaceAddresses}
                placeholder="e.g., 10.0.0.1/24"
                // Pass validation errors for each address
                errorMessages={addressErrors}
                buttons={[
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                    onClick={() => {
                      // Generate next IPv4 address
                      const subnet = settings.IPv4CIDR || settings.IPv4CIDR || '10.0.0.0/24';
                      const [base, mask] = subnet.split('/');
                      const baseParts = base.split('.').map(Number);
                      // Collect all used IPv4 addresses from all configs
                      const allConfigs = Object.values(configContext.configs);
                      let used = allConfigs.flatMap(cfg => (cfg.interface.address || [])
                        .filter(a => a.includes('.') && a.endsWith('/' + mask))
                        .map(a => Number(a.split('/')[0].split('.').slice(-1)[0]))
                      );
                      // Also include current editedConfig
                      used = used.concat((editedConfig.interface.address || [])
                        .filter(a => a.includes('.') && a.endsWith('/' + mask))
                        .map(a => Number(a.split('/')[0].split('.').slice(-1)[0])));
                      let next = 1;
                      while (used.includes(next) && next < 255) next++;
                      if (next < 255) {
                        const addr = `${baseParts[0]}.${baseParts[1]}.${baseParts[2]}.${next}/${mask}`;
                        updateInterfaceAddresses([...(editedConfig.interface.address || []), addr]);
                      }
                    }}
                  >
                    Add Network IPv4 Address
                  </button>,
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                    onClick={() => {
                      // Generate next IPv6 address
                      const subnet = settings.IPv6CIDR || settings.IPv6CIDR || 'fd00::/64';
                      const [base, mask] = subnet.split('/');
                      // Collect all used IPv6 addresses from all configs
                      const allConfigs = Object.values(configContext.configs);
                      let used = allConfigs.flatMap(cfg => (cfg.interface.address || [])
                        .filter(a => a.includes(':') && a.endsWith('/' + mask))
                        .map(a => parseInt(a.split('/')[0].split(':').slice(-1)[0], 16))
                      );
                      // Also include current editedConfig
                      used = used.concat((editedConfig.interface.address || [])
                        .filter(a => a.includes(':') && a.endsWith('/' + mask))
                        .map(a => parseInt(a.split('/')[0].split(':').slice(-1)[0], 16)));
                      let next = 1;
                      while (used.includes(next) && next < 65535) next++;
                      if (next < 65535) {
                        const addr = `${base}${base.endsWith(':') ? '' : ':'}${next.toString(16)}/${mask}`;
                        updateInterfaceAddresses([...(editedConfig.interface.address || []), addr]);
                      }
                    }}
                  >
                    Add Network IPv6 Address
                  </button>
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <EditableArrayField
                label="DNS Servers"
                values={editedConfig.interface.dns || []}
                onChange={updateInterfaceDNS}
                placeholder="e.g., 1.1.1.1, 2606:4700:4700::1111"
                errorMessages={dnsErrors}
              />
            </div>
            <EditableTextAreaField
              label="PostUp Script"
              value={editedConfig.interface.postUp || ''}
              onChange={(value) => updateInterface({postUp: value || undefined})}
              placeholder="e.g., iptables ..."
              className="sm:col-span-2"
            />
            <EditableTextAreaField
              label="PostDown Script"
              value={editedConfig.interface.postDown || ''}
              onChange={(value) => updateInterface({postDown: value || undefined})}
              placeholder="e.g., iptables ..."
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* Peers Section */}
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Peers ({editedConfig.peers.length})
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={addPeer}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Add Peer Manually
              </button>
              <select
                className="text-sm border border-gray-300 rounded px-2 py-1"
                defaultValue=""
                onChange={e => {
                  if (e.target.value) {
                    addPeerFromConfig(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Add Peer From Other</option>
                {
                  Object.values(configContext.configs).filter(c => c.id !== editedConfig.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                }
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {editedConfig.peers.map((peer, i) => {
              const peerPublicKeyError = validatePublicKey(peer.publicKey);
              const peerEndpointError = validateEndpoint(peer.endpoint);
              const peerAllowedIpErrors = (peer.allowedIPs || []).map(validateCIDR);
              const peerPresharedKeyError = validatePresharedKey(peer.presharedKey);
              return (
                <div key={i} className="border rounded p-3 mb-2 bg-gray-50 relative">
                  <div className="flex items-center justify-between mb-1">
                    {peer.configId ? (
                      <span
                        className="text-xs text-indigo-700">Peer from config: {configContext.configs[peer.configId]?.name || peer.configId}</span>
                    ) : <span className="text-xs font-semibold">Peer {i + 1}</span>}
                    <button
                      onClick={() => removePeer(i)}
                      className="ml-2 text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded transition-colors duration-150"
                    >
                      Remove
                    </button>
                  </div>
                  <EditableField
                    label="Public Key"
                    value={peer.publicKey}
                    onChange={val => updatePeer(i, {publicKey: val})}
                    errorMessage={peerPublicKeyError}
                  />
                  <EditableArrayField
                    label="Allowed IPs"
                    values={peer.allowedIPs || []}
                    onChange={allowedIPs => updatePeerAllowedIPs(i, allowedIPs)}
                    placeholder="e.g., 10.0.0.2/32"
                    errorMessages={peerAllowedIpErrors}
                  />
                  <EditableField
                    label="Endpoint"
                    value={peer.endpoint || ''}
                    onChange={val => updatePeer(i, {endpoint: val})}
                    errorMessage={peerEndpointError}
                  />
                  <EditableField
                    label="Preshared Key"
                    value={peer.presharedKey || ''}
                    onChange={val => updatePeer(i, {presharedKey: val})}
                    errorMessage={peerPresharedKeyError}
                  />
                  <EditableField
                    label="Persistent Keepalive"
                    value={peer.persistentKeepalive?.toString() || ''}
                    onChange={val => updatePeer(i, {persistentKeepalive: val ? parseInt(val) : undefined})}
                    type="number"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Config Textarea */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Generated Configuration</h4>
        </div>
        <div className="px-6 py-4 space-y-6">
          {/* Configuration Text */}
          <div>
            <textarea
              value={generateWireGuardConfig()}
              readOnly
              className="w-full h-64 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Configuration will be generated here..."
            />
          </div>

          {/* QR Code */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center space-y-3">
              <h5 className="text-sm font-medium text-gray-700">QR Code</h5>
              {qrCodeUrl ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="WireGuard Configuration QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-64 h-64 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Generating QR Code...</span>
                </div>
              )}
              <p className="text-xs text-gray-500 text-center max-w-48">
                Scan with your WireGuard mobile app to import this configuration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigDetail;
