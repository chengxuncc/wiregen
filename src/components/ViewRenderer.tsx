import React from 'react';
import { View } from '../hooks/useNavigation';
import { WireGuardConfig } from '../types/WireGuardConfig';
import ConfigList from './ConfigList';
import ConfigDetail from './ConfigDetail';
import ImportConfig from './ImportConfig';
import ImportBackup from './ImportBackup';
import Settings from './Settings';

interface ViewRendererProps {
  currentView: View;
  selectedConfigId?: string;
  configs: { [id: string]: WireGuardConfig };
  settings: any;
  onSelect: (config: WireGuardConfig) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: (config: WireGuardConfig) => void;
  onEdit: (configId: string) => void;
  onDelete: (id: string) => void;
  onSave: (config: WireGuardConfig) => void;
  onBack: () => void;
  onConfigImported: (config: WireGuardConfig) => void;
  onBackupImported: (configs: { [id: string]: WireGuardConfig }, settings: any) => void;
  onCancel: () => void;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({
  currentView,
  selectedConfigId,
  configs,
  settings,
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
  const selectedConfig = selectedConfigId ? configs[selectedConfigId] : undefined;

  switch (currentView) {
    case View.LIST:
      return (
        <ConfigList
          configs={configs}
          onSelect={onSelect}
          onAdd={onAdd}
          onImport={onImport}
          onExport={onExport}
          onEdit={onEdit}
        />
      );

    case View.DETAIL:
      return (
        <ConfigDetail
          config={selectedConfig}
          settings={settings}
          onSave={onSave}
          onDelete={selectedConfig ? () => onDelete(selectedConfig.id) : undefined}
          onBack={onBack}
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
        <Settings
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