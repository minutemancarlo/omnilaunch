import React, { useState, useEffect, useRef } from 'react';
import { X, AppWindow, Globe, FolderOpen, Sparkles, Tag, Hash, Loader2, Check, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  pickExecutableFile,
  pickDirectory,
  getDiscoveredApps,
  getAppIcon,
  fetchWebsiteMetadata,
} from '../../services/launcherService';
import { AppIconRenderer } from '../common/BrandIcons';
import { PRESET_CATEGORIES, inferDefaultCategory } from '../../constants/categories';

const POPULAR_WEB_PRESETS = [
  { name: 'OpenProject', url: 'https://app.teligent.ph/openproject/login' },
  { name: 'Outlook Web', url: 'https://outlook.office.com' },
  { name: 'Google Music', url: 'https://music.youtube.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'ChatGPT', url: 'https://chatgpt.com' },
  { name: 'Gmail', url: 'https://mail.google.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'Figma Web', url: 'https://figma.com' },
  { name: 'Notion Web', url: 'https://notion.so' },
];

const SUGGESTED_TAGS = ['work', 'daily', 'ai', 'tools', 'cloud', 'dev', 'music', 'meeting', 'urgent'];

export const AddItemModal = ({
  isOpen,
  onClose,
  editingItem = null,
  targetType = 'workspace', // 'workspace' | 'shortcut'
}) => {
  const {
    activeWorkspace,
    addItem,
    updateItem,
    addShortcut,
    updateShortcut,
  } = useWorkspace();

  const isShortcutMode = targetType === 'shortcut';

  const [type, setType] = useState('app'); // 'app' | 'url'
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [iconDataUrl, setIconDataUrl] = useState('');

  // Detection states
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedTitle, setDetectedTitle] = useState('');
  const debounceTimerRef = useRef(null);

  // App fields
  const [executablePath, setExecutablePath] = useState('');
  const [args, setArgs] = useState('');
  const [cwd, setCwd] = useState('');
  const [runInTerminal, setRunInTerminal] = useState(false);

  // URL fields
  const [url, setUrl] = useState('');

  // General fields
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [discoveredApps, setDiscoveredApps] = useState([]);

  useEffect(() => {
    if (isOpen) {
      getDiscoveredApps().then(setDiscoveredApps);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type || 'app');
      setName(editingItem.name || '');
      setCategory(editingItem.category || inferDefaultCategory(editingItem.name || ''));
      setTags(Array.isArray(editingItem.tags) ? editingItem.tags : []);
      setTagInput('');
      setIconDataUrl(editingItem.iconDataUrl || '');
      setDetectedTitle('');
      setExecutablePath(editingItem.executablePath || '');
      setArgs(editingItem.args || '');
      setCwd(editingItem.cwd || '');
      setRunInTerminal(editingItem.runInTerminal || false);
      setUrl(editingItem.url || '');
      setDelaySeconds(editingItem.delaySeconds || 0);
    } else {
      setType('app');
      setName('');
      setCategory('General');
      setTags([]);
      setTagInput('');
      setIconDataUrl('');
      setDetectedTitle('');
      setExecutablePath('');
      setArgs('');
      setCwd('');
      setRunInTerminal(false);
      setUrl('');
      setDelaySeconds(0);
    }
  }, [editingItem, isOpen]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Detect Website Title & Favicon
  const detectWebsite = async (targetUrl) => {
    if (!targetUrl || targetUrl.trim().length < 4) return;
    setIsDetecting(true);
    try {
      const res = await fetchWebsiteMetadata(targetUrl);
      if (res) {
        if (res.title) {
          setDetectedTitle(res.title);
          // Auto-populate name if empty or default
          setName((prev) => {
            if (!prev || prev.startsWith('http') || prev.trim() === '') {
              return res.title;
            }
            return prev;
          });
          setCategory((prevCat) =>
            prevCat === 'General' ? inferDefaultCategory(res.title) : prevCat
          );
        }
        if (res.iconUrl) {
          setIconDataUrl(res.iconUrl);
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    setDetectedTitle('');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (newUrl && newUrl.includes('.')) {
      debounceTimerRef.current = setTimeout(() => {
        detectWebsite(newUrl);
      }, 700);
    }
  };

  const handleBrowseExecutable = async () => {
    const result = await pickExecutableFile();
    if (result) {
      setExecutablePath(result.filePath);
      if (!name) {
        setName(result.fileName);
        setCategory(inferDefaultCategory(result.fileName));
      }
      if (result.iconDataUrl) {
        setIconDataUrl(result.iconDataUrl);
      } else {
        const appIcon = await getAppIcon(result.filePath);
        if (appIcon) {
          setIconDataUrl(appIcon);
        }
      }
    }
  };

  const handleExecutableChange = (val) => {
    setExecutablePath(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (val && val.trim().length > 1) {
      debounceTimerRef.current = setTimeout(async () => {
        const appIcon = await getAppIcon(val.trim());
        if (appIcon) {
          setIconDataUrl(appIcon);
        }
      }, 400);
    }
  };

  const handleBrowseCwd = async () => {
    const dir = await pickDirectory();
    if (dir) {
      setCwd(dir);
    }
  };

  const handleSelectDiscoveredApp = async (app) => {
    setName(app.name);
    setExecutablePath(app.executablePath);
    if (app.args) setArgs(app.args);
    setCategory(inferDefaultCategory(app.name));

    if (app.iconDataUrl) {
      setIconDataUrl(app.iconDataUrl);
    } else {
      const appIcon = await getAppIcon(app.executablePath);
      if (appIcon) {
        setIconDataUrl(appIcon);
      } else {
        setIconDataUrl('');
      }
    }
  };

  const handleSelectWebPreset = (preset) => {
    setName(preset.name);
    setUrl(preset.url);
    setCategory(inferDefaultCategory(preset.name));
    detectWebsite(preset.url);
  };

  const handleAddTag = (tagToAdd) => {
    const clean = tagToAdd.trim().replace(/^#/, '').toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalTags = [...tags];
    if (tagInput.trim()) {
      const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (clean && !finalTags.includes(clean)) {
        finalTags.push(clean);
      }
    }

    const itemData = {
      type,
      name,
      category: category || 'General',
      tags: finalTags,
      iconDataUrl: iconDataUrl || '',
      delaySeconds: Number(delaySeconds) || 0,
      ...(type === 'app'
        ? { executablePath, args, cwd, runInTerminal }
        : { url }),
    };

    if (isShortcutMode) {
      if (editingItem) {
        updateShortcut(editingItem.id, itemData);
      } else {
        addShortcut(itemData);
      }
    } else {
      if (!activeWorkspace) return;
      if (editingItem) {
        updateItem(activeWorkspace.id, editingItem.id, itemData);
      } else {
        addItem(activeWorkspace.id, itemData);
      }
    }

    onClose();
  };

  const modalTitle = editingItem
    ? isShortcutMode
      ? 'Edit Quick Shortcut'
      : 'Edit Routine Target'
    : isShortcutMode
    ? 'Add Quick Shortcut (App or URL)'
    : `Add Target to ${activeWorkspace?.name || 'Workspace'}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type Switcher */}
            <div style={{ display: 'flex', gap: 8, padding: 4, background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className={`btn ${type === 'app' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, padding: '7px 12px' }}
                onClick={() => {
                  setType('app');
                  setIconDataUrl('');
                }}
              >
                <AppWindow size={15} />
                Desktop Application
              </button>
              <button
                type="button"
                className={`btn ${type === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1, padding: '7px 12px' }}
                onClick={() => {
                  setType('url');
                  if (url) detectWebsite(url);
                }}
              >
                <Globe size={15} />
                Website / Web App
              </button>
            </div>

            {/* Target Name */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label">Display Name *</label>
                {type === 'url' && detectedTitle && name !== detectedTitle && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                    onClick={() => setName(detectedTitle)}
                  >
                    <Check size={12} /> Use Detected Title: "{detectedTitle.length > 25 ? detectedTitle.slice(0, 25) + '…' : detectedTitle}"
                  </button>
                )}
              </div>
              <input
                type="text"
                className="form-input"
                placeholder={type === 'app' ? 'e.g. Antigravity, MS Teams, VS Code' : 'e.g. OpenProject, Outlook Web, Google Music'}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingItem && category === 'General') {
                    setCategory(inferDefaultCategory(e.target.value));
                  }
                }}
                required
              />
            </div>

            {/* Category Selector */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Tag size={13} color="var(--accent-primary)" /> Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        borderColor: isSelected ? 'transparent' : 'var(--border-subtle)',
                      }}
                      onClick={() => setCategory(cat.name)}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                          display: 'inline-block',
                        }}
                      />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Input */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Hash size={13} color="var(--accent-cyan)" /> Tags (Press Enter or comma)
              </label>
              
              {/* Active Tag Chips */}
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '11.5px',
                        fontWeight: 600,
                        backgroundColor: 'var(--accent-cyan-subtle)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                className="form-input"
                placeholder="Type tag (e.g. work, daily, ai) and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) handleAddTag(tagInput);
                }}
              />

              {/* Tag suggestions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Suggestions:</span>
                {SUGGESTED_TAGS.filter((st) => !tags.includes(st)).slice(0, 6).map((st) => (
                  <button
                    key={st}
                    type="button"
                    style={{
                      background: 'transparent',
                      border: '1px dashed var(--border-medium)',
                      color: 'var(--text-secondary)',
                      borderRadius: '4px',
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleAddTag(st)}
                  >
                    +{st}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop App Form */}
            {type === 'app' && (
              <>
                {discoveredApps.length > 0 && !editingItem && (
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} color="var(--accent-primary)" /> Quick Installed Apps
                    </label>
                    <div className="discovered-app-grid">
                      {discoveredApps.map((app) => (
                        <button
                          key={app.name}
                          type="button"
                          className="discovered-app-item"
                          onClick={() => handleSelectDiscoveredApp(app)}
                        >
                          <AppIconRenderer
                            name={app.name}
                            type="app"
                            iconDataUrl={app.iconDataUrl}
                            size={16}
                          />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Executable File / Command *</label>
                  <div className="input-with-action">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="C:\Program Files\...\app.exe or wt.exe"
                      value={executablePath}
                      onChange={(e) => handleExecutableChange(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBrowseExecutable}
                      title="Browse Executable (.exe, .bat, .cmd)"
                    >
                      <FolderOpen size={15} />
                      Browse
                    </button>
                  </div>

                  {/* App Icon Detection Preview */}
                  {executablePath && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 8,
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <AppIconRenderer
                          name={name || executablePath}
                          type="app"
                          iconDataUrl={iconDataUrl}
                          size={22}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)' }}>
                          {iconDataUrl ? 'Native App Icon Extracted' : 'Standard App Icon Assigned'}
                        </span>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                          {iconDataUrl ? 'Extracted directly from executable binary' : 'Uses high-contrast vector icon'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Launch Arguments (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. --incognito or project_dir or npm run dev"
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Working Directory (Optional)</label>
                  <div className="input-with-action">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. C:\Users\Projects\myapp"
                      value={cwd}
                      onChange={(e) => setCwd(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBrowseCwd}
                      title="Select Directory"
                    >
                      <FolderOpen size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="terminalToggle"
                    checked={runInTerminal}
                    onChange={(e) => setRunInTerminal(e.target.checked)}
                    style={{ cursor: 'pointer', width: 16, height: 16 }}
                  />
                  <label htmlFor="terminalToggle" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Run inside separate Command Prompt window (useful for CLI/scripts)
                  </label>
                </div>
              </>
            )}

            {/* Web URL Form */}
            {type === 'url' && (
              <>
                {!editingItem && (
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} color="var(--accent-cyan)" /> Quick Web Presets
                    </label>
                    <div className="discovered-app-grid">
                      {POPULAR_WEB_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          className="discovered-app-item"
                          onClick={() => handleSelectWebPreset(preset)}
                        >
                          <AppIconRenderer name={preset.name} type="url" url={preset.url} size={16} />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Website URL *</label>
                  <div className="input-with-action">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://app.teligent.ph/openproject/login"
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      onBlur={() => {
                        if (url && !detectedTitle) detectWebsite(url);
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      title="Re-detect Title & Favicon"
                      onClick={() => detectWebsite(url)}
                      disabled={isDetecting || !url}
                    >
                      {isDetecting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    </button>
                  </div>

                  {/* Real-time Website Favicon & Title Detection Card */}
                  {url.trim() && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 8,
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <AppIconRenderer
                            name={name || detectedTitle || url}
                            type="url"
                            url={url}
                            iconDataUrl={iconDataUrl}
                            size={22}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {isDetecting ? 'Fetching website icon & title...' : (detectedTitle || name || 'Website Favicon')}
                          </span>
                          <span style={{ fontSize: 10.5, color: isDetecting ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                            {isDetecting ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Loader2 size={10} className="animate-spin" /> Querying local page & favicon...
                              </span>
                            ) : (
                              'Auto-fetched and saved directly with shortcut'
                            )}
                          </span>
                        </div>
                      </div>

                      {detectedTitle && name !== detectedTitle && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: 11, padding: '4px 8px', flexShrink: 0 }}
                          onClick={() => setName(detectedTitle)}
                        >
                          Apply Title
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Stagger Delay (Only for workspace routines) */}
            {!isShortcutMode && (
              <div className="form-group">
                <label className="form-label">Stagger Delay (Seconds before launch)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  className="form-input"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Delay in seconds when triggering "Launch All" on this routine.
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Save Target' : isShortcutMode ? 'Add Shortcut' : 'Add Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
