import React, {useMemo, useState} from 'react';
import {WireGuardConfig} from '../types/WireGuardConfig';
import {getPublicKey, parseWireGuardConfig} from "../utils/wireguard";

interface ConfigListProps {
  configs: { [id: string]: WireGuardConfig };
  onSelect: (config: WireGuardConfig) => void;
  onDelete?: (id: string) => void;
  onAdd: () => void;
  onImport: (config: WireGuardConfig) => void;
  onExport: (config: WireGuardConfig) => void;
  onEdit?: (configId: string) => void;
}

const ConfigList: React.FC<ConfigListProps> = ({configs, onSelect, onDelete, onAdd, onImport, onExport, onEdit}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'peers'>('updatedAt');
  const confImportRef = React.useRef<HTMLInputElement>(null);

  // Filter and sort configs
  const filteredAndSortedConfigs = useMemo(() => {
    let filtered = Object.values(configs).filter(config =>
      config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.interface.address.some(addr => addr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      config.interface.privateKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.interface.host?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPublicKey(config.interface.privateKey).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'peers':
          return b.peers.length - a.peers.length;
        case 'updatedAt':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });
  }, [configs, searchTerm, sortBy]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'less than 1 minute';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else if (diffInMinutes < 10080) { // 7 days
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const config = parseWireGuardConfig(content, file.name.replace(/\.conf$/, ''));
        if (config) {
          onImport(config);
        }
      } catch (err) {
        console.log("import error", err);
        alert('Failed to import config');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Search and controls section */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Search bar */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search configurations by name or IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'updatedAt' | 'peers')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="updatedAt">Sort by: Recently Updated</option>
              <option value="name">Sort by: Name</option>
              <option value="peers">Sort by: Number of Peers</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <input
              type="file"
              accept=".conf,.txt"
              ref={confImportRef}
              style={{display: 'none'}}
              onChange={handleFileChange}
            />
            <button
              onClick={() => {
                confImportRef.current?.click();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   className="lucide lucide-file-cog flex-shrink-0 h-4 w-4 mr-2">
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="m3.2 12.9-.9-.4"></path>
                <path d="m3.2 15.1-.9.4"></path>
                <path d="M4.677 21.5a2 2 0 0 0 1.313.5H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2.5"></path>
                <path d="m4.9 11.2-.4-.9"></path>
                <path d="m4.9 16.8-.4.9"></path>
                <path d="m7.5 10.3-.4.9"></path>
                <path d="m7.5 17.7-.4-.9"></path>
                <path d="m9.7 12.5-.9.4"></path>
                <path d="m9.7 15.5-.9-.4"></path>
                <circle cx="6" cy="14" r="3"></circle>
              </svg>
              Import
            </button>
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* Configurations list */}
      <div>
        {filteredAndSortedConfigs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            {searchTerm ? (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No configurations found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No configurations</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new configuration.</p>
                <div className="mt-6">
                  <button
                    onClick={onAdd}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Add New Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedConfigs.map((config) => (
              <li key={config.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          {onEdit ? (
                            <p
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(config.id);
                              }}
                              title="Click to edit configuration"
                            >
                              {config.name}
                            </p>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 truncate">{config.name}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-1">
                            {
                              config.interface.address.length > 0 && <p className="text-sm text-gray-500">
                                {config.interface.address.join(', ')}
                                </p>
                            }
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                              </svg>
                              {config.peers.length} peer{config.peers.length !== 1 ? 's' : ''}
                            </div>
                            <p className="text-sm text-gray-400">
                              Updated {formatDate(config.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onExport(config)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      title="Download configuration file"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={() => onSelect(config)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      title="View and edit configuration"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConfigList;
