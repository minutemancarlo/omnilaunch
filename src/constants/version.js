export const APP_VERSION = '1.2.0';
export const RELEASE_DATE = 'August 30, 2026';

export const CHANGELOG_HISTORY = [
  {
    version: '1.2.0',
    date: 'August 30, 2026',
    tagline: 'Run as Administrator, Private Repo Updates & Automated CI/CD',
    changes: [
      {
        type: 'feature',
        title: 'Run as Administrator (Windows UAC Elevation)',
        desc: 'Added option to launch desktop applications and CLI terminal windows with elevated Administrator privileges using native Windows UAC RunAs.',
      },
      {
        type: 'feature',
        title: 'Visual Admin Status Badges',
        desc: 'Prominent amber ADMIN shield indicators on Workspace Target cards and Quick Shortcut items.',
      },
      {
        type: 'feature',
        title: 'Private GitHub Repository Update Support',
        desc: 'Secure Personal Access Token authentication for auto-updating from private GitHub repositories, with automatic GitHub Releases API fallback.',
      },
      {
        type: 'feature',
        title: 'Automated GitHub Actions Cloud Releases',
        desc: 'Integrated CI/CD cloud pipeline building MSI and NSIS installers automatically upon pushing release tags.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: 'August 30, 2026',
    tagline: 'Native Icon Extraction, Favicon Hydration & Auto-Update System',
    changes: [
      {
        type: 'feature',
        title: 'Real-Time Website Title & Favicon Extraction',
        desc: 'Typing any URL automatically queries the page locally (including intranet portals like app.teligent.ph) to extract page titles and high-res favicons.',
      },
      {
        type: 'feature',
        title: 'Native Windows App Icon Extraction',
        desc: 'Extracts authentic icons directly from Windows .exe binaries and .lnk shortcuts using native .NET Win32 extraction with in-memory caching.',
      },
      {
        type: 'feature',
        title: 'Startup Icon Auto-Hydration',
        desc: 'Existing shortcuts and workspace items saved in localStorage automatically retrieve and cache their native icons on boot without manual re-creation.',
      },
      {
        type: 'feature',
        title: 'In-App Update Checker & Setup Downloader',
        desc: 'Automatically detects new versions, displays update indicators, and downloads setup files with live progress.',
      },
      {
        type: 'improvement',
        title: 'Bulletproof Windows App Launching',
        desc: 'Fixed launching for executables with spaces in their path, Windows 11 ms-teams.exe naming, and .lnk shortcuts using native shell.openPath.',
      },
      {
        type: 'improvement',
        title: 'Modern Transparent Icon & Tray Fix',
        desc: 'High-tech orbital chevron logo with 100% transparent background and crisp 32x32 RGBA system tray raster.',
      },
    ],
  },
  {
    version: '1.0.0',
    date: 'August 18, 2026',
    tagline: 'Initial Release of OmniLaunch Desktop Workspace & App Orchestrator',
    changes: [
      {
        type: 'feature',
        title: 'Workspace Routine Orchestrator',
        desc: 'Batch launch applications, URLs, and scripts with custom staggered delays and real-time status indicators.',
      },
      {
        type: 'feature',
        title: 'Standalone Quick Shortcuts Library',
        desc: 'Independent launchpad for single apps and sites with presets, categories, and #tags.',
      },
      {
        type: 'feature',
        title: 'Windows System Tray & Universal Global Shortcut',
        desc: 'Background daemon with customizable hotkey (Ctrl+Shift+Space) and silent autostart.',
      },
      {
        type: 'feature',
        title: 'Dark Mode & Light Mode',
        desc: 'Seamless theme switcher with custom-styled modal dialogs and toasts.',
      },
      {
        type: 'feature',
        title: 'Windows MSI Installer',
        desc: 'Production .msi setup package with Start Menu and desktop shortcut creation.',
      },
    ],
  },
];
