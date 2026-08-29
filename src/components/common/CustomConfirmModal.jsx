import React, { useEffect } from 'react';
import { AlertTriangle, Info, X, Trash2 } from 'lucide-react';

export const CustomConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'info' | 'warning'
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor:
                  type === 'danger'
                    ? 'var(--accent-rose-subtle)'
                    : type === 'warning'
                    ? 'var(--accent-amber-subtle)'
                    : 'var(--accent-cyan-subtle)',
                color:
                  type === 'danger'
                    ? 'var(--accent-rose)'
                    : type === 'warning'
                    ? 'var(--accent-amber)'
                    : 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {type === 'danger' ? (
                <Trash2 size={15} />
              ) : type === 'warning' ? (
                <AlertTriangle size={15} />
              ) : (
                <Info size={15} />
              )}
            </div>
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
          <p style={{ lineHeight: 1.6 }}>{message}</p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
