import React from 'react';
import { X, Sparkles, Wrench, Bug, Calendar, History, ShieldCheck, Palette } from 'lucide-react';
import { APP_VERSION, RELEASE_DATE, CHANGELOG_HISTORY } from '../../constants/version';

export const ChangelogModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <History size={20} />
            </div>
            <div>
              <h3 className="modal-title">What's New & Release Changelog</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                Current Version: <strong style={{ color: 'var(--text-primary)' }}>v{APP_VERSION}</strong> • Updated {RELEASE_DATE}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Changelog List */}
        <div style={{ overflowY: 'auto', paddingRight: 6, flex: 1 }}>
          {CHANGELOG_HISTORY.map((entry, idx) => {
            const isCurrent = entry.version === APP_VERSION;
            return (
              <div
                key={entry.version}
                style={{
                  marginBottom: 20,
                  padding: '16px',
                  backgroundColor: isCurrent ? 'var(--bg-card)' : 'var(--bg-input)',
                  border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  boxShadow: isCurrent ? '0 0 12px rgba(99, 102, 241, 0.15)' : 'none',
                }}
              >
                {/* Version Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: isCurrent ? 'var(--accent-primary)' : 'var(--text-primary)',
                      }}
                    >
                      v{entry.version}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: 'rgba(99, 102, 241, 0.2)',
                          color: 'var(--accent-primary)',
                          padding: '2px 7px',
                          borderRadius: 99,
                          border: '1px solid rgba(99, 102, 241, 0.4)',
                        }}
                      >
                        CURRENT VERSION
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> {entry.date}
                  </span>
                </div>

                {/* Tagline */}
                {entry.tagline && (
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    {entry.tagline}
                  </p>
                )}

                {/* Changes List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {entry.changes.map((item, cIdx) => {
                    const isFeature = item.type === 'feature';
                    const isUI = item.type === 'ui';
                    const isImprovement = item.type === 'improvement';
                    const Icon = isFeature ? Sparkles : isUI ? Palette : isImprovement ? Wrench : Bug;
                    const badgeColor = isFeature ? 'var(--accent-primary)' : isUI ? '#10b981' : isImprovement ? 'var(--accent-cyan)' : '#ef4444';

                    return (
                      <div
                        key={cIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        <div
                          style={{
                            marginTop: 2,
                            padding: '3px',
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: badgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: 5 }}>
                            {item.title}:
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={13} color="var(--accent-emerald)" /> Verified & tested on Windows 11
          </span>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
