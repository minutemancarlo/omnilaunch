import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Sun, Moon, Settings, Sparkles } from 'lucide-react';
import { windowControls } from '../../services/launcherService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { OmniLaunchLogo } from '../common/BrandIcons';
import { APP_VERSION } from '../../constants/version';

export const TitleBar = ({ onOpenSettings }) => {
  const [isMax, setIsMax] = useState(false);
  const {
    activeWorkspace,
    activeView,
    theme,
    toggleTheme,
    updateInfo,
    openUpdateModal,
    openChangelogModal,
  } = useWorkspace();

  useEffect(() => {
    windowControls.isMaximized().then(setIsMax);
    const unbind = windowControls.onMaximizeChange((maximized) => {
      setIsMax(maximized);
    });
    return () => unbind();
  }, []);

  return (
    <div className="titlebar">
      <div className="titlebar-brand">
        <OmniLaunchLogo size={18} />
        <span>OmniLaunch</span>
        
        {/* Clickable Version Badge */}
        <button
          type="button"
          onClick={openChangelogModal}
          title="Click to view What's New & Release Changelogs"
          className="titlebar-version-btn"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            WebkitAppRegion: 'no-drag',
          }}
        >
          <span className="titlebar-version" style={{ cursor: 'pointer' }}>
            v{APP_VERSION}
          </span>
        </button>

        {/* Update Available Indicator Badge */}
        {updateInfo?.hasUpdate && (
          <button
            type="button"
            className="titlebar-update-badge"
            onClick={openUpdateModal}
            title={`New version v${updateInfo.latestVersion} available! Click to download and install.`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: 8,
              padding: '2px 8px',
              borderRadius: 99,
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid var(--accent-primary)',
              color: '#818cf8',
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
              WebkitAppRegion: 'no-drag',
            }}
          >
            <Sparkles size={11} /> Update v{updateInfo.latestVersion}
          </button>
        )}
        {activeView === 'shortcuts' ? (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--accent-cyan)',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            • Quick Shortcuts
          </span>
        ) : activeWorkspace ? (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            •
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: activeWorkspace.color || '#10b981',
              }}
            />
            {activeWorkspace.name}
          </span>
        ) : null}
      </div>

      <div className="titlebar-controls">
        {/* Settings Button */}
        <button
          className="window-btn"
          title="OmniLaunch Settings (Hotkey, Tray, Autostart)"
          onClick={onOpenSettings}
          style={{ marginRight: 2 }}
        >
          <Settings size={13} />
        </button>

        {/* Theme Toggle Button */}
        <button
          className="window-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={toggleTheme}
          style={{ marginRight: 4 }}
        >
          {theme === 'dark' ? (
            <Sun size={14} color="#f59e0b" />
          ) : (
            <Moon size={14} color="#6366f1" />
          )}
        </button>

        <button
          className="window-btn"
          title="Minimize to Tray / Taskbar"
          onClick={windowControls.minimize}
        >
          <Minus size={14} />
        </button>
        <button
          className="window-btn"
          title={isMax ? 'Restore' : 'Maximize'}
          onClick={windowControls.maximize}
        >
          {isMax ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button
          className="window-btn close"
          title="Close (Hide to System Tray)"
          onClick={windowControls.close}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
