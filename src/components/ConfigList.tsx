import React from 'react';
import { WireGuardConfig } from '../types/WireGuardConfig';

interface ConfigListProps {
  configs: WireGuardConfig[];
  onSelect: (config: WireGuardConfig) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport?: () => void;
  onSettings?: () => void;
}

const ConfigList: React.FC<ConfigListProps> = ({ configs, onSelect, onDelete, onAdd, onImport, onExport, onSettings }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">WireGuard Configurations</h2>
        <div className="flex space-x-2">
          {onSettings && (
            <button
              onClick={onSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              System Settings
            </button>
          )}
          <button
            onClick={onImport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Import
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export All
            </button>
          )}
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add New
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {configs.length === 0 ? (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
            No configurations found. Click "Add New" to create one.
          </li>
        ) : (
          configs.map((config) => (
            <li key={config.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{config.name}</p>
                    <p className="text-sm text-gray-500">
                      {config.interface.address.join(', ')} • {config.peers.length} peer(s)
                    </p>
                    <p className="text-xs text-gray-400">
                      Updated: {config.updatedAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelect(config)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View/Edit
                  </button>
                  <button
                    onClick={() => onDelete(config.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ConfigList;