import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Keyboard,
  Power,
  Shield,
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  History,
  RefreshCw,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getAppSettings, saveAppSettings, registerGlobalShortcut } from '../../services/launcherService';
import { APP_VERSION } from '../../constants/version';

export const SettingsModal = ({ isOpen, onClose }) => {
  const {
    theme,
    toggleTheme,
    shortcuts,
    workspaces,
    addToast,
    updateInfo,
    isCheckingUpdate,
    checkUpdates,
    openUpdateModal,
    openChangelogModal,
    updateFeedUrl,
    setUpdateFeedUrl,
    autoCheckUpdates,
    setAutoCheckUpdates,
  } = useWorkspace();

  const [settings, setSettings] = useState({
    minimizeToTray: true,
    closeToTray: true,
    openAtLogin: false,
    startMinimized: false,
    globalShortcut: 'CommandOrControl+Shift+Space',
  });

  const [recordingShortcut, setRecordingShortcut] = useState(false);
  const [shortcutKey, setShortcutKey] = useState('CommandOrControl+Shift+Space');
  const [shortcutError, setShortcutError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getAppSettings().then((s) => {
        if (s) {
          setSettings(s);
          if (s.globalShortcut) setShortcutKey(s.globalShortcut);
        }
      });
      setRecordingShortcut(false);
      setShortcutError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDownRecorder = (e) => {
    if (!recordingShortcut) return;
    e.preventDefault();
    e.stopPropagation();

    // Ignore standalone modifier presses
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }

    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    let keyName = e.key;
    if (keyName === ' ') keyName = 'Space';
    else if (keyName.length === 1) keyName = keyName.toUpperCase();

    parts.push(keyName);

    const fullShortcut = parts.join('+');
    setShortcutKey(fullShortcut);
    setRecordingShortcut(false);
  };

  const handleApplyShortcut = async (newKey) => {
    setShortcutError('');
    const res = await registerGlobalShortcut(newKey || shortcutKey);
    if (res && res.success) {
      addToast(`Universal hotkey registered: ${formatShortcutDisplay(newKey || shortcutKey)}`, 'success');
      setSettings((prev) => ({ ...prev, globalShortcut: newKey || shortcutKey }));
    } else {
      setShortcutError(res?.error || 'Shortcut registration failed or key is reserved');
      addToast('Failed to register shortcut', 'error');
    }
  };

  const handleToggleSetting = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await saveAppSettings(updated);
    addToast('Settings updated', 'success');
  };

  const formatShortcutDisplay = (acc) => {
    return (acc || '')
      .replace('CommandOrControl', 'Ctrl')
      .replace('Command', 'Ctrl');
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const data = {
      omnilaunchVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      shortcuts,
      workspaces,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnilaunch_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Backup exported successfully!', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={16} />
            </div>
            <h2 className="modal-title">OmniLaunch Settings</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 20 }}>
          {/* Universal Hotkey Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Keyboard size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Universal Global Shortcut
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Press this key combination anywhere in Windows to instantly show, restore, or hide OmniLaunch from the system tray.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  backgroundColor: recordingShortcut ? 'var(--accent-primary-subtle)' : 'var(--bg-app)',
                  border: recordingShortcut ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: recordingShortcut ? 'var(--accent-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                tabIndex={0}
                onKeyDown={handleKeyDownRecorder}
                onClick={() => setRecordingShortcut(true)}
              >
                <span>
                  {recordingShortcut
                    ? 'Press any key combination (e.g. Ctrl + Shift + Space)...'
                    : formatShortcutDisplay(shortcutKey)}
                </span>
                {recordingShortcut && (
                  <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 700 }}>
                    RECORDING...
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`btn ${recordingShortcut ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, padding: '8px 14px' }}
                onClick={() => {
                  if (recordingShortcut) {
                    setRecordingShortcut(false);
                  } else {
                    setRecordingShortcut(true);
                  }
                }}
              >
                {recordingShortcut ? 'Cancel' : 'Record'}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: 12, padding: '8px 14px' }}
                onClick={() => handleApplyShortcut()}
              >
                Save
              </button>
            </div>

            {shortcutError && (
              <span style={{ fontSize: 11, color: 'var(--accent-rose)', fontWeight: 600 }}>
                {shortcutError}
              </span>
            )}

            {/* Quick preset hotkeys */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Presets:</span>
              {[
                'CommandOrControl+Shift+Space',
                'CommandOrControl+Alt+O',
                'Alt+Space',
                'CommandOrControl+Shift+L',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setShortcutKey(preset);
                    handleApplyShortcut(preset);
                  }}
                >
                  {formatShortcutDisplay(preset)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />

          {/* System Tray & Background Behavior */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Monitor size={16} color="var(--accent-primary)" />
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                System Tray & Window Lifecycle
              </h3>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Close window to System Tray
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Clicking the X button hides OmniLaunch to the tray icon instead of quitting.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.closeToTray}
                onChange={() => handleToggleSetting('closeToTray')}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Minimize window to System Tray
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Minimizing hides OmniLaunch from the taskbar into the system notification area.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.minimizeToTray}
                onChange={() => handleToggleSetting('minimizeToTray')}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </label>
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />

          {/* Autostart on Windows Boot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Power size={16} color="var(--accent-amber)" />
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Windows Startup & Autostart
              </h3>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Launch OmniLaunch on Windows Startup
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Automatically start OmniLaunch when you log in to Windows.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.openAtLogin}
                onChange={() => handleToggleSetting('openAtLogin')}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Start Minimized to System Tray
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Runs silently in the background tray at boot without opening the main window.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.startMinimized}
                onChange={() => handleToggleSetting('startMinimized')}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </label>
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />

          {/* Software Updates & Version */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowUpCircle size={16} color="var(--accent-primary)" />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Software Updates & Version
                </h3>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 99,
                  backgroundColor: updateInfo?.hasUpdate ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  color: updateInfo?.hasUpdate ? 'var(--accent-primary)' : 'var(--accent-emerald)',
                  border: updateInfo?.hasUpdate ? '1px solid var(--accent-primary)' : '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {updateInfo?.hasUpdate ? `Update v${updateInfo.latestVersion} Available` : `v${APP_VERSION} • Up to date`}
              </span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
              OmniLaunch checks for new releases and can automatically download and launch the installer update.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 12px' }}
                onClick={() => checkUpdates(true)}
                disabled={isCheckingUpdate}
              >
                <RefreshCw size={13} className={isCheckingUpdate ? 'spinning' : ''} />
                {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 12px' }}
                onClick={openChangelogModal}
              >
                <History size={13} />
                View Release Changelog
              </button>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Automatically Check for Updates on Startup
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Notifies you in the Titlebar whenever a newer installer release is detected.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoCheckUpdates}
                onChange={(e) => setAutoCheckUpdates(e.target.checked)}
                style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </label>
          </div>

          <div style={{ height: 1, backgroundColor: 'var(--border-subtle)' }} />

          {/* Appearance & Theme */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Theme Appearance
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Active theme: {theme === 'dark' ? 'Obsidian Dark' : 'Modern Light'}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={14} color="#f59e0b" /> Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon size={14} color="#6366f1" /> Switch to Dark Mode
                </>
              )}
            </button>
          </div>

          {/* Backup & Export */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Backup Configuration
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Export all {shortcuts.length} shortcuts and {workspaces.length} workspaces as JSON.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={handleExportBackup}
            >
              <Download size={13} /> Export Backup
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
