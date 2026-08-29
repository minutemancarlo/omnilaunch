const { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let splashWindow = null;
let tray = null;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

// Settings file path
const settingsPath = path.join(app.getPath('userData'), 'omnilaunch_app_settings.json');

// Default Settings
const defaultSettings = {
  minimizeToTray: true,
  closeToTray: true,
  openAtLogin: false,
  startMinimized: false,
  globalShortcut: 'CommandOrControl+Shift+Space',
};

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      return { ...defaultSettings, ...data };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return { ...defaultSettings };
}

let appSettings = loadSettings();

function saveSettings(newSettings) {
  try {
    appSettings = { ...appSettings, ...newSettings };
    fs.writeFileSync(settingsPath, JSON.stringify(appSettings, null, 2));

    // Sync autostart
    app.setLoginItemSettings({
      openAtLogin: appSettings.openAtLogin,
      openAsHidden: appSettings.startMinimized,
    });

    // Sync global shortcut
    registerUniversalShortcut(appSettings.globalShortcut);

    return { success: true, settings: appSettings };
  } catch (err) {
    console.error('Failed to save settings:', err);
    return { success: false, error: err.message };
  }
}

function toggleWindow() {
  if (!mainWindow) return;

  if (mainWindow.isVisible() && !mainWindow.isMinimized() && mainWindow.isFocused()) {
    mainWindow.hide();
  } else {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}

function registerUniversalShortcut(shortcutKey) {
  try {
    globalShortcut.unregisterAll();
    if (!shortcutKey || shortcutKey.trim() === '') {
      return { success: true, registered: false };
    }

    const registered = globalShortcut.register(shortcutKey.trim(), () => {
      toggleWindow();
    });

    if (!registered) {
      console.warn('Failed to register global shortcut:', shortcutKey);
      return { success: false, error: 'Shortcut already in use by system or invalid' };
    }

    return { success: true, registered: true, shortcut: shortcutKey };
  } catch (err) {
    console.error('Error registering global shortcut:', err);
    return { success: false, error: err.message };
  }
}

function createTray() {
  if (tray) return;

  const trayPngPath = path.join(__dirname, '../public/tray-icon.png');
  const icoPath = path.join(__dirname, '../public/icon.ico');
  const svgPath = path.join(__dirname, '../public/icon.svg');

  let trayIcon;
  try {
    if (fs.existsSync(trayPngPath)) {
      trayIcon = nativeImage.createFromPath(trayPngPath);
    } else if (fs.existsSync(icoPath)) {
      trayIcon = nativeImage.createFromPath(icoPath);
    } else {
      trayIcon = nativeImage.createFromPath(svgPath);
    }
  } catch (e) {
    console.error('Error loading tray icon:', e);
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('OmniLaunch — Workspace & App Orchestrator');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show OmniLaunch',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quick Shortcuts',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.webContents.send('app:navigate', 'shortcuts');
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Workspaces',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.webContents.send('app:navigate', 'workspace');
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit OmniLaunch',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    toggleWindow();
  });

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createSplashWindow() {
  const icoPath = path.join(__dirname, '../public/icon.ico');
  const pngPath = path.join(__dirname, '../public/tray-icon.png');
  const svgPath = path.join(__dirname, '../public/icon.svg');

  const windowIcon = fs.existsSync(icoPath)
    ? icoPath
    : fs.existsSync(pngPath)
    ? pngPath
    : svgPath;

  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    icon: windowIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));

  splashWindow.on('closed', () => {
    splashWindow = null;
  });

  // Safety fallback: close splash after 5 seconds if main window load takes long
  setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      if (mainWindow && !mainWindow.isDestroyed() && !appSettings.startMinimized) {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  }, 5000);
}

