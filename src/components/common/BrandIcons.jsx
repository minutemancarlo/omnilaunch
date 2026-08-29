import React, { useState, useMemo } from 'react';
import { Terminal, Globe, AppWindow, Sparkles, Folder, Play } from 'lucide-react';

export const OmniLaunchLogo = ({ size = 22, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: 'visible' }}
  >
    <defs>
      <linearGradient id="omniGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="omniLight" x1="16" y1="26" x2="16" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#a7f3d0" />
      </linearGradient>
    </defs>
    
    {/* Left Orbital Curve */}
    <path
      d="M8 22C6 18 6.5 13 9.5 9.2C12.5 5.5 17.2 4.2 21.5 6C20 7.2 16.5 8 13.7 10.2C11 12.5 9.7 16.5 9.5 20L8 22Z"
      fill="url(#omniGrad)"
      fillOpacity="0.8"
    />
    
    {/* Right Orbital Curve */}
    <path
      d="M24 22C26 18 25.5 13 22.5 9.2C19.5 5.5 14.8 4.2 10.5 6C12 7.2 15.5 8 18.3 10.2C21 12.5 22.3 16.5 22.5 20L24 22Z"
      fill="url(#omniGrad)"
    />

    {/* Center Supersonic Chevron - Left Wing */}
    <path d="M16 4L7.5 23L14.8 19.8L16 16.8V4Z" fill="url(#omniGrad)" />

    {/* Center Supersonic Chevron - Right Wing */}
    <path d="M16 4L24.5 23L17.2 19.8L16 16.8V4Z" fill="url(#omniLight)" />

    {/* Rocket Engine Flame Tail */}
    <path d="M14 21.5L16 28L18 21.5L16 22.5L14 21.5Z" fill="url(#omniGrad)" />

    {/* Quantum Core Spark */}
    <path d="M16 10L16.8 12.8L19.5 13.5L16.8 14.2L16 17L15.2 14.2L12.5 13.5L15.2 12.8L16 10Z" fill="#ffffff" />
    <circle cx="16" cy="13.5" r="0.75" fill="#10b981" />
  </svg>
);

// Helper to extract hostname from any URL
export const extractHostname = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const trimmed = rawUrl.trim();
    const clean = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(clean);
    return parsed.hostname;
  } catch {
    return null;
  }
};

// Helper to get Google S2 Favicon URL
export const getFaviconUrl = (rawUrl, size = 64) => {
  const host = extractHostname(rawUrl);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;
};

// Website Favicon Component with multi-source fallback
export const WebsiteFavicon = ({ url, name = '', size = 20, fallbackIcon = null, className = '' }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const sources = useMemo(() => {
    const host = extractHostname(url);
    if (!host) return [];
    try {
      const clean = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
      const parsed = new URL(clean);
      return [
        // 1. Google High-Resolution Favicon Service (64px)
        `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
        // 2. DuckDuckGo Favicon Service
        `https://icons.duckduckgo.com/ip3/${host}.ico`,
        // 3. Direct Domain favicon.ico
        `${parsed.protocol}//${host}/favicon.ico`,
      ];
    } catch {
      return [`https://www.google.com/s2/favicons?domain=${host}&sz=64`];
    }
  }, [url]);

  // If URL changes, reset error state
  React.useEffect(() => {
    setSourceIndex(0);
    setHasFailedAll(false);
  }, [url]);

  if (!url || hasFailedAll || sources.length === 0) {
    return fallbackIcon || <Globe size={size} />;
  }

  const currentSrc = sources[sourceIndex];

  return (
    <img
      src={currentSrc}
      alt={name || 'Website Favicon'}
      width={size}
      height={size}
      loading="lazy"
      className={className}
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((prev) => prev + 1);
        } else {
          setHasFailedAll(true);
        }
      }}
      style={{
        width: size,
        height: size,
        borderRadius: size > 24 ? 6 : 4,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
};

// Curated vector icons for desktop applications and popular services
export const getCuratedBrandIcon = (name = '', size = 20) => {
  const n = (name || '').toLowerCase();

  // 1. OmniLaunch
  if (n.includes('omnilaunch')) {
    return <OmniLaunchLogo size={size} />;
  }

  // 2. Antigravity
  if (n.includes('antigravity') || n.includes('agy')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="agyGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="#1e1b4b" />
        <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" fill="url(#agyGrad)" />
      </svg>
    );
  }

  // 3. Microsoft Teams
  if (n.includes('teams')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#464EB8" />
        <path d="M16 8.5C16 9.6 15.1 10.5 14 10.5C12.9 10.5 12 9.6 12 8.5C12 7.4 12.9 6.5 14 6.5C15.1 6.5 16 7.4 16 8.5Z" fill="#ffffff" />
        <path d="M14 12C11.8 12 10 13.8 10 16H18C18 13.8 16.2 12 14 12Z" fill="#ffffff" />
        <path d="M9.5 9C9.5 9.8 8.8 10.5 8 10.5C7.2 10.5 6.5 9.8 6.5 9C6.5 8.2 7.2 7.5 8 7.5C8.8 7.5 9.5 8.2 9.5 9Z" fill="#B4B7E5" />
        <path d="M6 13C4.9 13 4 13.9 4 15V16H8.5C8.5 14.5 9.2 13.3 10.3 12.5C8.8 12.2 7.3 12.4 6 13Z" fill="#B4B7E5" />
      </svg>
    );
  }

  // 4. Visual Studio Code
  if (n.includes('code') || n.includes('vscode')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#0066B8" />
        <path d="M17.5 3.5L12 8.5L7.5 5L4.5 7L7 12L4.5 17L7.5 19L12 15.5L17.5 20.5L20 19V5L17.5 3.5ZM17.5 16.5L12.5 12L17.5 7.5V16.5Z" fill="#ffffff" />
      </svg>
    );
  }

  // 5. OpenProject
  if (n.includes('openproject')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#1C4B82" />
        <path d="M6 12L10 16L18 8" stroke="#35C4EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 6. Outlook Web
  if (n.includes('outlook') || n.includes('mail.office')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#0078D4" />
        <rect x="4" y="7" width="16" height="11" rx="2" fill="#ffffff" />
        <path d="M4 8L12 13L20 8" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. Google Music / YouTube Music
  if (n.includes('music') || n.includes('youtube music') || n.includes('google music')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#FF0000" />
        <circle cx="12" cy="12" r="7" stroke="#ffffff" strokeWidth="1.5" />
        <polygon points="10,9 16,12 10,15" fill="#ffffff" />
      </svg>
    );
  }

  // 8. Google Chrome
  if (n.includes('chrome')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#4285F4" />
        <circle cx="12" cy="12" r="5" fill="#ffffff" />
        <circle cx="12" cy="12" r="3.5" fill="#4285F4" />
      </svg>
    );
  }

  // 9. GitHub
  if (n.includes('github')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#24292e" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58 4 4 7.58 4 12C4 15.54 6.29 18.53 9.47 19.59C9.87 19.66 10.02 19.42 10.02 19.21C10.02 19.02 10.01 18.39 10.01 17.72C8 18.09 7.46 17.18 7.3 16.74C7.21 16.52 6.83 15.81 6.5 15.62C6.22 15.47 5.82 15.1 6.49 15.09C7.12 15.08 7.57 15.67 7.72 15.91C8.44 17.12 9.59 16.78 10.05 16.57C10.12 16.05 10.33 15.7 10.56 15.5C8.78 15.3 6.92 14.61 6.92 11.55C6.92 10.68 7.23 9.96 7.74 9.4C7.66 9.2 7.38 8.38 7.82 7.28C7.82 7.28 8.49 7.07 10.02 8.11C10.66 7.93 11.34 7.84 12.02 7.84C12.7 7.84 13.38 7.93 14.02 8.11C15.55 7.06 16.22 7.28 16.22 7.28C16.66 8.38 16.38 9.2 16.3 9.4C16.81 9.96 17.12 10.67 17.12 11.55C17.12 14.62 15.25 15.3 13.47 15.5C13.76 15.75 14.01 16.23 14.01 16.98C14.01 18.06 14 18.93 14 19.21C14 19.42 14.15 19.67 14.55 19.59C17.71 18.53 20 15.53 20 12C20 7.58 16.42 4 12 4Z" fill="#ffffff" />
      </svg>
    );
  }

  // 10. ChatGPT
  if (n.includes('chatgpt') || n.includes('openai')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#10a37f" />
        <circle cx="12" cy="12" r="5" stroke="#ffffff" strokeWidth="1.5" />
        <path d="M12 7V17M7 12H17" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    );
  }

  // 11. Gmail
  if (n.includes('gmail')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#EA4335" />
        <path d="M5 7L12 12.5L19 7V17H5V7Z" fill="#ffffff" />
      </svg>
    );
  }

  // 12. YouTube
  if (n.includes('youtube')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#FF0000" />
        <polygon points="10,8 16,12 10,16" fill="#ffffff" />
      </svg>
    );
  }

  // 13. Discord
  if (n.includes('discord')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#5865F2" />
        <path d="M16.5 8C15.5 7.5 14.5 7.2 13.5 7C13.4 7.2 13.2 7.5 13.1 7.7C12 7.5 10.9 7.5 9.8 7.7C9.7 7.5 9.5 7.2 9.4 7C8.4 7.2 7.4 7.5 6.4 8C4.5 10.8 4 13.5 4.3 16.2C5.6 17.2 6.9 17.8 8.1 18.2C8.4 17.8 8.7 17.3 8.9 16.9C8.5 16.7 8.1 16.5 7.7 16.3C7.8 16.2 7.9 16.1 8 16C10.6 17.2 13.4 17.2 16 16C16.1 16.1 16.2 16.2 16.3 16.3C15.9 16.5 15.5 16.7 15.1 16.9C15.3 17.3 15.6 17.8 15.9 18.2C17.1 17.8 18.4 17.2 19.7 16.2C20 13 19.1 10.4 16.5 8ZM9.5 14C8.7 14 8 13.3 8 12.5C8 11.7 8.7 11 9.5 11C10.3 11 11 11.7 11 12.5C11 13.3 10.3 14 9.5 14ZM14.5 14C13.7 14 13 13.3 13 12.5C13 11.7 13.7 11 14.5 11C15.3 11 16 11.7 16 12.5C16 13.3 15.3 14 14.5 14Z" fill="#ffffff" />
      </svg>
    );
  }

  // 14. Spotify
  if (n.includes('spotify')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#1DB954" />
        <path d="M16.5 15.2C16.3 15.5 15.9 15.6 15.6 15.4C13.1 13.9 9.9 13.5 6.4 14.3C6 14.4 5.7 14.1 5.6 13.8C5.5 13.4 5.8 13.1 6.1 13C10 12.1 13.5 12.5 16.3 14.2C16.6 14.4 16.7 14.8 16.5 15.2ZM17.6 12.6C17.3 13 16.8 13.1 16.4 12.8C13.7 11.1 9.4 10.6 6.1 11.6C5.6 11.7 5.2 11.5 5 11C4.9 10.6 5.1 10.1 5.6 10C9.4 8.8 14.2 9.4 17.3 11.3C17.7 11.6 17.8 12.1 17.6 12.6ZM17.8 9.8C14.5 7.9 8.9 7.7 5.5 8.7C5 8.9 4.4 8.6 4.2 8C4 7.5 4.4 6.9 4.9 6.8C8.9 5.6 15.1 5.8 18.9 8.1C19.4 8.4 19.5 9 19.3 9.5C19 9.9 18.3 10.1 17.8 9.8Z" fill="#ffffff" />
      </svg>
    );
  }

  // 15. Slack
  if (n.includes('slack')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#4A154B" />
        <circle cx="8" cy="8" r="2" fill="#E01E5A" />
        <circle cx="16" cy="8" r="2" fill="#36C5F0" />
        <circle cx="16" cy="16" r="2" fill="#2EB67D" />
        <circle cx="8" cy="16" r="2" fill="#ECB22E" />
      </svg>
    );
  }

  // 16. Notion
  if (n.includes('notion')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#000000" />
        <path d="M6 6L14 7V17L7 18V7L6 6ZM14 7L18 6V16L14 17V7Z" fill="#ffffff" />
      </svg>
    );
  }

  // 17. Figma
  if (n.includes('figma')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#2C2D30" />
        <circle cx="15" cy="9" r="3" fill="#1ABCFE" />
        <path d="M9 6H12V12H9C7.3 12 6 10.7 6 9C6 7.3 7.3 6 9 6Z" fill="#F24E1E" />
        <path d="M9 12H12V18H9C7.3 18 6 16.7 6 15C6 13.3 7.3 12 9 12Z" fill="#0ACF83" />
      </svg>
    );
  }

  // 18. Terminal / Cmd / PowerShell
  if (n.includes('terminal') || n.includes('cmd') || n.includes('powershell')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#1e293b" />
        <path d="M7 8L11 12L7 16M13 16H17" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return null;
};

