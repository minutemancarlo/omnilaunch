import React from 'react';
import { Layers, Plus, Sparkles, AppWindow, Globe } from 'lucide-react';

export const EmptyState = ({ type = 'no-workspace', onAction }) => {
  if (type === 'no-workspace') {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Layers size={28} />
        </div>
        <h2 className="empty-title">No Workspace Selected</h2>
        <p className="empty-description">
          Create a new workspace routine to organize and launch your desktop apps and websites together in 1-click.
        </p>
        <button className="btn btn-primary" onClick={onAction}>
          <Plus size={15} />
          Create First Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Sparkles size={28} />
      </div>
      <h2 className="empty-title">This Workspace is Empty</h2>
      <p className="empty-description">
        Add your frequently used desktop applications (.exe / tools) or web URLs to start launching them simultaneously.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={onAction}>
          <Plus size={15} />
          Add Target
        </button>
      </div>
    </div>
  );
};
