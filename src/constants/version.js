export const APP_VERSION = '1.2.2';
export const RELEASE_DATE = 'August 30, 2026';

export const CHANGELOG_HISTORY = [
  {
    version: '1.2.2',
    date: 'August 30, 2026',
    tagline: '1-Click Update Reliability & Streamlined Settings',
    changes: [
      {
        type: 'fix',
        title: 'Smoother 1-Click Update Installation',
        desc: 'Clicking "Install & Restart" now launches the setup installer seamlessly and updates OmniLaunch without Windows path or permission errors.',
      },
      {
        type: 'ui',
        title: 'Streamlined Settings Interface',
        desc: 'Simplified the update settings for the public repository, keeping the interface clean and distraction-free.',
      },
      {
        type: 'feature',
        title: 'Open Installer Location',
        desc: 'Added a handy "Open Folder" button in the update dialog to reveal the downloaded installer file directly in File Explorer.',
      },
    ],
  },
  {
    version: '1.2.0',
    date: 'August 30, 2026',
    tagline: 'Run as Administrator & Visual Privilege Badges',
    changes: [
      {
        type: 'feature',
        title: 'Run as Administrator Option',
        desc: 'Launch desktop applications and terminal scripts with elevated Administrator privileges whenever needed (defaulted to unchecked for safety).',
      },
      {
        type: 'ui',
        title: 'Amber Admin Shield Badges',
        desc: 'Distinctive amber shield badges highlight items requiring administrator privileges on Workspace cards and Quick Shortcut lists.',
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
