import React, {useEffect, useState} from 'react';
import {WireGuardConfig} from '../types/WireGuardConfig';
import {SystemSettings} from '../types/SystemSettings';
import { v4 as uuidv4 } from 'uuid';

interface ConfigDetailProps {
  config?: WireGuardConfig;
  systemSettings: SystemSettings;
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
        + Add {label}
      </button>
    </div>
  </div>
);

const ConfigDetail: React.FC<ConfigDetailProps> = ({config, systemSettings, onSave, onDelete, onBack, onCancel}) => {
  // Create empty config for new configurations
  const createEmptyConfig = (): WireGuardConfig => ({
    id: uuidv4(),
    name: 'New Configuration',
    interface: {
      privateKey: '',
      address: [''],
      listenPort: undefined,
      dns: [''],
    },
    peers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [editedConfig, setEditedConfig] = useState<WireGuardConfig>(config || createEmptyConfig());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isNewConfig = !config;

  // Update edited config when prop changes
  useEffect(() => {
    if (config) {
      setEditedConfig(config);
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    // Update the timestamp when saving
    const configToSave = {
      ...editedConfig,
      updatedAt: new Date()
    };
    onSave(configToSave);
    // Reset saving state after a brief delay for visual feedback
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
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

    const mtu = editedConfig.interface.mtu || systemSettings.mtu;
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
        : systemSettings.defaultPersistentKeepalive;

      if (persistentKeepalive !== undefined && persistentKeepalive > 0) {
        content += `PersistentKeepalive = ${persistentKeepalive}\n`;
      }

      if (peer.presharedKey) {
        content += `PresharedKey = ${peer.presharedKey}\n`;
      }
    });

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
                  'Saved'
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
            <EditableField
              label="Listen Port"
              value={editedConfig.interface.listenPort || ''}
              onChange={(value) => updateInterface({listenPort: value ? parseInt(value) : undefined})}
              type="number"
              placeholder="Auto"
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
          </div>
        </div>

        {/* Peers Section */}
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">
              Peers ({editedConfig.peers.length})
            </h4>
            <button
              onClick={addPeer}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Peer
            </button>
          </div>
          <div className="space-y-4">
            {editedConfig.peers.map((peer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-medium text-gray-900">Peer {index + 1}</h5>
                  <button
                    onClick={() => removePeer(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <EditableField
                    label="Public Key"
                    value={peer.publicKey}
                    onChange={(value) => updatePeer(index, {publicKey: value})}
                    placeholder="Enter public key"
                  />
                  <EditableField
                    label="Preshared Key"
                    value={peer.presharedKey || ''}
                    onChange={(value) => updatePeer(index, {presharedKey: value || undefined})}
                    placeholder="Optional"
                  />
                  <EditableField
                    label="Endpoint"
                    value={peer.endpoint || ''}
                    onChange={(value) => updatePeer(index, {endpoint: value || undefined})}
                    placeholder="e.g., example.com:51820"
                  />
                  <EditableField
                    label="Persistent Keepalive"
                    value={peer.persistentKeepalive?.toString() || ''}
                    onChange={(value) => updatePeer(index, {persistentKeepalive: value ? parseInt(value) : undefined})}
                    type="number"
                    placeholder="Default"
                  />
                  <div className="sm:col-span-2">
                    <EditableArrayField
                      label="Allowed IPs"
                      values={peer.allowedIPs}
                      onChange={(values) => updatePeerAllowedIPs(index, values)}
                      placeholder="e.g., 10.0.0.2/32"
                    />
                  </div>
                </div>
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
        <div className="px-6 py-4">
          <textarea
            value={generateWireGuardConfig()}
            readOnly
            className="w-full h-64 font-mono text-sm bg-gray-50 border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Configuration will be generated here..."
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigDetail;