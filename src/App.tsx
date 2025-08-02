import React from 'react';
import './App.css';
import Layout from './components/Layout';
import ViewRenderer from './components/ViewRenderer';
import {ConfigProvider} from './contexts/ConfigContext';
import {useNavigation} from './hooks/useNavigation';
import {useConfigActions} from './hooks/useConfigActions';
import {WireGuardConfig} from "./types/WireGuardConfig";

// Main App content
const AppContent: React.FC = () => {
  const {currentView, selectedConfigId, navigateToView, View} = useNavigation();
  const {
    configs,
    settings,
    handleBackup,
    handleSelectConfig,
    handleAddConfig,
    handleImportConfig,
    handleRestore,
    handleBackupImported,
    handleSettings,
    handleEditConfig,
    handleDeleteConfig,
    handleSaveConfig,
    handleExportConfig,
    handleReset
  } = useConfigActions(navigateToView);

  const [importedConfig, setImportedConfig] = React.useState<WireGuardConfig | undefined>(undefined);

  const handleBack = () => {
    navigateToView(View.LIST);
    setImportedConfig(undefined);
  };

  const handleHome = () => {
    navigateToView(View.LIST);
    setImportedConfig(undefined);
  };

  const handleCancel = () => {
    navigateToView(View.LIST);
    setImportedConfig(undefined);
  };

  const handleConfigImported = (config: WireGuardConfig) => {
    setImportedConfig(config);
    navigateToView(View.DETAIL);
  };

  return (
    <Layout
      onSettings={handleSettings}
      onBackup={handleBackup}
      onRestore={handleRestore}
      onReset={handleReset}
      onHome={handleHome}
      showHeaderButtons={currentView === View.LIST}
    >
      <ViewRenderer
        currentView={currentView}
        selectedConfigId={selectedConfigId}
        configs={configs}
        settings={settings}
        onSelect={handleSelectConfig}
        onAdd={handleAddConfig}
        onImport={handleImportConfig}
        onExport={handleExportConfig}
        onEdit={handleEditConfig}
        onDelete={handleDeleteConfig}
        onSave={handleSaveConfig}
        onBack={handleBack}
        onConfigImported={handleConfigImported}
        onBackupImported={handleBackupImported}
        onCancel={handleCancel}
        importedConfig={importedConfig}
      />
    </Layout>
  );
};

// Wrap the app with the ConfigProvider and ErrorBoundary
function App() {
  return (
    <ConfigProvider>
      <AppContent/>
    </ConfigProvider>
  );
}

export default App;
