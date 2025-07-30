import React, { useState } from 'react';
import { WireGuardConfig } from '../types/WireGuardConfig';
import { Settings } from '../types/Settings';

interface BackupData {
  configs: WireGuardConfig[];
  settings: Settings;
  backupDate?: string;
}

interface ImportBackupProps {
  onImport: (configs: WireGuardConfig[], settings: Settings) => void;
  onCancel: () => void;
}

const ImportBackup: React.FC<ImportBackupProps> = ({ onImport, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<BackupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setError('');
      return;
    }

    if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
      setError('Please select a valid JSON file');
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as BackupData;
        
        // Validate the backup data structure
        if (!data.configs || !Array.isArray(data.configs)) {
          throw new Error('Invalid backup file: missing or invalid configs array');
        }
        
        if (!data.settings || typeof data.settings !== 'object') {
          throw new Error('Invalid backup file: missing or invalid settings');
        }

        // Convert date strings back to Date objects for configs
        const processedConfigs = data.configs.map(config => ({
          ...config,
          createdAt: new Date(config.createdAt),
          updatedAt: new Date(config.updatedAt)
        }));

        setPreview({
          ...data,
          configs: processedConfigs
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse backup file');
        setPreview(null);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (!preview) return;
    
    onImport(preview.configs, preview.settings);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Import Backup</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Import configurations and settings from a backup file.
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="backup-file" className="block text-sm font-medium text-gray-700">
              Select Backup File
            </label>
            <div className="mt-1">
              <input
                type="file"
                id="backup-file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading backup file...</span>
            </div>
          )}

          {preview && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Backup Preview</h4>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Configurations:</span>
                  <span className="ml-2 text-sm text-gray-600">{preview.configs.length} config(s)</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Settings:</span>
                  <div className="ml-2 text-sm text-gray-600">
                    <div>MTU: {preview.settings.mtu || 'Not set'}</div>
                    <div>Default Persistent Keepalive: {preview.settings.persistentKeepalive || 'Not set'}</div>
                  </div>
                </div>
                
                {preview.backupDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Backup Date:</span>
                    <span className="ml-2 text-sm text-gray-600">
                      {new Date(preview.backupDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> Importing this backup will replace all existing configurations and settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={!preview}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import Backup
        </button>
      </div>
    </div>
  );
};

export default ImportBackup;