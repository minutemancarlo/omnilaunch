import React from 'react';
import { Plus, Edit2, Trash2, Sparkles, Layers, Zap, Settings } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Sidebar = ({ onOpenNewWorkspaceModal, onEditWorkspace, onOpenSettings }) => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    deleteWorkspace,
    shortcuts,
    activeView,
    setActiveView,
    showConfirmDialog,
  } = useWorkspace();

  const handleDeleteWorkspacePrompt = (e, ws) => {
    e.stopPropagation();
    showConfirmDialog({
      title: 'Delete Workspace Routine?',
      message: `Are you sure you want to delete workspace "${ws.name}"? All ${ws.items?.length || 0} associated targets will be permanently removed.`,
      confirmText: 'Delete Routine',
      type: 'danger',
      onConfirm: () => deleteWorkspace(ws.id),
    });
  };

  return (
    <aside className="sidebar">
      {/* Top Section: Quick Shortcuts */}
      <div style={{ padding: '12px 10px 6px 10px' }}>
        <div
          className={`workspace-item ${activeView === 'shortcuts' ? 'active' : ''}`}
          onClick={() => setActiveView('shortcuts')}
          style={{
            backgroundColor: activeView === 'shortcuts' ? 'var(--bg-card)' : 'transparent',
            border: activeView === 'shortcuts' ? '1px solid var(--border-medium)' : '1px solid transparent',
          }}
        >
          <div className="workspace-info">
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: 'var(--accent-cyan-subtle)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={13} />
            </div>
            <span className="workspace-title" style={{ fontWeight: 700 }}>Quick Shortcuts</span>
          </div>

          <span className="workspace-count" style={{ color: 'var(--accent-cyan)' }}>
            {shortcuts.length}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="sidebar-header" style={{ paddingTop: 10 }}>
        <span className="sidebar-heading">Workspaces & Routines ({workspaces.length})</span>
        <button
          className="btn btn-secondary btn-icon"
          title="Create New Workspace"
          onClick={onOpenNewWorkspaceModal}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Workspaces List */}
      <div className="sidebar-workspace-list">
        {workspaces.length === 0 ? (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
            }}
          >
            <Sparkles size={20} style={{ margin: '0 auto 8px', color: 'var(--accent-primary)' }} />
            No workspaces yet. Click + to create a routine bundle!
          </div>
        ) : (
          workspaces.map((ws) => {
            const isActive = activeView === 'workspace' && ws.id === activeWorkspaceId;
            const itemCount = ws.items ? ws.items.length : 0;

            return (
              <div
                key={ws.id}
                className={`workspace-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveWorkspaceId(ws.id);
                  setActiveView('workspace');
                }}
              >
                <div className="workspace-info">
                  <div
                    className="workspace-badge"
                    style={{ backgroundColor: ws.color || '#10b981' }}
                  />
                  <span className="workspace-title">{ws.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="workspace-count">{itemCount}</span>

                  <div className="workspace-item-actions">
                    <button
                      className="btn btn-ghost btn-icon"
                      title="Edit Workspace"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditWorkspace(ws);
                      }}
                      style={{ width: 24, height: 24 }}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      title="Delete Workspace"
                      onClick={(e) => handleDeleteWorkspacePrompt(e, ws)}
                      style={{ width: 24, height: 24, color: 'var(--accent-rose)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer with Settings */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '11.5px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={onOpenSettings}
          >
            <Settings size={13} /> Settings
          </button>

          <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={11} /> {workspaces.length} Routines
          </span>
        </div>
      </div>
    </aside>
  );
};
