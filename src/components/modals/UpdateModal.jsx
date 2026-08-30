import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ArrowUpCircle,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import {
  downloadUpdateInstaller,
  runUpdateInstaller,
  openUpdateFolder,
  onUpdateDownloadProgress,
} from '../../services/updaterService';
import { APP_VERSION } from '../../constants/version';

export const UpdateModal = ({
  isOpen,
  onClose,
  updateInfo,
  onCheckAgain,
  isChecking = false,
}) => {
  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'ready' | 'error'
  const [progress, setProgress] = useState(0);
  const [downloadedMb, setDownloadedMb] = useState('0');
  const [totalMb, setTotalMb] = useState('0');
  const [downloadedPath, setDownloadedPath] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when modal opens or updateInfo changes
  useEffect(() => {
    if (isOpen) {
      setDownloadState('idle');
      setProgress(0);
      setErrorMessage('');
    }
  }, [isOpen, updateInfo]);

  // Listen to download progress
  useEffect(() => {
    const unsub = onUpdateDownloadProgress((data) => {
      setProgress(data.percent || 0);
      if (data.transferredBytes && data.totalBytes) {
        setDownloadedMb((data.transferredBytes / (1024 * 1024)).toFixed(1));
        setTotalMb((data.totalBytes / (1024 * 1024)).toFixed(1));
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  if (!isOpen) return null;

  const hasUpdate = updateInfo && updateInfo.hasUpdate;
  const latestVersion = updateInfo?.latestVersion || APP_VERSION;
  const releaseDate = updateInfo?.releaseDate || 'Recent';
  const downloadUrl = updateInfo?.downloadUrl || '';
  const releaseNotes = updateInfo?.releaseNotes || '';

  const handleStartDownload = async () => {
    if (!downloadUrl) {
      setErrorMessage('No download URL provided in release manifest.');
      setDownloadState('error');
      return;
    }

    setDownloadState('downloading');
    setErrorMessage('');
    setProgress(0);

    const res = await downloadUpdateInstaller(downloadUrl);
    if (res.success && res.filePath) {
      setDownloadedPath(res.filePath);
      setDownloadState('ready');
    } else {
      setDownloadState('error');
      setErrorMessage(res.error || 'Failed to download installer.');
    }
  };

  const handleInstallNow = async () => {
    if (!downloadedPath) return;
    setDownloadState('installing');
    const res = await runUpdateInstaller(downloadedPath);
    if (res && !res.success && res.error) {
      setDownloadState('ready');
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 540, display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                backgroundColor: hasUpdate ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: hasUpdate ? 'var(--accent-primary)' : 'var(--accent-emerald)',
              }}
            >
              {hasUpdate ? <ArrowUpCircle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div>
              <h3 className="modal-title">
                {hasUpdate ? 'OmniLaunch Software Update' : 'OmniLaunch is Up to Date'}
              </h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Current Version: <strong style={{ color: 'var(--text-primary)' }}>v{APP_VERSION}</strong>
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isChecking ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Loader2 size={32} className="spinning" style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0 }}>Checking for updates...</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Querying version manifest endpoint</p>
            </div>
          ) : hasUpdate ? (
            <>
              {/* Version Comparison Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  padding: '14px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 8,
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Installed</span>
                  <strong style={{ fontSize: 14, color: 'var(--text-secondary)' }}>v{APP_VERSION}</strong>
                </div>

                <div style={{ color: 'var(--accent-primary)', fontSize: 18 }}>➜</div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--accent-primary)', display: 'block', fontWeight: 600 }}>
                    New Version
                  </span>
                  <strong style={{ fontSize: 16, color: 'var(--accent-primary)' }}>v{latestVersion}</strong>
                </div>
              </div>

              {/* Release Notes */}
              {releaseNotes && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '12px',
                    maxHeight: 150,
                    overflowY: 'auto',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Release Notes ({releaseDate})
                  </span>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {releaseNotes}
                  </p>
                </div>
              )}

              {/* Progress Bar (when downloading) */}
              {downloadState === 'downloading' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Loader2 size={13} className="spinning" /> Downloading setup installer...
                    </span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {progress}% ({downloadedMb} MB / {totalMb || '?'} MB)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      width: '100%',
                      backgroundColor: 'var(--bg-input)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: 'var(--accent-primary)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Download Ready State */}
              {downloadState === 'ready' && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  <span style={{ fontSize: 12, color: 'var(--accent-emerald)', fontWeight: 500 }}>
                    Installer downloaded successfully! Click Install to proceed.
                  </span>
                </div>
              )}

              {/* Error State */}
              {downloadState === 'error' && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={18} color="#ef4444" />
                  <span style={{ fontSize: 12, color: '#ef4444' }}>
                    {errorMessage || 'Failed to download update installer.'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle2 size={42} style={{ color: 'var(--accent-emerald)', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                You're on the latest version!
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                OmniLaunch v{APP_VERSION} is currently the newest release.
              </p>
              {updateInfo?.error && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                  (Update feed check notice: {updateInfo.error})
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {hasUpdate ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={downloadState === 'downloading'}
              >
                Later
              </button>

              {downloadState === 'ready' ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openUpdateFolder(downloadedPath)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    title="Reveal downloaded installer in File Explorer"
                  >
                    <FolderOpen size={16} />
                    Open Folder
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleInstallNow}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ShieldCheck size={16} />
                    Install & Restart
                  </button>
                </div>
              ) : downloadState === 'downloading' ? (
                <button type="button" className="btn btn-primary" disabled>
                  <Loader2 size={16} className="spinning" />
                  Downloading ({progress}%)
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartDownload}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Download size={16} />
                  Download & Install Update
                </button>
              )}
            </>
          ) : (
            <>
              {onCheckAgain && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCheckAgain}
                  disabled={isChecking}
                >
                  Check Again
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={onClose}>
                OK
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
