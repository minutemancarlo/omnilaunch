import React from 'react';
import { Play, Edit2, Trash2, Loader2, Check, Shield } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AppIconRenderer } from '../common/BrandIcons';

export const ItemCard = ({ item, onEdit }) => {
  const { activeWorkspace, deleteItem, launchItem, launchStatuses, showConfirmDialog } = useWorkspace();
  const status = launchStatuses[item.id] || 'idle';

  const isApp = item.type === 'app';

  const getSubtypeLabel = () => {
    if (isApp) {
      return item.runInTerminal ? 'Terminal Script / Command' : 'Desktop Application';
    }
    return 'Web App / URL';
  };

  const handleDeletePrompt = () => {
    showConfirmDialog({
      title: 'Remove Target?',
      message: `Are you sure you want to remove "${item.name}" from ${activeWorkspace?.name || 'this workspace'}?`,
      confirmText: 'Remove',
      type: 'danger',
      onConfirm: () => deleteItem(activeWorkspace.id, item.id),
    });
  };

  return (
    <div className="item-card">
      <div className="item-card-top">
        <div className="item-header">
          <div className="item-icon-wrapper">
            <AppIconRenderer name={item.name} type={item.type} url={item.url} iconDataUrl={item.iconDataUrl} size={22} />
          </div>
          <div className="item-title-col">
            <h3 className="item-name" title={item.name}>{item.name}</h3>
            <span className="item-type-badge">
              {getSubtypeLabel()}
              {item.runAsAdmin && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    color: '#f59e0b',
                    fontWeight: 700,
                    marginLeft: 6,
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: 10,
                  }}
                  title="Runs with Administrator / UAC privileges"
                >
                  <Shield size={10} /> ADMIN
                </span>
              )}
              {item.delaySeconds > 0 && (
                <span style={{ color: 'var(--accent-amber)', marginLeft: 4 }}>
                  (+{item.delaySeconds}s delay)
                </span>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="btn btn-ghost btn-icon"
            title="Edit Target"
            onClick={() => onEdit(item)}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            title="Delete Target"
            onClick={handleDeletePrompt}
            style={{ color: 'var(--accent-rose)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="item-target-path" title={isApp ? item.executablePath : item.url}>
        {isApp ? item.executablePath || 'Custom Executable' : item.url}
      </div>

      <div className="item-card-footer">
        <div className="item-status-tag">
          <span className={`status-dot ${status}`} />
          <span>
            {status === 'idle' && 'Ready'}
            {status === 'launching' && 'Launching...'}
            {status === 'launched' && 'Launched'}
            {status === 'error' && 'Launch Error'}
          </span>
        </div>

        <button
          className={`btn ${status === 'launched' ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '6px 14px', fontSize: '12px' }}
          onClick={() => launchItem(item)}
          disabled={status === 'launching'}
        >
          {status === 'launching' ? (
            <Loader2 size={13} className="animate-spin" />
          ) : status === 'launched' ? (
            <>
              <Check size={13} /> Re-launch
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" /> Launch
            </>
          )}
        </button>
      </div>
    </div>
  );
};
