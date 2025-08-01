import React, {useEffect, useState} from 'react';
import {WireGuardConfig} from '../types/WireGuardConfig';
import {DEFAULT_SETTINGS, Settings} from '../types/Settings';
import {v4 as uuidv4} from 'uuid';
import QRCode from 'qrcode';
import {useConfig} from '../contexts/ConfigContext';
import { Buffer } from 'buffer';
import { webcrypto as crypto } from 'crypto';

interface ConfigDetailProps {
  config?: WireGuardConfig;
  settings: Settings;
  onSave: (config: WireGuardConfig) => void;
  onDelete?: () => void;
  onBack: () => void;
  onCancel?: () => void;
}

const EditableField = ({label, value, onChange, type = 'text', placeholder = '', className = ''}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) => (
  <div className={className}>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <input
      type={type}
      value={value?.toString() || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
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

const EditableArrayField = ({label, values, onChange, placeholder = 'Add new item'}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) => (
  <div>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const newValues = [...values];
              newValues[index] = e.target.value;
              onChange(newValues);
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={() => {
              const newValues = values.filter((_, i) => i !== index);
              onChange(newValues);
            }}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...values, ''])}
        className="text-indigo-600 hover:text-indigo-700 text-sm"
      >
        Add {label}
      </button>
    </div>
  </div>
);

function getWireGuardPublicKey(privateKeyBase64: string): Promise<string> {
  // WireGuard uses Curve25519, not Ed25519, but Node.js crypto supports X25519 for key agreement
  // and Ed25519 for signatures. For WireGuard, use X25519 keys.
  // The private key is a 32-byte base64 string.
  try {
    const privateKeyRaw = Buffer.from(privateKeyBase64, 'base64');
    if (privateKeyRaw.length !== 32) return Promise.resolve('');
    return crypto.subtle.importKey(
      'raw',
      privateKeyRaw,
      { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
      false,
      ['sign']
    ).then(privateKey =>
      crypto.subtle.exportKey('raw', privateKey)
    ).then(() =>
      crypto.subtle.importKey(
        'raw',
        privateKeyRaw,
        { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' },
        false,
        ['verify']
      )
    ).then(publicKey =>
      crypto.subtle.exportKey('raw', publicKey)
    ).then((publicKeyRaw: ArrayBuffer) =>
      Buffer.from(publicKeyRaw).toString('base64')
    ).catch(() => '')
  } catch {
    return Promise.resolve('');
  }
}

const ConfigDetail: React.FC<ConfigDetailProps> = ({config, settings, onSave, onDelete, onBack, onCancel}) => {
  const configContext = useConfig();
  const allConfigs = configContext.configs || [];
  // Create empty config for new configurations
  const createEmptyConfig = (): WireGuardConfig => ({
    id: uuidv4(),
    name: 'New Configuration',
    interface: {
      privateKey: '',
      address: [''],
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
      getWireGuardPublicKey(editedConfig.interface.privateKey).then(setPublicKey);
    } else {
      setPublicKey('');
    }
  }, [editedConfig.interface.privateKey]);

  const handleSave = () => {
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
      allowedIPs: [''],
      endpoint: '',
      presharedKey: '',
      persistentKeepalive: undefined
    };
    setEditedConfig(prev => ({
      ...prev,
      peers: [...prev.peers, newPeer]
    }));
  };

  // Add peer as another config
  const addPeerFromConfig = (configId: string) => {
    const peerConfig = allConfigs.find(c => c.id === configId);
    if (!peerConfig) return;
    const newPeer = {
      publicKey: peerConfig.interface.privateKey, // or peerConfig.publicKey if available
      allowedIPs: peerConfig.interface.address,
      endpoint: '',
      presharedKey: '',
      persistentKeepalive: undefined,
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
    content += editedConfig.interface.address.map(addr => `Address = ${addr}\n`).join('');

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
      content += peer.allowedIPs.map(ip => `AllowedIPs = ${ip}\n`).join('');

      if (peer.endpoint) {
        content += `Endpoint = ${peer.endpoint}\n`;
      }

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
                disabled={isSaving}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  isSaving
                    ? 'bg-green-600 cursor-not-allowed'
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
            <EditableField
              label="Private Key"
              value={editedConfig.interface.privateKey}
              onChange={(value) => updateInterface({privateKey: value})}
              placeholder="Enter private key"
            />
            <div className="sm:col-span-2">
              <div className="text-xs text-gray-500 mb-1">Public Key</div>
              <input
                type="text"
                value={publicKey}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                placeholder="Public key will be generated from private key"
              />
            </div>
            <EditableField
              label="Endpoint"
              value={editedConfig.interface.endpoint || ''}
              onChange={(value) => updateInterface({endpoint: value || undefined})}
              placeholder="e.g., vpn.example.com:51820"
            />
            <EditableField
              label="Listen Port"
              value={editedConfig.interface.listenPort || ''}
              onChange={(value) => updateInterface({listenPort: value ? parseInt(value) : undefined})}
              type="number"
              placeholder={settings.listenPort ? settings.listenPort.toString() : DEFAULT_SETTINGS.listenPort!.toString()}
            />
            <div className="sm:col-span-2">
              <EditableArrayField
                label="Addresses"
                values={editedConfig.interface.address}
                onChange={updateInterfaceAddresses}
                placeholder="e.g., 10.0.0.1/24"
              />
            </div>
            <div className="sm:col-span-2">
              <EditableArrayField
                label="DNS Servers"
                values={editedConfig.interface.dns || []}
                onChange={updateInterfaceDNS}
                placeholder="e.g., 8.8.8.8"
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
                {allConfigs.filter(c => c.id !== editedConfig.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {editedConfig.peers.map((peer, i) => (
              <div key={i} className="border rounded p-3 mb-2 bg-gray-50">
                {peer.configId ? (
                  <div className="text-xs text-indigo-700 mb-1">Peer from
                    config: {allConfigs.find(c => c.id === peer.configId)?.name || peer.configId}</div>
                ) : null}
                {/* Existing peer fields UI here */}
                <EditableField
                  label="Public Key"
                  value={peer.publicKey}
                  onChange={val => updatePeer(i, {publicKey: val})}
                />
                <EditableArrayField
                  label="Allowed IPs"
                  values={peer.allowedIPs}
                  onChange={vals => updatePeerAllowedIPs(i, vals)}
                />
                <EditableField
                  label="Endpoint"
                  value={peer.endpoint || ''}
                  onChange={val => updatePeer(i, {endpoint: val})}
                />
                <EditableField
                  label="Preshared Key"
                  value={peer.presharedKey || ''}
                  onChange={val => updatePeer(i, {presharedKey: val})}
                />
                <EditableField
                  label="Persistent Keepalive"
                  value={peer.persistentKeepalive?.toString() || ''}
                  onChange={val => updatePeer(i, {persistentKeepalive: val ? parseInt(val) : undefined})}
                  type="number"
                />
                <button
                  onClick={() => removePeer(i)}
                  className="mt-2 text-red-600 hover:text-red-800 text-xs"
                >
                  Remove Peer
                </button>
              </div>
            ))}
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
