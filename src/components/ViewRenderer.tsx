import React from 'react';
import { View } from '../hooks/useNavigation';
import { WireGuardConfig } from '../types/WireGuardConfig';
import ConfigList from './ConfigList';
import ConfigDetail from './ConfigDetail';
import ConfigForm from './ConfigForm';
import ImportConfig from './ImportConfig';
import ImportBackup from './ImportBackup';
import SystemSettings from './SystemSettings';

interface ViewRendererProps {
  currentView: View;
  selectedConfigId?: string;
  configs: WireGuardConfig[];
  systemSettings: any;
  onSelect: (config: WireGuardConfig) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: (config: WireGuardConfig) => void;
  onEdit: (configId: string) => void;
  onDelete: (id: string) => void;
  onSave: (config: WireGuardConfig) => void;
  onBack: () => void;
  onConfigImported: (config: WireGuardConfig) => void;
  onBackupImported: (configs: WireGuardConfig[], systemSettings: any) => void;
  onCancel: () => void;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({
  currentView,
  selectedConfigId,
  configs,
  systemSettings,
  onSelect,
  onAdd,
  onImport,
  onExport,
  onEdit,
  onDelete,
  onSave,
  onBack,
  onConfigImported,
  onBackupImported,
  onCancel
}) => {
  const selectedConfig = selectedConfigId ? configs.find(c => c.id === selectedConfigId) : undefined;

  switch (currentView) {
    case View.LIST:
      return (
        <ConfigList
          configs={configs}
          onSelect={onSelect}
          onAdd={onAdd}
          onImport={onImport}
          onExport={onExport}
        />
      );

    case View.DETAIL:
      if (!selectedConfig) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Configuration not found</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to List
            </button>
          </div>
        );
      }
      return (
        <ConfigDetail
          config={selectedConfig}
          systemSettings={systemSettings}
          onSave={onSave}
          onDelete={() => onDelete(selectedConfig.id)}
          onBack={onBack}
        />
      );

    case View.FORM:
      return (
        <ConfigForm
          config={selectedConfig}
          onSave={onSave}
          onCancel={onCancel}
        />
      );

    case View.IMPORT:
      return (
        <ImportConfig
          onImport={onConfigImported}
          onCancel={onCancel}
        />
      );

    case View.IMPORT_BACKUP:
      return (
        <ImportBackup
          onImport={onBackupImported}
          onCancel={onCancel}
        />
      );

    case View.SETTINGS:
      return (
        <SystemSettings
          onBack={onBack}
        />
      );

    default:
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Page not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to List
          </button>
        </div>
      );
  }
};

export default ViewRenderer; 