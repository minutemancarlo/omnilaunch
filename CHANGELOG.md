# Changelog

All notable changes to **OmniLaunch** will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-30

### ✨ New Features
- **✨ Emerald Cyber Splash Screen**:
  - Implemented an animated frameless splash screen on application boot matching the OmniLaunch emblem.
  - Features ambient emerald/cyan cosmic radial glow, floating brand chevron with rotating quantum orbit ring, gradient typography, and an animated indeterminate progress bar cycling startup status messages.
- **Real-Time Website Title & Favicon Extraction**:
  - Automatically queries the webpage directly from the local machine (working across private/intranet hosts like `app.teligent.ph` as well as the public internet).
  - Automatically populates the **Display Name** with the website's `<title>` or `og:title`.
  - Downloads and caches high-resolution base64 favicons with multi-source fallback (Google S2, DuckDuckGo, and direct `/favicon.ico`).
- **Native Windows App Icon Extraction**:
  - Direct Win32 / .NET extraction (`[System.Drawing.Icon]::ExtractAssociatedIcon`) retrieves the authentic 48x48/64x64 icon embedded in `.exe` binaries, AppExecutionAliases (e.g. `ms-teams.exe`, `wt.exe`), and `.lnk` shortcuts.
  - In-memory icon caching eliminates duplicate extraction overhead.
- **Startup Icon Auto-Hydration**:
  - Automatically scans existing saved shortcuts and workspaces upon startup, backfilling authentic icons for any items that lacked saved binary icons.
- **In-App Update Checker & Setup Downloader**:
  - Integrated update checking with automatic manifest / GitHub Releases API querying.
  - Animated **Update Available** pill indicator in the Titlebar.
  - In-app installer downloader with live download progress and 1-click installer execution.
- **In-App Changelog Viewer**:
  - Clickable version badge in the Titlebar and Settings to view release notes and feature highlights directly within the application.

### 🔧 Improvements
- **Bulletproof Windows App Launching**:
  - Paths containing spaces (e.g. `Program Files` or `Start Menu`) are now properly quoted for Windows shell execution.
  - Windows `.lnk` shortcuts are natively opened via `shell.openPath`.
  - Windows 11 Microsoft Teams (`ms-teams.exe`) is automatically resolved and launched without command errors.
- **Unique Modern Brand Icon**:
  - Designed transparent orbital launch chevron with glowing supersonic wings and radiant quantum spark core (100% transparent background).
  - Fixed invisible system tray icon on Windows using dedicated 32x32 RGBA raster bitmap.
- **Quick Installed Apps Grid**:
  - Added **Microsoft Teams** to presets; removed Postman.
  - Pre-renders native Windows icons in selection buttons.

---

## [1.0.0] - 2026-08-18

### ✨ Initial Release
- **Workspace Routine Orchestrator**:
  - Batch launch applications, URLs, and scripts with custom staggered delays.
  - Real-time status indicators (Ready, Launching, Launched, Error).
- **Standalone Quick Shortcuts Library**:
  - Dedicated pinboard for single apps and websites.
  - Live search across titles, URLs, paths, and tags.
  - Preset categories (**Development**, **Communication**, **Productivity**, **Media & Audio**, **Design & Creative**, **General**).
  - Custom `#tags` system with interactive chips and filter bar.
  - 3 view layouts: Grid View, Category Grouped View, and Compact List View.
- **Windows System Tray & Daemon Mode**:
  - Background minimization and close-to-tray persistence with native Windows notification icon.
  - Tray context menu with quick navigation and quit commands.
- **Universal Global Shortcut**:
  - Customizable system-wide accelerator (default `Ctrl+Shift+Space`) to instantly toggle OmniLaunch from anywhere in Windows.
- **Windows Login Autostart**:
  - Configurable startup on Windows boot with silent background start to tray.
- **Custom Themed Message Dialogs**:
  - High-polish modal confirm dialogs matching dark and light mode styling.
- **Windows MSI Installer**:
  - Production `.msi` setup package with Start Menu and desktop shortcut creation.
