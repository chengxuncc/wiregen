import React, { useState, useEffect } from 'react';
import { WireGuardConfig, InterfaceConfig, PeerConfig } from '../types/WireGuardConfig';
import { v4 as uuidv4 } from 'uuid';

interface ConfigFormProps {
  config?: WireGuardConfig;
  onSave: (config: WireGuardConfig) => void;
  onCancel: () => void;
}

const emptyInterfaceConfig: InterfaceConfig = {
  privateKey: '',
  address: [''],
  listenPort: undefined,
  dns: [''],
};

const emptyPeerConfig: PeerConfig = {
  publicKey: '',
  allowedIPs: [''],
  endpoint: '',
  persistentKeepalive: 25,
  presharedKey: '',
};

const ConfigForm: React.FC<ConfigFormProps> = ({ config, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [interfaceConfig, setInterfaceConfig] = useState<InterfaceConfig>(emptyInterfaceConfig);
  const [peers, setPeers] = useState<PeerConfig[]>([]);
  const [activeTab, setActiveTab] = useState('interface');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setName(config.name);
      setInterfaceConfig(config.interface);
      setPeers(config.peers);
    } else {
      // Initialize with no peers
      setPeers([]);
    }
  }, [config]);

  const handleSave = () => {
    setIsSaving(true);
    const newConfig: WireGuardConfig = {
      id: config?.id || uuidv4(),
      name,
      interface: {
        ...interfaceConfig,
        // Filter out empty values
        address: interfaceConfig.address.filter(a => a.trim() !== ''),
        dns: interfaceConfig.dns?.filter(d => d.trim() !== '') || [],
      },
      peers: peers.map(peer => ({
        ...peer,
        // Filter out empty values
        allowedIPs: peer.allowedIPs.filter(ip => ip.trim() !== ''),
      })),
      createdAt: config?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    onSave(newConfig);
    // Reset saving state after a brief delay for visual feedback
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleInterfaceChange = (field: keyof InterfaceConfig, value: any) => {
    setInterfaceConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...interfaceConfig.address];
    newAddresses[index] = value;
    setInterfaceConfig(prev => ({ ...prev, address: newAddresses }));
  };

  const handleAddAddress = () => {
    setInterfaceConfig(prev => ({
      ...prev,
      address: [...prev.address, ''],
    }));
  };

  const handleRemoveAddress = (index: number) => {
    const newAddresses = [...interfaceConfig.address];
    newAddresses.splice(index, 1);
    setInterfaceConfig(prev => ({ ...prev, address: newAddresses }));
  };

  const handleDnsChange = (index: number, value: string) => {
    const newDns = [...(interfaceConfig.dns || [])];
    newDns[index] = value;
    setInterfaceConfig(prev => ({ ...prev, dns: newDns }));
  };

  const handleAddDns = () => {
    setInterfaceConfig(prev => ({
      ...prev,
      dns: [...(prev.dns || []), ''],
    }));
  };

  const handleRemoveDns = (index: number) => {
    const newDns = [...(interfaceConfig.dns || [])];
    newDns.splice(index, 1);
    setInterfaceConfig(prev => ({ ...prev, dns: newDns }));
  };

  const handlePeerChange = (index: number, field: keyof PeerConfig, value: any) => {
    const newPeers = [...peers];
    newPeers[index] = { ...newPeers[index], [field]: value };
    setPeers(newPeers);
  };

  const handleAllowedIPChange = (peerIndex: number, ipIndex: number, value: string) => {
    const newPeers = [...peers];
    const newIPs = [...newPeers[peerIndex].allowedIPs];
    newIPs[ipIndex] = value;
    newPeers[peerIndex] = { ...newPeers[peerIndex], allowedIPs: newIPs };
    setPeers(newPeers);
  };

  const handleAddAllowedIP = (peerIndex: number) => {
    const newPeers = [...peers];
    newPeers[peerIndex] = {
      ...newPeers[peerIndex],
      allowedIPs: [...newPeers[peerIndex].allowedIPs, ''],
    };
    setPeers(newPeers);
  };

  const handleRemoveAllowedIP = (peerIndex: number, ipIndex: number) => {
    const newPeers = [...peers];
    const newIPs = [...newPeers[peerIndex].allowedIPs];
    newIPs.splice(ipIndex, 1);
    newPeers[peerIndex] = { ...newPeers[peerIndex], allowedIPs: newIPs };
    setPeers(newPeers);
  };

  const handleAddPeer = () => {
    setPeers(prev => [...prev, { ...emptyPeerConfig }]);
  };

  const handleRemovePeer = (index: number) => {
    const newPeers = [...peers];
    newPeers.splice(index, 1);
    setPeers(newPeers);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {config ? 'Edit Configuration' : 'New Configuration'}
        </h3>
        
        <div className="mt-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Configuration Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="My WireGuard Config"
          />
        </div>

        <div className="mt-6">
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">Select a tab</label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="interface">Interface</option>
              <option value="peers">Peers</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('interface')}
                  className={`${
                    activeTab === 'interface'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Interface
                </button>
                <button
                  onClick={() => setActiveTab('peers')}
                  className={`${
                    activeTab === 'peers'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Peers ({peers.length})
                </button>
              </nav>
            </div>
          </div>
        </div>

        {activeTab === 'interface' && (
          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium text-gray-700">
                Private Key
              </label>
              <input
                type="text"
                id="privateKey"
                value={interfaceConfig.privateKey}
                onChange={(e) => handleInterfaceChange('privateKey', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Base64 encoded private key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              {interfaceConfig.address.map((addr, index) => (
                <div key={index} className="flex mt-1">
                  <input
                    type="text"
                    value={addr}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="10.0.0.1/24"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(index)}
                    disabled={interfaceConfig.address.length <= 1}
                    className={`ml-2 inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white ${
                      interfaceConfig.address.length <= 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAddress}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Address
              </button>
            </div>

            <div>
              <label htmlFor="listenPort" className="block text-sm font-medium text-gray-700">
                Listen Port (optional)
              </label>
              <input
                type="number"
                id="listenPort"
                value={interfaceConfig.listenPort || ''}
                onChange={(e) => handleInterfaceChange('listenPort', e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="51820"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                DNS (optional)
              </label>
              {(interfaceConfig.dns || []).map((dns, index) => (
                <div key={index} className="flex mt-1">
                  <input
                    type="text"
                    value={dns}
                    onChange={(e) => handleDnsChange(index, e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="1.1.1.1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDns(index)}
                    className="ml-2 inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddDns}
                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add DNS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'peers' && (
          <div className="mt-6">
            {peers.map((peer, peerIndex) => (
              <div key={peerIndex} className="mb-8 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Peer {peerIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemovePeer(peerIndex)}
                    disabled={peers.length <= 1}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      peers.length <= 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    Remove Peer
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`publicKey-${peerIndex}`} className="block text-sm font-medium text-gray-700">
                      Public Key
                    </label>
                    <input
                      type="text"
                      id={`publicKey-${peerIndex}`}
                      value={peer.publicKey}
                      onChange={(e) => handlePeerChange(peerIndex, 'publicKey', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Base64 encoded public key"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Allowed IPs
                    </label>
                    {peer.allowedIPs.map((ip, ipIndex) => (
                      <div key={ipIndex} className="flex mt-1">
                        <input
                          type="text"
                          value={ip}
                          onChange={(e) => handleAllowedIPChange(peerIndex, ipIndex, e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="10.0.0.2/32"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAllowedIP(peerIndex, ipIndex)}
                          disabled={peer.allowedIPs.length <= 1}
                          className={`ml-2 inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white ${
                            peer.allowedIPs.length <= 1
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddAllowedIP(peerIndex)}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Allowed IP
                    </button>
                  </div>

                  <div>
                    <label htmlFor={`endpoint-${peerIndex}`} className="block text-sm font-medium text-gray-700">
                      Endpoint (optional)
                    </label>
                    <input
                      type="text"
                      id={`endpoint-${peerIndex}`}
                      value={peer.endpoint || ''}
                      onChange={(e) => handlePeerChange(peerIndex, 'endpoint', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="example.com:51820"
                    />
                  </div>

                  <div>
                    <label htmlFor={`persistentKeepalive-${peerIndex}`} className="block text-sm font-medium text-gray-700">
                      Persistent Keepalive (seconds, optional)
                    </label>
                    <input
                      type="number"
                      id={`persistentKeepalive-${peerIndex}`}
                      value={peer.persistentKeepalive || ''}
                      onChange={(e) => handlePeerChange(peerIndex, 'persistentKeepalive', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label htmlFor={`presharedKey-${peerIndex}`} className="block text-sm font-medium text-gray-700">
                      Preshared Key (optional)
                    </label>
                    <input
                      type="text"
                      id={`presharedKey-${peerIndex}`}
                      value={peer.presharedKey || ''}
                      onChange={(e) => handlePeerChange(peerIndex, 'presharedKey', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Base64 encoded preshared key"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddPeer}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Peer
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
              isSaving 
                ? 'text-white bg-green-600 cursor-not-allowed' 
                : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            }`}
          >
                         {isSaving ? (
               'Saved!'
             ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigForm;