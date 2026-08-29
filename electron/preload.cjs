const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Launching
  openExternal: (url) => ipcRenderer.invoke('launch:open-external', url),
  launchApp: (appConfig) => ipcRenderer.invoke('launch:app', appConfig),
  
  // File dialogs
  pickExecutable: () => ipcRenderer.invoke('dialog:pick-executable'),
  pickDirectory: () => ipcRenderer.invoke('dialog:pick-directory'),
  
  // App detection
  getDiscoveredApps: () => ipcRenderer.invoke('system:get-discovered-apps'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  
  // App & Website Metadata / Icons
  getAppIcon: (filePath) => ipcRenderer.invoke('system:get-app-icon', filePath),
  fetchWebsiteMetadata: (url) => ipcRenderer.invoke('metadata:fetch-website', url),

  // System Settings, Autostart & Universal Global Shortcut
  getAppSettings: () => ipcRenderer.invoke('system:get-settings'),
  saveAppSettings: (settings) => ipcRenderer.invoke('system:save-settings', settings),
  registerGlobalShortcut: (shortcutKey) => ipcRenderer.invoke('shortcut:register-global', shortcutKey),

  // Auto-Update System
  checkForUpdates: (feedUrl) => ipcRenderer.invoke('update:check', feedUrl),
  downloadUpdate: (downloadUrl) => ipcRenderer.invoke('update:download-installer', downloadUrl),
  runInstaller: (installerPath) => ipcRenderer.invoke('update:run-installer', installerPath),
  onDownloadProgress: (callback) => {
    const handler = (_event, progress) => callback(progress);
    ipcRenderer.on('update:download-progress', handler);
    return () => ipcRenderer.removeListener('update:download-progress', handler);
  },

  // System info
  getPlatform: () => process.platform,
  
  // Event listeners
  onMaximizeChange: (callback) => {
    const handler = (_event, isMax) => callback(isMax);
    ipcRenderer.on('window:maximized-change', handler);
    return () => ipcRenderer.removeListener('window:maximized-change', handler);
  },

  onNavigate: (callback) => {
    const handler = (_event, view) => callback(view);
    ipcRenderer.on('app:navigate', handler);
    return () => ipcRenderer.removeListener('app:navigate', handler);
  },
});
