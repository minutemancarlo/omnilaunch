// Launcher Service for handling IPC calls to Electron or web fallbacks

export const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

export const launchApp = async (item) => {
  if (isElectron()) {
    return await window.electronAPI.launchApp({
      executablePath: item.executablePath,
      args: item.args || '',
      cwd: item.cwd || '',
      runInTerminal: item.runInTerminal || false,
      runAsAdmin: item.runAsAdmin || false,
    });
  } else {
    console.warn('Electron API not detected. Mocking app launch for:', item.name);
    return { success: true, mocked: true };
  }
};

export const openExternalUrl = async (url) => {
  if (isElectron()) {
    return await window.electronAPI.openExternal(url);
  } else {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    return { success: true, mocked: true };
  }
};

export const pickExecutableFile = async () => {
  if (isElectron()) {
    return await window.electronAPI.pickExecutable();
  } else {
    const mockPath = prompt('Enter executable or command path (e.g. Code.exe or C:\\Windows\\notepad.exe):', 'notepad.exe');
    if (mockPath) {
      return { filePath: mockPath, fileName: mockPath.split('\\').pop() };
    }
    return null;
  }
};

export const pickDirectory = async () => {
  if (isElectron()) {
    return await window.electronAPI.pickDirectory();
  } else {
    const mockDir = prompt('Enter working directory path:', 'C:\\Projects');
    return mockDir || null;
  }
};

export const getDiscoveredApps = async () => {
  if (isElectron()) {
    return await window.electronAPI.getDiscoveredApps();
  } else {
    return [
      { name: 'Antigravity', icon: 'sparkles', executablePath: 'C:\\Users\\Anubis\\AppData\\Local\\Programs\\antigravity\\Antigravity.exe', args: '' },
      { name: 'Microsoft Teams', icon: 'users', executablePath: 'msteams.exe', args: '' },
      { name: 'Visual Studio Code', icon: 'code', executablePath: 'Code.exe', args: '' },
      { name: 'Google Chrome', icon: 'chrome', executablePath: 'chrome.exe', args: '' },
      { name: 'Windows Terminal', icon: 'terminal', executablePath: 'wt.exe', args: '' },
      { name: 'Command Prompt', icon: 'terminal', executablePath: 'cmd.exe', args: '' },
      { name: 'PowerShell', icon: 'terminal', executablePath: 'powershell.exe', args: '' }
    ];
  }
};

export const getAppSettings = async () => {
  if (isElectron()) {
    return await window.electronAPI.getAppSettings();
  } else {
    try {
      const saved = localStorage.getItem('omnilaunch_mock_settings');
      return saved ? JSON.parse(saved) : {
        minimizeToTray: true,
        closeToTray: true,
        openAtLogin: false,
        startMinimized: false,
        globalShortcut: 'CommandOrControl+Shift+Space'
      };
    } catch {
      return {
        minimizeToTray: true,
        closeToTray: true,
        openAtLogin: false,
        startMinimized: false,
        globalShortcut: 'CommandOrControl+Shift+Space'
      };
    }
  }
};

export const saveAppSettings = async (settings) => {
  if (isElectron()) {
    return await window.electronAPI.saveAppSettings(settings);
  } else {
    localStorage.setItem('omnilaunch_mock_settings', JSON.stringify(settings));
    return { success: true };
  }
};

export const registerGlobalShortcut = async (shortcutKey) => {
  if (isElectron()) {
    return await window.electronAPI.registerGlobalShortcut(shortcutKey);
  } else {
    return { success: true, registered: true, shortcut: shortcutKey };
  }
};

export const onAppNavigate = (callback) => {
  if (isElectron()) {
    return window.electronAPI.onNavigate(callback);
  }
  return () => {};
};

export const getAppIcon = async (filePath) => {
  if (isElectron() && window.electronAPI.getAppIcon) {
    return await window.electronAPI.getAppIcon(filePath);
  }
  return null;
};

export const fetchWebsiteMetadata = async (url) => {
  if (isElectron() && window.electronAPI.fetchWebsiteMetadata) {
    return await window.electronAPI.fetchWebsiteMetadata(url);
  } else {
    // Browser mock fallback
    try {
      const clean = url.startsWith('http') ? url : `https://${url}`;
      const parsed = new URL(clean);
      return {
        title: parsed.hostname,
        iconUrl: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`,
        domain: parsed.hostname,
      };
    } catch {
      return { title: '', iconUrl: null };
    }
  }
};

export const windowControls = {
  minimize: () => {
    if (isElectron()) window.electronAPI.minimizeWindow();
  },
  maximize: () => {
    if (isElectron()) window.electronAPI.maximizeWindow();
  },
  close: () => {
    if (isElectron()) window.electronAPI.closeWindow();
  },
  isMaximized: async () => {
    if (isElectron()) return await window.electronAPI.isMaximized();
    return false;
  },
  onMaximizeChange: (cb) => {
    if (isElectron()) return window.electronAPI.onMaximizeChange(cb);
    return () => {};
  }
};
