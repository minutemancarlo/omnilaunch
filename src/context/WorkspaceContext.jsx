import React, { createContext, useContext, useState, useEffect } from 'react';
import { launchApp, openExternalUrl, onAppNavigate, getAppIcon, fetchWebsiteMetadata } from '../services/launcherService';
import { checkForUpdates } from '../services/updaterService';
import { APP_VERSION } from '../constants/version';

const WorkspaceContext = createContext(null);

const STORAGE_KEY = 'omnilaunch_workspaces_v1';
const SHORTCUTS_KEY = 'omnilaunch_shortcuts_v1';
const ACTIVE_WS_KEY = 'omnilaunch_active_workspace';
const ACTIVE_VIEW_KEY = 'omnilaunch_active_view';
const THEME_KEY = 'omnilaunch_theme';
const UPDATE_FEED_KEY = 'omnilaunch_update_feed_url';
const AUTO_UPDATE_KEY = 'omnilaunch_auto_check_updates';

export const WorkspaceProvider = ({ children }) => {
  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active View ('workspace' | 'shortcuts')
  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem(ACTIVE_VIEW_KEY) || 'shortcuts';
    } catch {
      return 'shortcuts';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_VIEW_KEY, activeView);
    } catch (e) {
      console.error('Failed to save active view:', e);
    }
  }, [activeView]);

  // Listen for navigation triggers from System Tray
  useEffect(() => {
    const unsub = onAppNavigate((view) => {
      if (view === 'shortcuts' || view === 'workspace') {
        setActiveView(view);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Standalone Quick Shortcuts list
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem(SHORTCUTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse saved shortcuts:', e);
      return [];
    }
  });

  // Persist shortcuts
  useEffect(() => {
    try {
      localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(shortcuts));
    } catch (e) {
      console.error('Failed to persist shortcuts:', e);
    }
  }, [shortcuts]);

  // Workspaces list
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse saved workspaces:', e);
      return [];
    }
  });

  // Auto-hydrate / backfill missing icons for existing shortcuts and workspace items
  useEffect(() => {
    let isMounted = true;

    const hydrateIcons = async () => {
      // 1. Hydrate shortcuts
      let shortcutsUpdated = false;
      const updatedShortcuts = await Promise.all(
        shortcuts.map(async (sc) => {
          if (!sc.iconDataUrl) {
            if (sc.type === 'app' && sc.executablePath) {
              const ico = await getAppIcon(sc.executablePath);
              if (ico) {
                shortcutsUpdated = true;
                return { ...sc, iconDataUrl: ico };
              }
            } else if (sc.type === 'url' && sc.url) {
              const meta = await fetchWebsiteMetadata(sc.url);
              if (meta?.iconUrl) {
                shortcutsUpdated = true;
                return { ...sc, iconDataUrl: meta.iconUrl };
              }
            }
          }
          return sc;
        })
      );

      if (isMounted && shortcutsUpdated) {
        setShortcuts(updatedShortcuts);
      }

      // 2. Hydrate workspace items
      let workspacesUpdated = false;
      const updatedWorkspaces = await Promise.all(
        workspaces.map(async (ws) => {
          if (!ws.items || ws.items.length === 0) return ws;
          let wsItemsUpdated = false;
          const updatedItems = await Promise.all(
            ws.items.map(async (item) => {
              if (!item.iconDataUrl) {
                if (item.type === 'app' && item.executablePath) {
                  const ico = await getAppIcon(item.executablePath);
                  if (ico) {
                    wsItemsUpdated = true;
                    return { ...item, iconDataUrl: ico };
                  }
                } else if (item.type === 'url' && item.url) {
                  const meta = await fetchWebsiteMetadata(item.url);
                  if (meta?.iconUrl) {
                    wsItemsUpdated = true;
                    return { ...item, iconDataUrl: meta.iconUrl };
                  }
                }
              }
              return item;
            })
          );
          if (wsItemsUpdated) {
            workspacesUpdated = true;
            return { ...ws, items: updatedItems };
          }
          return ws;
        })
      );

      if (isMounted && workspacesUpdated) {
        setWorkspaces(updatedWorkspaces);
      }
    };

    hydrateIcons();

    return () => {
      isMounted = false;
    };
  }, []);

  // Active Workspace
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_WS_KEY);
      return saved || null;
    } catch {
      return null;
    }
  });

  // Item Launch Status Tracker: { [itemId]: 'idle' | 'launching' | 'launched' | 'error' }
  const [launchStatuses, setLaunchStatuses] = useState({});

  // Workspace Launching State
  const [isLaunchingAll, setIsLaunchingAll] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Custom MessageBox / Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {},
  });

  const showConfirmDialog = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    onConfirm = () => {},
  }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        onConfirm();
      },
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Persist workspaces
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    } catch (e) {
      console.error('Failed to persist workspaces:', e);
    }
  }, [workspaces]);

  // Persist active workspace ID
  useEffect(() => {
    if (activeWorkspaceId) {
      localStorage.setItem(ACTIVE_WS_KEY, activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  // Ensure active workspace ID is valid when in workspace view
  useEffect(() => {
    if (workspaces.length > 0) {
      const exists = workspaces.some((ws) => ws.id === activeWorkspaceId);
      if (!exists) {
        setActiveWorkspaceId(workspaces[0].id);
      }
    } else {
      setActiveWorkspaceId(null);
    }
  }, [workspaces, activeWorkspaceId]);

  // Auto-Update & Versioning State
  const [updateFeedUrl, setUpdateFeedUrlState] = useState(() => {
    try {
      return localStorage.getItem(UPDATE_FEED_KEY) || '';
    } catch {
      return '';
    }
  });

  const [autoCheckUpdates, setAutoCheckUpdatesState] = useState(() => {
    try {
      const val = localStorage.getItem(AUTO_UPDATE_KEY);
      return val !== null ? JSON.parse(val) : true;
    } catch {
      return true;
    }
  });

  const setUpdateFeedUrl = (url) => {
    setUpdateFeedUrlState(url);
    try {
      localStorage.setItem(UPDATE_FEED_KEY, url);
    } catch (e) {
      console.error(e);
    }
  };

  const setAutoCheckUpdates = (val) => {
    setAutoCheckUpdatesState(val);
    try {
      localStorage.setItem(AUTO_UPDATE_KEY, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  const [updateInfo, setUpdateInfo] = useState({
    hasUpdate: false,
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    downloadUrl: '',
    releaseDate: '',
    releaseNotes: '',
  });
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);

  const checkUpdates = async (manual = false) => {
    setIsCheckingUpdate(true);
    try {
      const res = await checkForUpdates(updateFeedUrl);
      setUpdateInfo(res);

      if (manual) {
        setIsUpdateModalOpen(true);
      } else if (res.hasUpdate) {
        addToast(`New update available: v${res.latestVersion}!`, 'info');
      }
    } catch (err) {
      console.warn('Update check failed:', err);
      if (manual) {
        setIsUpdateModalOpen(true);
      }
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // Check for updates on startup if enabled
  useEffect(() => {
    if (autoCheckUpdates) {
      const timer = setTimeout(() => {
        checkUpdates(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoCheckUpdates]);

  const openUpdateModal = () => setIsUpdateModalOpen(true);
  const closeUpdateModal = () => setIsUpdateModalOpen(false);

  const openChangelogModal = () => setIsChangelogModalOpen(true);
  const closeChangelogModal = () => setIsChangelogModalOpen(false);

  // Toast Helper
  const addToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Standalone Shortcut Management
  const addShortcut = (itemData) => {
    const parsedTags = Array.isArray(itemData.tags)
      ? itemData.tags
      : itemData.tags
      ? itemData.tags
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean)
      : [];

    const newShortcut = {
      id: 'sc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: itemData.name.trim(),
      type: itemData.type, // 'app' | 'url'
      category: itemData.category || 'General',
      tags: parsedTags,
      executablePath: itemData.executablePath || '',
      args: itemData.args || '',
      cwd: itemData.cwd || '',
      runInTerminal: itemData.runInTerminal || false,
      runAsAdmin: itemData.runAsAdmin || false,
      url: itemData.url || '',
      iconDataUrl: itemData.iconDataUrl || '',
      delaySeconds: 0,
      createdAt: new Date().toISOString(),
    };

    setShortcuts((prev) => [...prev, newShortcut]);
    addToast(`Shortcut "${newShortcut.name}" added!`, 'success');
    return newShortcut;
  };

  const updateShortcut = (id, itemData) => {
    const updatedData = { ...itemData };
    if (itemData.tags !== undefined) {
      updatedData.tags = Array.isArray(itemData.tags)
        ? itemData.tags
        : itemData.tags
        ? itemData.tags
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean)
        : [];
    }
    setShortcuts((prev) =>
      prev.map((sc) => (sc.id === id ? { ...sc, ...updatedData, updatedAt: new Date().toISOString() } : sc))
    );
    addToast('Shortcut updated', 'success');
  };

  const deleteShortcut = (id) => {
    const sc = shortcuts.find((s) => s.id === id);
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
    addToast(`Deleted shortcut "${sc?.name || ''}"`, 'info');
  };

  const copyShortcutToWorkspace = (shortcutId, workspaceId) => {
    const sc = shortcuts.find((s) => s.id === shortcutId);
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!sc || !ws) return;

    addItem(workspaceId, {
      name: sc.name,
      type: sc.type,
      executablePath: sc.executablePath,
      args: sc.args,
      cwd: sc.cwd,
      runInTerminal: sc.runInTerminal,
      runAsAdmin: sc.runAsAdmin || false,
      url: sc.url,
      iconDataUrl: sc.iconDataUrl || '',
      delaySeconds: 0,
    });
    addToast(`Copied "${sc.name}" to workspace "${ws.name}"`, 'success');
  };

  // Workspace Management
  const createWorkspace = ({ name, description = '', color = '#10b981', icon = 'folder' }) => {
    const newWs = {
      id: 'ws_' + Date.now(),
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      items: [],
      createdAt: new Date().toISOString(),
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
    setActiveView('workspace');
    addToast(`Workspace "${newWs.name}" created!`, 'success');
    return newWs;
  };

  const updateWorkspace = (id, data) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, ...data, updatedAt: new Date().toISOString() } : ws))
    );
    addToast('Workspace updated', 'success');
  };

  const deleteWorkspace = (id) => {
    const ws = workspaces.find((w) => w.id === id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    addToast(`Deleted workspace "${ws?.name || ''}"`, 'info');
  };

  // Item Management inside Active Workspace
  const addItem = (workspaceId, itemData) => {
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: itemData.name.trim(),
      type: itemData.type, // 'app' | 'url'
      executablePath: itemData.executablePath || '',
      args: itemData.args || '',
      cwd: itemData.cwd || '',
      runInTerminal: itemData.runInTerminal || false,
      runAsAdmin: itemData.runAsAdmin || false,
      url: itemData.url || '',
      icon: itemData.icon || (itemData.type === 'app' ? 'terminal' : 'globe'),
      iconDataUrl: itemData.iconDataUrl || '',
      delaySeconds: Number(itemData.delaySeconds) || 0,
      createdAt: new Date().toISOString(),
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceId
          ? { ...ws, items: [...(ws.items || []), newItem] }
          : ws
      )
    );

    addToast(`Added "${newItem.name}" to workspace`, 'success');
    return newItem;
  };

  const updateItem = (workspaceId, itemId, itemData) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          items: ws.items.map((item) =>
            item.id === itemId ? { ...item, ...itemData } : item
          ),
        };
      })
    );
    addToast('Item updated', 'success');
  };

  const deleteItem = (workspaceId, itemId) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          items: ws.items.filter((item) => item.id !== itemId),
        };
      })
    );
    addToast('Item removed', 'info');
  };

  // Launch Individual Item / Shortcut
  const launchItem = async (item) => {
    setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'launching' }));

    try {
      if (item.type === 'app') {
        const res = await launchApp(item);
        if (res.success) {
          setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'launched' }));
          addToast(`Launched ${item.name}`, 'success');
        } else {
          setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'error' }));
          addToast(`Failed to launch ${item.name}: ${res.error || 'Unknown error'}`, 'error');
        }
      } else if (item.type === 'url') {
        const res = await openExternalUrl(item.url);
        if (res.success) {
          setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'launched' }));
          addToast(`Opened ${item.name} in browser`, 'success');
        } else {
          setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'error' }));
          addToast(`Failed to open URL: ${res.error}`, 'error');
        }
      }

      // Reset status back to idle after 4 seconds
      setTimeout(() => {
        setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'idle' }));
      }, 4000);
    } catch (err) {
      console.error('Launch item error:', err);
      setLaunchStatuses((prev) => ({ ...prev, [item.id]: 'error' }));
      addToast(`Error launching ${item.name}`, 'error');
    }
  };

  // Launch Entire Workspace (Batch 1-Click Launch)
  const launchWorkspace = async (workspaceId) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws || !ws.items || ws.items.length === 0) {
      addToast('No items in this workspace to launch', 'info');
      return;
    }

    setIsLaunchingAll(true);
    addToast(`Launching workspace "${ws.name}" (${ws.items.length} items)...`, 'info');

    for (let i = 0; i < ws.items.length; i++) {
      const item = ws.items[i];

      // Handle custom delay if specified
      if (item.delaySeconds && item.delaySeconds > 0) {
        await new Promise((resolve) => setTimeout(resolve, item.delaySeconds * 1000));
      }

      await launchItem(item);

      // Default stagger between items (300ms) to prevent OS freezing
      if (i < ws.items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsLaunchingAll(false);
    addToast(`All items in "${ws.name}" triggered!`, 'success');
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  return (
    <WorkspaceContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        shortcuts,
        addShortcut,
        updateShortcut,
        deleteShortcut,
        copyShortcutToWorkspace,
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        setActiveWorkspaceId,
        launchStatuses,
        isLaunchingAll,
        toasts,
        addToast,
        removeToast,
        confirmDialog,
        showConfirmDialog,
        closeConfirmDialog,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addItem,
        updateItem,
        deleteItem,
        launchItem,
        launchWorkspace,
        // Auto-Update & Changelog
        updateInfo,
        isCheckingUpdate,
        isUpdateModalOpen,
        isChangelogModalOpen,
        checkUpdates,
        openUpdateModal,
        closeUpdateModal,
        openChangelogModal,
        closeChangelogModal,
        updateFeedUrl,
        setUpdateFeedUrl,
        autoCheckUpdates,
        setAutoCheckUpdates,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