function createWindow() {
  const icoPath = path.join(__dirname, '../public/icon.ico');
  const pngPath = path.join(__dirname, '../public/icon.png');
  const svgPath = path.join(__dirname, '../public/icon.svg');

  const windowIcon = fs.existsSync(icoPath)
    ? icoPath
    : fs.existsSync(pngPath)
    ? pngPath
    : svgPath;

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0c0f14',
    icon: windowIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    // Always display emerald splash screen for 1.8s visual intro
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }

      if (appSettings.startMinimized) {
        // Silently minimized to system tray with notification balloon
        if (tray && process.platform === 'win32') {
          try {
            tray.displayBalloon({
              title: 'OmniLaunch Active',
              content: 'OmniLaunch is minimized in your system tray. Use your shortcut or click the tray icon to open.',
              iconType: 'info',
            });
          } catch (e) {}
        }
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }, 1800);
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximized-change', false);
  });

  mainWindow.on('minimize', (event) => {
    if (appSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && appSettings.closeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createTray();
  // Always show splash screen when app launches
  createSplashWindow();
  createWindow();
  registerUniversalShortcut(appSettings.globalShortcut);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && (!appSettings.closeToTray || isQuitting)) {
    app.quit();
  }
});

// IPC Handlers

// 1. Open External URL in default browser
ipcMain.handle('launch:open-external', async (_event, url) => {
  try {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    await shell.openExternal(targetUrl);
    return { success: true };
  } catch (error) {
    console.error('Failed to open URL:', error);
    return { success: false, error: error.message };
  }
});

// 2. Launch Desktop App / Executable / Script
ipcMain.handle('launch:app', async (_event, appConfig) => {
  try {
    const { executablePath, args = '', cwd = '', runInTerminal = false, runAsAdmin = false } = appConfig;

    if (!executablePath) {
      throw new Error('Executable path is required');
    }

    let trimmedPath = executablePath.replace(/^["']|["']$/g, '').trim();

    // If it's a protocol link or URL
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      await shell.openExternal(trimmedPath);
      return { success: true };
    }

    // Windows 11 compatibility: fix 'msteams.exe' -> 'ms-teams.exe'
    if (trimmedPath.toLowerCase() === 'msteams.exe' || trimmedPath.toLowerCase() === 'teams.exe') {
      trimmedPath = 'ms-teams.exe';
    }

    // If runAsAdmin is requested, elevate with Windows UAC (Verb RunAs)
    if (runAsAdmin && process.platform === 'win32') {
      const workingDir = cwd && fs.existsSync(cwd) ? cwd.trim() : '';
      let targetFile = trimmedPath;
      let targetArgs = args ? args.trim() : '';

      if (runInTerminal) {
        targetFile = 'cmd.exe';
        targetArgs = `/k ""${trimmedPath}" ${targetArgs}"`.trim();
      }

      const escapedPath = targetFile.replace(/'/g, "''");
      let psCommand = `Start-Process -FilePath '${escapedPath}'`;
      if (targetArgs) {
        const escapedArgs = targetArgs.replace(/'/g, "''");
        psCommand += ` -ArgumentList '${escapedArgs}'`;
      }
      if (workingDir) {
        const escapedCwd = workingDir.replace(/'/g, "''");
        psCommand += ` -WorkingDirectory '${escapedCwd}'`;
      }
      psCommand += ` -Verb RunAs`;

      exec(`powershell.exe -NoProfile -NonInteractive -Command "${psCommand}"`, (adminErr) => {
        if (adminErr) {
          console.warn('RunAs Admin execution failed:', adminErr.message);
        }
      });
      return { success: true };
    }

    // If runInTerminal is requested (e.g. for CLI commands or scripts)
    if (runInTerminal && process.platform === 'win32') {
      const workingDir = cwd && fs.existsSync(cwd) ? cwd.trim() : undefined;
      const fullCmd = `start cmd.exe /k ""${trimmedPath}" ${args}"`;
      exec(fullCmd, { cwd: workingDir });
      return { success: true };
    }

    // For .lnk shortcuts or files without arguments, use native shell.openPath
    if (!args && (trimmedPath.toLowerCase().endsWith('.lnk') || (path.isAbsolute(trimmedPath) && fs.existsSync(trimmedPath)))) {
      const openErr = await shell.openPath(trimmedPath);
      if (!openErr) {
        return { success: true };
      }
      console.warn('shell.openPath returned warning, trying spawn fallback:', openErr);
    }

    // Use exec / spawn with Windows shell start for robust execution with spaces and PATH commands
    const workingDir = cwd && fs.existsSync(cwd) ? cwd.trim() : undefined;
    const launchCmd = args ? `start "" "${trimmedPath}" ${args}` : `start "" "${trimmedPath}"`;

    exec(launchCmd, { cwd: workingDir }, (execErr) => {
      if (execErr) {
        console.warn('exec start failed, falling back to direct spawn:', execErr.message);
        const parsedArgs = args ? args.split(' ').filter((a) => a.length > 0) : [];
        const child = spawn(`"${trimmedPath}"`, parsedArgs, {
          cwd: workingDir,
          detached: true,
          stdio: 'ignore',
          shell: true,
        });
        child.unref();
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to launch application:', error);
    return { success: false, error: error.message };
  }
});

// 3. Pick Executable File
ipcMain.handle('dialog:pick-executable', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Executable or Application Shortcut',
    properties: ['openFile'],
    filters: [
      { name: 'Executables & Scripts', extensions: ['exe', 'bat', 'cmd', 'lnk', 'ps1'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const filePath = result.filePaths[0];
  const fileName = path.basename(filePath, path.extname(filePath));
  const iconDataUrl = await getFileIconDataUrl(filePath);
  return {
    filePath,
    fileName,
    iconDataUrl: iconDataUrl || '',
  };
});

// 4. Pick Directory
ipcMain.handle('dialog:pick-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Working Directory',
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// 5. Discover Common Installed Windows Applications
ipcMain.handle('system:get-discovered-apps', async () => {
  const discovered = [];
  const localAppData = process.env.LOCALAPPDATA || '';
  const appData = process.env.APPDATA || '';
  const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

  const commonApps = [
    {
      name: 'Antigravity',
      icon: 'sparkles',
      paths: [
        path.join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe'),
        path.join(localAppData, 'antigravity', 'Antigravity.exe'),
        path.join(programFiles, 'Antigravity', 'Antigravity.exe'),
      ],
    },
    {
      name: 'Microsoft Teams',
      icon: 'users',
      paths: [
        path.join(localAppData, 'Microsoft', 'WindowsApps', 'ms-teams.exe'),
        path.join(localAppData, 'Microsoft', 'Teams', 'current', 'Teams.exe'),
        path.join(localAppData, 'Microsoft', 'Teams', 'Update.exe'),
        path.join(programFiles, 'Microsoft', 'Teams', 'current', 'Teams.exe'),
        'msteams.exe',
        'teams.exe',
      ],
      args: '',
    },
    {
      name: 'Visual Studio Code',
      icon: 'code',
      paths: [
        path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
        path.join(programFiles, 'Microsoft VS Code', 'Code.exe'),
      ],
    },
    {
      name: 'Google Chrome',
      icon: 'chrome',
      paths: [
        path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      ],
    },
    {
      name: 'Microsoft Edge',
      icon: 'globe',
      paths: [
        path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      ],
    },
    {
      name: 'Brave Browser',
      icon: 'globe',
      paths: [
        path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
        path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      ],
    },
    {
      name: 'Discord',
      icon: 'message-square',
      paths: [path.join(localAppData, 'Discord', 'Update.exe')],
      args: '--processStart Discord.exe',
    },
    {
      name: 'Spotify',
      icon: 'music',
      paths: [path.join(appData, 'Spotify', 'Spotify.exe')],
    },
    {
      name: 'Slack',
      icon: 'hash',
      paths: [
        path.join(localAppData, 'slack', 'slack.exe'),
        path.join(programFiles, 'Slack', 'slack.exe'),
      ],
    },
    {
      name: 'Notion',
      icon: 'file-text',
      paths: [path.join(localAppData, 'Programs', 'Notion', 'Notion.exe')],
    },
    {
      name: 'Figma',
      icon: 'layout',
      paths: [
        path.join(localAppData, 'Figma', 'Figma.exe'),
        path.join(localAppData, 'Programs', 'Figma', 'Figma.exe'),
      ],
    },
    {
      name: 'Obsidian',
      icon: 'book-open',
      paths: [path.join(localAppData, 'Programs', 'obsidian', 'Obsidian.exe')],
    },
    {
      name: 'Windows Terminal',
      icon: 'terminal',
      paths: [
        path.join(localAppData, 'Microsoft', 'WindowsApps', 'wt.exe'),
        'wt.exe',
      ],
    },
    {
      name: 'Command Prompt',
      icon: 'terminal',
      paths: ['C:\\Windows\\System32\\cmd.exe', 'cmd.exe'],
    },
    {
      name: 'PowerShell',
      icon: 'terminal',
      paths: ['C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'powershell.exe'],
    },
  ];

  for (const appItem of commonApps) {
    let matchedPath = null;
    for (const testPath of appItem.paths) {
      if (
        testPath.includes('WindowsApps') ||
        testPath === 'wt.exe' ||
        testPath === 'cmd.exe' ||
        testPath === 'powershell.exe' ||
        testPath === 'msteams.exe' ||
        testPath === 'teams.exe'
      ) {
        matchedPath = testPath;
        break;
      } else if (fs.existsSync(testPath)) {
        matchedPath = testPath;
        break;
      }
    }

    if (matchedPath) {
      const iconDataUrl = await getFileIconDataUrl(matchedPath);
      discovered.push({
        name: appItem.name,
        icon: appItem.icon,
        executablePath: matchedPath,
        iconDataUrl: iconDataUrl || '',
        args: appItem.args || '',
      });
    }
  }

  return discovered;
});

// 6. Window Controls
ipcMain.handle('window:minimize', () => {
  if (mainWindow) {
    if (appSettings.minimizeToTray) {
      mainWindow.hide();
    } else {
      mainWindow.minimize();
    }
  }
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) {
    if (appSettings.closeToTray) {
      mainWindow.hide();
    } else {
      mainWindow.close();
    }
  }
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// 7. System Settings & Autostart IPC
ipcMain.handle('system:get-settings', async () => {
  const loginSettings = app.getLoginItemSettings();
  return {
    ...appSettings,
    openAtLogin: loginSettings.openAtLogin,
  };
});

ipcMain.handle('system:save-settings', async (_event, newSettings) => {
  return saveSettings(newSettings);
});

ipcMain.handle('shortcut:register-global', async (_event, shortcutKey) => {
  const res = registerUniversalShortcut(shortcutKey);
  if (res.success) {
    saveSettings({ globalShortcut: shortcutKey });
  }
  return res;
});

const iconCache = new Map();

function extractIconViaPowerShell(targetPath) {
  return new Promise((resolve) => {
    try {
      const escapedPath = targetPath.replace(/'/g, "''");
      const psCmd = `Add-Type -AssemblyName System.Drawing; $ico = [System.Drawing.Icon]::ExtractAssociatedIcon('${escapedPath}'); if ($ico) { $ms = New-Object System.IO.MemoryStream; $ico.ToBitmap().Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); [Convert]::ToBase64String($ms.ToArray()) }`;
      exec(`powershell -NoProfile -NonInteractive -Command "${psCmd}"`, { timeout: 3500 }, (err, stdout) => {
        if (!err && stdout && stdout.trim().length > 100) {
          const base64 = stdout.trim().replace(/\r?\n/g, '');
          if (!base64.startsWith('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAByklEQVRYhe1WQUoDQRCs2Sh4')) {
            return resolve(`data:image/png;base64,${base64}`);
          }
        }
        resolve(null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

// Helper: Safely extract Windows file icon
async function getFileIconDataUrl(filePath) {
  try {
    if (!filePath || typeof filePath !== 'string') return null;
    let resolved = filePath.replace(/^["']|["']$/g, '').trim();
    if (!resolved) return null;

    if (iconCache.has(resolved)) {
      return iconCache.get(resolved);
    }

    const localAppData = process.env.LOCALAPPDATA || '';
    const winDir = process.env.WINDIR || 'C:\\Windows';

    // List of candidates to probe
    const candidates = [resolved];

    // If not absolute path, check common locations
    if (!path.isAbsolute(resolved)) {
      const lower = resolved.toLowerCase();
      if (lower.includes('team') || lower === 'msteams.exe' || lower === 'teams.exe' || lower === 'ms-teams.exe') {
        candidates.unshift(
          path.join(localAppData, 'Microsoft', 'WindowsApps', 'ms-teams.exe'),
          path.join(localAppData, 'Microsoft', 'Teams', 'current', 'Teams.exe'),
          path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft', 'Teams', 'current', 'Teams.exe')
        );
      } else if (lower === 'wt.exe' || lower === 'wt') {
        candidates.unshift(
          path.join(localAppData, 'Microsoft', 'WindowsApps', 'wt.exe')
        );
      } else if (lower === 'cmd.exe' || lower === 'cmd') {
        candidates.unshift(path.join(winDir, 'System32', 'cmd.exe'));
      } else if (lower === 'powershell.exe' || lower === 'powershell') {
        candidates.unshift(path.join(winDir, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'));
      } else if (lower === 'notepad.exe' || lower === 'notepad') {
        candidates.unshift(
          path.join(localAppData, 'Microsoft', 'WindowsApps', 'notepad.exe'),
          path.join(winDir, 'System32', 'notepad.exe')
        );
      }

      // Check System32 as general fallback for relative exes
      candidates.push(path.join(winDir, 'System32', resolved));
      if (!resolved.toLowerCase().endsWith('.exe')) {
        candidates.push(path.join(winDir, 'System32', `${resolved}.exe`));
      }
    }

    // 1. Primary: PowerShell .NET ExtractAssociatedIcon (100% accurate, extracts true binary icon)
    for (const testCandidate of candidates) {
      const psIcon = await extractIconViaPowerShell(testCandidate);
      if (psIcon) {
        iconCache.set(resolved, psIcon);
        return psIcon;
      }
    }

    // 2. Fallback: Try Electron's native getFileIcon
    for (const testCandidate of candidates) {
      try {
        const nativeImg = await app.getFileIcon(testCandidate, { size: 'large' });
        if (nativeImg && !nativeImg.isEmpty()) {
          const dataUrl = nativeImg.toDataURL();
          if (!dataUrl.includes('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAByklEQVRYhe1WQUoDQRCs2Sh4')) {
            iconCache.set(resolved, dataUrl);
            return dataUrl;
          }
        }
      } catch (err) {
        // Continue to next candidate
      }
    }
  } catch (e) {
    console.warn('Could not extract file icon:', e.message);
  }
  return null;
}

// 8. Extract Native App Icon from Executable
ipcMain.handle('system:get-app-icon', async (_event, filePath) => {
  return await getFileIconDataUrl(filePath);
});

// 9. Fetch Website Metadata (Title & Favicon Data URL)
ipcMain.handle('metadata:fetch-website', async (_event, targetUrl) => {
  if (!targetUrl || typeof targetUrl !== 'string') return { title: '', iconUrl: null };
  try {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsedUrl = new URL(cleanUrl);
    const origin = parsedUrl.origin;

    let html = '';
    let finalUrl = cleanUrl;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(cleanUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);
      finalUrl = response.url || cleanUrl;
      html = await response.text();
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.warn('Direct HTML fetch error:', fetchErr.message);
    }

    let title = '';
    let foundIconUrl = '';

    if (html) {
      // 1. Extract Title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      } else {
        const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          title = ogTitleMatch[1].trim();
        }
      }

      // 2. Extract Favicon
      const linkMatches = [
        /<link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
        /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["']/i,
      ];

      for (const rx of linkMatches) {
        const m = html.match(rx);
        if (m && m[1]) {
          let href = m[1].trim();
          if (href.startsWith('//')) {
            foundIconUrl = parsedUrl.protocol + href;
          } else if (href.startsWith('/')) {
            foundIconUrl = origin + href;
          } else if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('data:')) {
            foundIconUrl = new URL(href, finalUrl).href;
          } else {
            foundIconUrl = href;
          }
          break;
        }
      }
    }

    if (!foundIconUrl) {
      foundIconUrl = `${origin}/favicon.ico`;
    }

    // Try downloading the icon directly into base64 data URL
    let iconDataUrl = null;
    if (foundIconUrl.startsWith('data:')) {
      iconDataUrl = foundIconUrl;
    } else {
      try {
        const iconController = new AbortController();
        const iconTimeout = setTimeout(() => iconController.abort(), 4000);
        const iconRes = await fetch(foundIconUrl, {
          signal: iconController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
        });
        clearTimeout(iconTimeout);
        if (iconRes.ok) {
          const contentType = iconRes.headers.get('content-type') || 'image/x-icon';
          const arrayBuffer = await iconRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          iconDataUrl = `data:${contentType};base64,${base64}`;
        }
      } catch (iconErr) {
        // Fall back to Google S2
        iconDataUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
      }
    }

    if (!iconDataUrl) {
      iconDataUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    }

    if (title) {
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .trim();
    }

    return {
      title,
      iconUrl: iconDataUrl,
      domain: parsedUrl.hostname,
    };
  } catch (err) {
    console.error('Failed to fetch website metadata:', err);
    return { title: '', iconUrl: null };
  }
});

// 10. Auto-Update System IPC Handlers
function isNewerVersion(remote, local) {
  if (!remote || !local) return false;
  const parse = (v) => v.replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0);
  const r = parse(remote);
  const l = parse(local);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const rPart = r[i] || 0;
    const lPart = l[i] || 0;
    if (rPart > lPart) return true;
    if (rPart < lPart) return false;
  }
  return false;
}

ipcMain.handle('update:check', async (_event, customFeedUrl) => {
  const currentVersion = app.getVersion();
  // Default update feed URL (can be customized via settings)
  const feedUrl = customFeedUrl && customFeedUrl.trim()
    ? customFeedUrl.trim()
    : 'https://raw.githubusercontent.com/minutemancarlo/omnilaunch/main/version.json';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const headers = {
      'User-Agent': `OmniLaunch/${currentVersion} (Windows)`,
      'Accept': 'application/json, text/plain',
    };
    if (appSettings.githubToken) {
      headers['Authorization'] = `token ${appSettings.githubToken.trim()}`;
    }

    let res = await fetch(feedUrl, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeout);

    // Fallback: If 404, try the GitHub Releases API directly
    if (!res.ok && res.status === 404 && !customFeedUrl) {
      try {
        const ghApiUrl = 'https://api.github.com/repos/minutemancarlo/omnilaunch/releases/latest';
        const ghRes = await fetch(ghApiUrl, { headers });
        if (ghRes.ok) {
          res = ghRes;
        }
      } catch (ghErr) {}
    }

    if (!res.ok) {
      return {
        hasUpdate: false,
        currentVersion,
        error: res.status === 404
          ? 'HTTP 404 — Your GitHub repository is currently set to Private. Make it Public in GitHub Settings (or provide a GitHub Token in OmniLaunch Settings).'
          : `Server responded with HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    let latestVersion = '';
    let downloadUrl = '';
    let releaseDate = '';
    let releaseNotes = '';

    // Handle GitHub API Release format
    if (data.tag_name) {
      latestVersion = data.tag_name.replace(/^v/, '');
      releaseDate = data.published_at ? new Date(data.published_at).toLocaleDateString() : '';
      releaseNotes = data.body || '';
      const exeAsset = data.assets && data.assets.find((a) => a.name.toLowerCase().endsWith('.exe') && !a.name.toLowerCase().endsWith('.blockmap'));
      const msiAsset = data.assets && data.assets.find((a) => a.name.toLowerCase().endsWith('.msi'));
      const targetAsset = exeAsset || msiAsset;
      downloadUrl = targetAsset ? (appSettings.githubToken ? targetAsset.url : targetAsset.browser_download_url) : '';
    } else {
      // Standard version.json manifest format
      latestVersion = (data.version || '').replace(/^v/, '');
      downloadUrl = data.downloadUrl || data.url || '';
      releaseDate = data.releaseDate || data.date || '';
      releaseNotes = data.releaseNotes || data.changelog || '';
    }

    const hasUpdate = isNewerVersion(latestVersion, currentVersion);

    return {
      hasUpdate,
      currentVersion,
      latestVersion: latestVersion || currentVersion,
      downloadUrl,
      releaseDate,
      releaseNotes,
    };
  } catch (err) {
    // If the remote manifest is not reachable or user is offline
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      error: err.message,
    };
  }
});

ipcMain.handle('update:download-installer', async (event, downloadUrl) => {
  if (!downloadUrl) {
    return { success: false, error: 'No download URL provided' };
  }

  try {
    const ext = downloadUrl.toLowerCase().endsWith('.exe') ? '.exe' : '.msi';
    const updatesDir = path.join(app.getPath('userData'), 'pending-updates');
    if (!fs.existsSync(updatesDir)) {
      fs.mkdirSync(updatesDir, { recursive: true });
    }
    const tempPath = path.join(updatesDir, `OmniLaunch-Setup-${Date.now()}${ext}`);
    const fileStream = fs.createWriteStream(tempPath);

    const headers = {
      'User-Agent': `OmniLaunch/${app.getVersion()} (Windows)`,
    };
    if (appSettings.githubToken) {
      headers['Authorization'] = `token ${appSettings.githubToken.trim()}`;
    }
    if (downloadUrl.includes('api.github.com')) {
      headers['Accept'] = 'application/octet-stream';
    }

    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      return { success: false, error: `Download failed with HTTP ${response.status}` };
    }

    const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
    let transferredBytes = 0;

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      transferredBytes += value.length;
      fileStream.write(Buffer.from(value));

      const percent = totalBytes > 0 ? Math.round((transferredBytes / totalBytes) * 100) : 0;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update:download-progress', {
          percent,
          transferredBytes,
          totalBytes,
        });
      }
    }

    // Wait for the stream to completely finish flushing and close file handle
    await new Promise((resolve, reject) => {
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      });
      fileStream.on('error', reject);
      fileStream.end();
    });

    return {
      success: true,
      filePath: tempPath,
    };
  } catch (err) {
    console.error('Failed to download update installer:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('update:run-installer', async (_event, installerPath) => {
  if (!installerPath || !fs.existsSync(installerPath)) {
    return { success: false, error: 'Installer file not found on disk' };
  }

  try {
    // Release OS file handle locks before launching
    await new Promise((r) => setTimeout(r, 600));

    const isMsi = installerPath.toLowerCase().endsWith('.msi');

    if (process.platform === 'win32') {
      if (isMsi) {
        // Direct spawn without cmd.exe /c quote-mangling
        const child = spawn('msiexec.exe', ['/i', installerPath], {
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
      } else {
        // Direct spawn for NSIS executable installer
        const child = spawn(installerPath, [], {
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
      }
    } else {
      await shell.openPath(installerPath);
    }

    // Give installer process time to spawn, then gracefully exit
    setTimeout(() => {
      isQuitting = true;
      app.quit();
    }, 1200);

    return { success: true };
  } catch (err) {
    console.error('Failed to execute installer:', err);
    return { success: false, error: err.message };
  }
});


