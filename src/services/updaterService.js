import { isElectron } from './launcherService';
import { APP_VERSION } from '../constants/version';

export const checkForUpdates = async (customFeedUrl = '') => {
  if (isElectron() && window.electronAPI.checkForUpdates) {
    return await window.electronAPI.checkForUpdates(customFeedUrl);
  }
  return {
    hasUpdate: false,
    currentVersion: APP_VERSION,
    latestVersion: APP_VERSION,
    mocked: true,
  };
};

export const downloadUpdateInstaller = async (downloadUrl) => {
  if (isElectron() && window.electronAPI.downloadUpdate) {
    return await window.electronAPI.downloadUpdate(downloadUrl);
  }
  return { success: false, error: 'Auto-update only supported in desktop Electron app' };
};

export const runUpdateInstaller = async (installerPath) => {
  if (isElectron() && window.electronAPI.runInstaller) {
    return await window.electronAPI.runInstaller(installerPath);
  }
  return { success: false, error: 'Auto-update only supported in desktop Electron app' };
};

export const onUpdateDownloadProgress = (callback) => {
  if (isElectron() && window.electronAPI.onDownloadProgress) {
    return window.electronAPI.onDownloadProgress(callback);
  }
  return () => {};
};
