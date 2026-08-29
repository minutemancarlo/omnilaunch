import React, { useState } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  AppWindow,
  Globe,
  Play,
  Edit2,
  Trash2,
  Loader2,
  Check,
  FolderPlus,
  LayoutGrid,
  List,
  Layers,
  Tag,
  Zap,
  Hash,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AppIconRenderer } from '../common/BrandIcons';
import { PRESET_CATEGORIES, getCategoryColor } from '../../constants/categories';

export const ShortcutsView = ({ onOpenAddShortcutModal, onEditShortcut }) => {
  const {
    shortcuts,
    deleteShortcut,
    launchItem,
    launchStatuses,
    workspaces,
    copyShortcutToWorkspace,
    showConfirmDialog,
  } = useWorkspace();

  const handleDeleteShortcutPrompt = (sc) => {
    showConfirmDialog({
      title: 'Delete Shortcut?',
      message: `Are you sure you want to delete "${sc.name}"?`,
      confirmText: 'Delete Shortcut',
      type: 'danger',
      onConfirm: () => deleteShortcut(sc.id),
    });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'app' | 'url'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'grouped' | 'list'
  const [assigningShortcutId, setAssigningShortcutId] = useState(null);

  // All unique tags across all shortcuts
  const allUniqueTags = Array.from(
    new Set(shortcuts.flatMap((s) => (Array.isArray(s.tags) ? s.tags : [])))
  );

  // Filter shortcuts
  const filteredShortcuts = shortcuts.filter((sc) => {
    const category = sc.category || 'General';
    const matchesCategory = selectedCategory === 'All' || category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesType = filterType === 'all' || sc.type === filterType;
    const itemTags = Array.isArray(sc.tags) ? sc.tags : [];
    const matchesTag = !selectedTag || itemTags.includes(selectedTag);

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory && matchesType && matchesTag;

    const matchesQuery =
      sc.name.toLowerCase().includes(query) ||
      (sc.executablePath && sc.executablePath.toLowerCase().includes(query)) ||
      (sc.url && sc.url.toLowerCase().includes(query)) ||
      category.toLowerCase().includes(query) ||
      itemTags.some((t) => t.toLowerCase().includes(query) || `#${t}`.includes(query));

    return matchesCategory && matchesType && matchesTag && matchesQuery;
  });

  const appCount = shortcuts.filter((s) => s.type === 'app').length;
  const urlCount = shortcuts.filter((s) => s.type === 'url').length;

  // Category counts
  const categoryCounts = PRESET_CATEGORIES.reduce((acc, cat) => {
    acc[cat.name] = shortcuts.filter((s) => (s.category || 'General').toLowerCase() === cat.name.toLowerCase()).length;
    return acc;
  }, {});

  // Grouped shortcuts
  const groupedCategories = PRESET_CATEGORIES.map((cat) => {
    const items = filteredShortcuts.filter((s) => (s.category || 'General').toLowerCase() === cat.name.toLowerCase());
    return { ...cat, items };
  }).filter((group) => group.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="workspace-header">
        <div className="workspace-meta">
          <div className="workspace-title-row">
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                backgroundColor: 'var(--accent-cyan)',
                boxShadow: '0 0 14px rgba(6, 182, 212, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Zap size={12} fill="currentColor" />
            </div>
            <h1 className="workspace-heading">Quick Shortcuts</h1>
          </div>
          <p className="workspace-description">
            Your personal launchpad with categorized & tagged single-click shortcuts for desktop applications and web tools.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={13} color="var(--accent-cyan)" /> {shortcuts.length} Total Shortcuts
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AppWindow size={13} /> {appCount} Apps
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Globe size={13} /> {urlCount} Web URLs
            </span>
          </div>
        </div>

        <div className="workspace-actions">
          <button className="btn btn-primary" onClick={onOpenAddShortcutModal}>
            <Plus size={15} />
            Add Shortcut
          </button>
        </div>
      </div>

      {/* Preset Category Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          className={`btn ${selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '8px' }}
          onClick={() => setSelectedCategory('All')}
        >
          All Categories ({shortcuts.length})
        </button>

        {PRESET_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const count = categoryCounts[cat.name] || 0;
          return (
            <button
              key={cat.id}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '11.5px',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: cat.color,
                  boxShadow: `0 0 6px ${cat.color}88`,
                }}
              />
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Active Tags Filter Row */}
      {allUniqueTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginRight: 2 }}>
            <Hash size={12} /> Filter by Tag:
          </span>
          {allUniqueTags.map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: isTagActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  backgroundColor: isTagActive ? 'var(--accent-cyan-subtle)' : 'var(--bg-card)',
                  color: isTagActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setSelectedTag(isTagActive ? null : tag)}
              >
                #{tag}
                {isTagActive && <X size={10} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Search, Type Filter & View Mode Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: 200, maxWidth: 360 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 32, height: 34, fontSize: '12px' }}
            placeholder="Search by name, path, URL, tag, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filter & Layout Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-app)', padding: 3, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', height: 26 }}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`btn ${filterType === 'app' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', height: 26 }}
              onClick={() => setFilterType('app')}
            >
              Apps
            </button>
            <button
              className={`btn ${filterType === 'url' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '11px', padding: '4px 10px', height: 26 }}
              onClick={() => setFilterType('url')}
            >
              Web URLs
            </button>
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-app)', padding: 3, borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ padding: '4px 8px', height: 26 }}
              title="Grid View"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              className={`btn ${viewMode === 'grouped' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ padding: '4px 8px', height: 26 }}
              title="Grouped by Category View"
              onClick={() => setViewMode('grouped')}
            >
              <Layers size={13} />
            </button>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ padding: '4px 8px', height: 26 }}
              title="Compact List View"
              onClick={() => setViewMode('list')}
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {shortcuts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ backgroundColor: 'var(--accent-cyan-subtle)', color: 'var(--accent-cyan)' }}>
            <Sparkles size={28} />
          </div>
          <h2 className="empty-title">Your Shortcuts Collection is Clean</h2>
          <p className="empty-description">
            Add single-click shortcuts for your favorite desktop applications and websites to organize them with preset categories and custom tags.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={onOpenAddShortcutModal}>
              <Plus size={15} />
              Add Custom Shortcut
            </button>
          </div>
        </div>
      ) : filteredShortcuts.length === 0 ? (
        <div className="empty-state" style={{ padding: '36px 20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
            No shortcuts match your active search or filters
          </h3>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 8 }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTag(null);
              setFilterType('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped by Category View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {groupedCategories.map((group) => (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: group.color,
                    boxShadow: `0 0 8px ${group.color}88`,
                  }}
                />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{group.name}</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({group.items.length})</span>
              </div>

              <div className="item-grid">
                {group.items.map((sc) => renderShortcutCard(sc))}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'list' ? (
        /* Compact List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filteredShortcuts.map((sc) => renderShortcutListItem(sc))}
        </div>
      ) : (
        /* Default Grid View */
        <div className="item-grid">
          {filteredShortcuts.map((sc) => renderShortcutCard(sc))}
        </div>
      )}
    </div>
  );

  function renderShortcutCard(sc) {
    const status = launchStatuses[sc.id] || 'idle';
    const isApp = sc.type === 'app';
    const isAssigning = assigningShortcutId === sc.id;
    const catColor = getCategoryColor(sc.category);
    const tags = Array.isArray(sc.tags) ? sc.tags : [];

    return (
      <div key={sc.id} className="item-card">
        <div className="item-card-top">
          <div className="item-header">
            <div className="item-icon-wrapper">
              <AppIconRenderer name={sc.name} type={sc.type} url={sc.url} iconDataUrl={sc.iconDataUrl} size={22} />
            </div>
            <div className="item-title-col">
              <h3 className="item-name" title={sc.name}>{sc.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: catColor,
                    backgroundColor: `${catColor}18`,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: catColor }} />
                  {sc.category || 'General'}
                </span>
                <span className="item-type-badge">
                  • {isApp ? (sc.runInTerminal ? 'Terminal' : 'App') : 'URL'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {workspaces.length > 0 && (
              <button
                className="btn btn-ghost btn-icon"
                title="Add to a Workspace Routine"
                onClick={() => setAssigningShortcutId(isAssigning ? null : sc.id)}
                style={{ color: isAssigning ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
              >
                <FolderPlus size={14} />
              </button>
            )}

            <button
              className="btn btn-ghost btn-icon"
              title="Edit Shortcut"
              onClick={() => onEditShortcut(sc)}
            >
              <Edit2 size={13} />
            </button>
            <button
              className="btn btn-ghost btn-icon"
              title="Delete Shortcut"
              onClick={() => handleDeleteShortcutPrompt(sc)}
              style={{ color: 'var(--accent-rose)' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Tags Row */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: -4 }}>
            {tags.map((t) => {
              const isTagActive = selectedTag === t;
              return (
                <span
                  key={t}
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    color: isTagActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    backgroundColor: isTagActive ? 'var(--accent-cyan-subtle)' : 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTag(isTagActive ? null : t)}
                  title={`Filter by #${t}`}
                >
                  #{t}
                </span>
              );
            })}
          </div>
        )}

        {/* Workspace assignment drawer */}
        {isAssigning && (
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-medium)',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Add to Workspace Routine:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  onClick={() => {
                    copyShortcutToWorkspace(sc.id, ws.id);
                    setAssigningShortcutId(null);
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: ws.color || '#10b981',
                      display: 'inline-block',
                      marginRight: 4,
                    }}
                  />
                  {ws.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="item-target-path" title={isApp ? sc.executablePath : sc.url}>
          {isApp ? sc.executablePath || 'Desktop App' : sc.url}
        </div>

        <div className="item-card-footer">
          <div className="item-status-tag">
            <span className={`status-dot ${status}`} />
            <span>
              {status === 'idle' && 'Ready'}
              {status === 'launching' && 'Launching...'}
              {status === 'launched' && 'Launched'}
              {status === 'error' && 'Error'}
            </span>
          </div>

          <button
            className={`btn ${status === 'launched' ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => launchItem(sc)}
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
  }

  function renderShortcutListItem(sc) {
    const status = launchStatuses[sc.id] || 'idle';
    const isApp = sc.type === 'app';
    const catColor = getCategoryColor(sc.category);
    const tags = Array.isArray(sc.tags) ? sc.tags : [];

    return (
      <div
        key={sc.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          gap: 12,
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          <div className="item-icon-wrapper" style={{ width: 34, height: 34 }}>
            <AppIconRenderer name={sc.name} type={sc.type} url={sc.url} iconDataUrl={sc.iconDataUrl} size={18} />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {sc.name}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: catColor,
                  backgroundColor: `${catColor}18`,
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                {sc.category || 'General'}
              </span>

              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1px 5px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                >
                  #{t}
                </span>
              ))}
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: 480,
                marginTop: 2,
              }}
            >
              {isApp ? sc.executablePath : sc.url}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="btn btn-ghost btn-icon"
            title="Edit Shortcut"
            onClick={() => onEditShortcut(sc)}
            style={{ width: 28, height: 28 }}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            title="Delete Shortcut"
            onClick={() => handleDeleteShortcutPrompt(sc)}
            style={{ width: 28, height: 28, color: 'var(--accent-rose)' }}
          >
            <Trash2 size={13} />
          </button>
          <button
            className={`btn ${status === 'launched' ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '5px 12px', fontSize: '11.5px', height: 28 }}
            onClick={() => launchItem(sc)}
            disabled={status === 'launching'}
          >
            {status === 'launching' ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <Play size={12} fill="currentColor" /> Launch
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
};
