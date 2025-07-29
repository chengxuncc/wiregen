import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WireGuardConfig, InterfaceConfig, PeerConfig } from '../types/WireGuardConfig';

interface ImportConfigProps {
  onImport: (config: WireGuardConfig) => void;
  onCancel: () => void;
}

const ImportConfig: React.FC<ImportConfigProps> = ({ onImport, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const config = parseWireGuardConfig(content, file.name.replace(/\.conf$/, ''));
        if (config) {
          onImport(config);
        }
      } catch (err) {
        setError('Failed to parse the configuration file. Please ensure it is a valid WireGuard configuration.');
        console.error('Import error:', err);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const parseWireGuardConfig = (content: string, configName: string): WireGuardConfig => {
    const lines = content.split('\n').map(line => line.trim());
    let currentSection: 'interface' | 'peer' | null = null;
    
    const interfaceConfig: InterfaceConfig = {
      privateKey: '',
      address: [],
      listenPort: undefined,
      dns: [],
    };
    
    const peers: PeerConfig[] = [];
    let currentPeer: PeerConfig | null = null;
    
    for (const line of lines) {
      if (line === '' || line.startsWith('#')) continue;
      
      if (line === '[Interface]') {
        currentSection = 'interface';
        continue;
      }
      
      if (line === '[Peer]') {
        currentSection = 'peer';
        if (currentPeer) {
          peers.push(currentPeer);
        }
        currentPeer = {
          publicKey: '',
          allowedIPs: [],
          endpoint: undefined,
          persistentKeepalive: undefined,
          presharedKey: undefined,
        };
        continue;
      }
      
      if (!currentSection) continue;
      
      const [key, value] = line.split('=').map(part => part.trim());
      
      if (currentSection === 'interface') {
        switch (key.toLowerCase()) {
          case 'privatekey':
            interfaceConfig.privateKey = value;
            break;
          case 'address':
            interfaceConfig.address.push(value);
            break;
          case 'listenport':
            interfaceConfig.listenPort = parseInt(value);
            break;
          case 'dns':
            interfaceConfig.dns = value.split(',').map(dns => dns.trim());
            break;
        }
      } else if (currentSection === 'peer' && currentPeer) {
        switch (key.toLowerCase()) {
          case 'publickey':
            currentPeer.publicKey = value;
            break;
          case 'allowedips':
            currentPeer.allowedIPs.push(value);
            break;
          case 'endpoint':
            currentPeer.endpoint = value;
            break;
          case 'persistentkeepalive':
            currentPeer.persistentKeepalive = parseInt(value);
            break;
          case 'presharedkey':
            currentPeer.presharedKey = value;
            break;
        }
      }
    }
    
    // Add the last peer if there is one
    if (currentPeer) {
      peers.push(currentPeer);
    }
    
    // Validate required fields
    if (!interfaceConfig.privateKey) {
      throw new Error('Private key is required in the interface section');
    }
    
    if (interfaceConfig.address.length === 0) {
      throw new Error('At least one address is required in the interface section');
    }
    
    for (const peer of peers) {
      if (!peer.publicKey) {
        throw new Error('Public key is required for each peer');
      }
      
      if (peer.allowedIPs.length === 0) {
        throw new Error('At least one allowed IP is required for each peer');
      }
    }
    
    return {
      id: uuidv4(),
      name: configName,
      interface: interfaceConfig,
      peers,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        // Create a new FileList with the dropped file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        
        // Trigger the change event manually
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Import WireGuard Configuration
        </h3>
        <div className="mt-4">
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".conf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">WireGuard .conf files only</p>
              {fileName && (
                <p className="text-sm text-indigo-600 mt-2">Selected: {fileName}</p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportConfig;