import React from 'react';
import { WireGuardConfig } from '../types/WireGuardConfig';

interface ConfigDetailProps {
  config: WireGuardConfig;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
  onBack: () => void;
}

const ConfigDetail: React.FC<ConfigDetailProps> = ({
  config,
  onEdit,
  onDelete,
  onExport,
  onBack,
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">{config.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created: {config.createdAt.toLocaleString()} | Last updated: {config.updatedAt.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Interface</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <div className="text-xs text-gray-500">Private Key</div>
                    <div className="font-mono text-sm truncate">{config.interface.privateKey}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Listen Port</div>
                    <div>{config.interface.listenPort || 'Auto'}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500">Address</div>
                    <div>
                      {config.interface.address.map((addr, i) => (
                        <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 rounded-md text-sm">
                          {addr}
                        </span>
                      ))}
                    </div>
                  </div>
                  {config.interface.dns && config.interface.dns.length > 0 && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500">DNS</div>
                      <div>
                        {config.interface.dns.map((dns, i) => (
                          <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 rounded-md text-sm">
                            {dns}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Peers ({config.peers.length})</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.peers.map((peer, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <div className="text-xs text-gray-500">Public Key</div>
                      <div className="font-mono text-sm truncate">{peer.publicKey}</div>
                    </div>
                    {peer.presharedKey && (
                      <div>
                        <div className="text-xs text-gray-500">Preshared Key</div>
                        <div className="font-mono text-sm truncate">{peer.presharedKey}</div>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500">Allowed IPs</div>
                      <div>
                        {peer.allowedIPs.map((ip, i) => (
                          <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 rounded-md text-sm">
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                    {peer.endpoint && (
                      <div>
                        <div className="text-xs text-gray-500">Endpoint</div>
                        <div>{peer.endpoint}</div>
                      </div>
                    )}
                    {peer.persistentKeepalive !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500">Persistent Keepalive</div>
                        <div>{peer.persistentKeepalive} seconds</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ConfigDetail;