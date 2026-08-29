import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const COLOR_OPTIONS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export const WorkspaceModal = ({ isOpen, onClose, editingWorkspace = null }) => {
  const { createWorkspace, updateWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');

  useEffect(() => {
    if (editingWorkspace) {
      setName(editingWorkspace.name || '');
      setDescription(editingWorkspace.description || '');
      setColor(editingWorkspace.color || '#10b981');
    } else {
      setName('');
      setDescription('');
      setColor('#10b981');
    }
  }, [editingWorkspace, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingWorkspace) {
      updateWorkspace(editingWorkspace.id, { name, description, color });
    } else {
      createWorkspace({ name, description, color });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingWorkspace ? 'Edit Workspace Profile' : 'Create New Workspace'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Workspace Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Work & Dev Stack, Daily Routine, Trading Hub"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Brief summary of this workspace setup..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color Accent</label>
              <div className="color-picker-grid">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingWorkspace ? 'Save Changes' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
