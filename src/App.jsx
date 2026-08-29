import React, { useState } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { WorkspaceHero } from './components/workspace/WorkspaceHero';
import { ItemGrid } from './components/workspace/ItemGrid';
import { EmptyState } from './components/workspace/EmptyState';
import { ShortcutsView } from './components/shortcuts/ShortcutsView';
import { WorkspaceModal } from './components/modals/WorkspaceModal';
import { AddItemModal } from './components/modals/AddItemModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ChangelogModal } from './components/modals/ChangelogModal';
import { UpdateModal } from './components/modals/UpdateModal';
import { CustomConfirmModal } from './components/common/CustomConfirmModal';
import { Toast } from './components/common/Toast';
import { useWorkspace } from './context/WorkspaceContext';
import { LayoutGrid, Plus, Zap } from 'lucide-react';

export const App = () => {
  const {
    workspaces,
    activeWorkspace,
    shortcuts,
    activeView,
    setActiveView,
    confirmDialog,
    closeConfirmDialog,
    isUpdateModalOpen,
    closeUpdateModal,
    updateInfo,
    checkUpdates,
    isCheckingUpdate,
    isChangelogModalOpen,
    closeChangelogModal,
  } = useWorkspace();

  // Modals state
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalTargetType, setModalTargetType] = useState('workspace');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenNewWorkspace = () => {
    setEditingWorkspace(null);
    setIsWorkspaceModalOpen(true);
  };

  const handleEditWorkspace = (ws) => {
    setEditingWorkspace(ws);
    setIsWorkspaceModalOpen(true);
  };

  const handleOpenAddWorkspaceTarget = () => {
    setEditingItem(null);
    setModalTargetType('workspace');
    setIsItemModalOpen(true);
  };

  const handleEditWorkspaceTarget = (item) => {
    setEditingItem(item);
    setModalTargetType('workspace');
    setIsItemModalOpen(true);
  };

  const handleOpenAddShortcut = () => {
    setEditingItem(null);
    setModalTargetType('shortcut');
    setIsItemModalOpen(true);
  };

  const handleEditShortcut = (shortcut) => {
    setEditingItem(shortcut);
    setModalTargetType('shortcut');
    setIsItemModalOpen(true);
  };

  return (
    <div className="app-shell">
      {/* Titlebar */}
      <TitleBar onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <div className="app-container">
        {/* Sidebar */}
        <Sidebar
          onOpenNewWorkspaceModal={handleOpenNewWorkspace}
          onEditWorkspace={handleEditWorkspace}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {/* Top Navbar Tabs */}
          <div className="content-navbar">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeView === 'shortcuts' ? 'active' : ''}`}
                onClick={() => setActiveView('shortcuts')}
              >
                <Zap size={14} color="var(--accent-cyan)" />
                Quick Shortcuts ({shortcuts.length})
              </button>

              <button
                className={`nav-tab ${activeView === 'workspace' ? 'active' : ''}`}
                onClick={() => setActiveView('workspace')}
              >
                <LayoutGrid size={14} color="var(--accent-primary)" />
                Workspaces ({workspaces.length})
              </button>
            </div>

            <div>
              {activeView === 'shortcuts' ? (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleOpenAddShortcut}
                >
                  <Plus size={14} />
                  Add Shortcut
                </button>
              ) : activeWorkspace ? (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleOpenAddWorkspaceTarget}
                >
                  <Plus size={14} />
                  Add Target
                </button>
              ) : null}
            </div>
          </div>

          {/* View Container */}
          <div className="view-container">
            {activeView === 'shortcuts' ? (
              <ShortcutsView
                onOpenAddShortcutModal={handleOpenAddShortcut}
                onEditShortcut={handleEditShortcut}
              />
            ) : workspaces.length === 0 ? (
              <EmptyState type="no-workspace" onAction={handleOpenNewWorkspace} />
            ) : (
              <>
                <WorkspaceHero onOpenAddItemModal={handleOpenAddWorkspaceTarget} />
                <ItemGrid
                  onEditItem={handleEditWorkspaceTarget}
                  onOpenAddItemModal={handleOpenAddWorkspaceTarget}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        editingWorkspace={editingWorkspace}
      />

      <AddItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        editingItem={editingItem}
        targetType={modalTargetType}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <ChangelogModal
        isOpen={isChangelogModalOpen}
        onClose={closeChangelogModal}
      />

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        updateInfo={updateInfo}
        onCheckAgain={() => checkUpdates(true)}
        isChecking={isCheckingUpdate}
      />

      {/* Themed Custom Confirm / Message Dialog */}
      <CustomConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirmDialog}
      />

      {/* Real-time Toasts */}
      <Toast />
    </div>
  );
};
