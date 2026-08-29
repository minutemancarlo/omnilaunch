import React from 'react';
import { ItemCard } from './ItemCard';
import { EmptyState } from './EmptyState';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ItemGrid = ({ onEditItem, onOpenAddItemModal }) => {
  const { activeWorkspace } = useWorkspace();

  if (!activeWorkspace) {
    return <EmptyState type="no-workspace" onAction={onOpenAddItemModal} />;
  }

  const items = activeWorkspace.items || [];

  if (items.length === 0) {
    return <EmptyState type="empty-items" onAction={onOpenAddItemModal} />;
  }

  return (
    <div className="item-grid">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onEdit={onEditItem} />
      ))}
    </div>
  );
};
