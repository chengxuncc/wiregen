import React from 'react';
import './App.css';
import Layout from './components/Layout';
import ViewRenderer from './components/ViewRenderer';
import {ConfigProvider} from './contexts/ConfigContext';
import {useNavigation} from './hooks/useNavigation';
import {useConfigActions} from './hooks/useConfigActions';

// Main App content
const AppContent: React.FC = () => {
  const {currentView, selectedConfigId, navigateToView, View} = useNavigation();
  const {
    configs,
    systemSettings,
    handleBackup,
    handleSelectConfig,
    handleAddConfig,
    handleImportConfig,
    handleRestore,
    handleBackupImported,
    handleSystemSettings,
    handleConfigImported,
    handleEditConfig,
    handleDeleteConfig,
    handleSaveConfig,
    handleExportConfig
  } = useConfigActions(navigateToView);

  const handleBack = () => {
    navigateToView(View.LIST);
  };

  const handleHome = () => {
    navigateToView(View.LIST);
  };

  const handleCancel = () => {
    if (selectedConfigId) {
      navigateToView(View.DETAIL, selectedConfigId);
    } else {
      navigateToView(View.LIST);
    }
  };

  return (
    <Layout
      onSettings={handleSystemSettings}
      onBackup={handleBackup}
      onRestore={handleRestore}
      onHome={handleHome}
      showHeaderButtons={currentView === View.LIST}
    >
      <ViewRenderer
        currentView={currentView}
        selectedConfigId={selectedConfigId}
        configs={configs}
        systemSettings={systemSettings}
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
