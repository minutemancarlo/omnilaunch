import React from 'react';
import { Play, Plus, Loader2, AppWindow, Globe, Layers } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const WorkspaceHero = ({ onOpenAddItemModal }) => {
  const { activeWorkspace, launchWorkspace, isLaunchingAll } = useWorkspace();

  if (!activeWorkspace) return null;

  const items = activeWorkspace.items || [];
  const appCount = items.filter((i) => i.type === 'app').length;
  const urlCount = items.filter((i) => i.type === 'url').length;

  return (
    <div className="workspace-header">
      <div className="workspace-meta">
        <div className="workspace-title-row">
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: activeWorkspace.color || '#10b981',
              boxShadow: `0 0 12px ${activeWorkspace.color || '#10b981'}88`,
            }}
          />
          <h1 className="workspace-heading">{activeWorkspace.name}</h1>
        </div>
        {activeWorkspace.description && (
          <p className="workspace-description">{activeWorkspace.description}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Layers size={13} /> {items.length} Total Targets
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AppWindow size={13} /> {appCount} Apps
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Globe size={13} /> {urlCount} Web URLs
          </span>
        </div>
      </div>

      <div className="workspace-actions">
        <button
          className="btn btn-secondary"
          onClick={onOpenAddItemModal}
        >
          <Plus size={15} />
          Add Target
        </button>

        <button
          className="btn btn-primary btn-hero"
          onClick={() => launchWorkspace(activeWorkspace.id)}
          disabled={items.length === 0 || isLaunchingAll}
        >
          {isLaunchingAll ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Launching...
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              Launch All ({items.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
};