const GENERIC_EXE_MARKER = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAByklEQVRYhe1WQUoDQRCs2Sh4';

export const isGenericPlaceholder = (dataUrl) => {
  if (!dataUrl) return false;
  return dataUrl.includes(GENERIC_EXE_MARKER);
};

// Main dynamic icon renderer supporting desktop apps & website favicons
export const AppIconRenderer = ({
  name = '',
  type = 'app',
  url = '',
  iconDataUrl = '',
  size = 20,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [iconDataUrl]);

  // 1. If we have a direct extracted icon / favicon (and not generic dummy icon), render it!
  if (iconDataUrl && !imgError && !isGenericPlaceholder(iconDataUrl)) {
    return (
      <img
        src={iconDataUrl}
        alt={name || 'Icon'}
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size > 24 ? 6 : 4,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  const curated = getCuratedBrandIcon(name, size);

  // 2. If it's a website URL
  if (type === 'url' || url) {
    if (url) {
      return (
        <WebsiteFavicon
          url={url}
          name={name}
          size={size}
          className={className}
          fallbackIcon={curated || <Globe size={size} className={className} />}
        />
      );
    }
    return curated || <Globe size={size} className={className} />;
  }

  // 3. If it's an app
  if (curated) {
    return curated;
  }

  return <AppWindow size={size} className={className} />;
};
