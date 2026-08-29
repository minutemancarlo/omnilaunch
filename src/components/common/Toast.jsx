import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Toast = () => {
  const { toasts, removeToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={16} color="var(--accent-primary)" />}
            {toast.type === 'error' && <AlertCircle size={16} color="var(--accent-rose)" />}
            {toast.type === 'info' && <Info size={16} color="var(--accent-cyan)" />}
            <span>{toast.message}</span>
            <button
              className="btn btn-ghost btn-icon"
              style={{ width: 18, height: 18, marginLeft: 8 }}
              onClick={() => removeToast(toast.id)}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
