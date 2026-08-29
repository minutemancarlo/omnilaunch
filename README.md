# OmniLaunch — Desktop Multi-App & Website Workspace Orchestrator

OmniLaunch is a sleek, fast desktop application built with **Electron + React + Vite** that lets you group, automate, and trigger multiple desktop apps (.exe / scripts / tools) and web URLs with a single click.

---

## Key Features

- **⚡ Standalone Quick Shortcuts**: Add standalone desktop apps (.exe / scripts) or website links into a personal launchpad without creating a routine. Includes live search, preset categories (**Development**, **Communication**, **Productivity**, **Media & Audio**, **Design & Creative**, **General**), custom `#tags`, and 3 view layouts (**Grid**, **Grouped**, **Compact List**).
- **📁 Workspaces & Routines**: Group multiple tools and websites together to orchestrate simultaneous or staggered 1-click batch launches.
- **🖥️ System Tray & Background Daemon**: Minimize or close directly to the Windows notification tray with a native tray context menu.
- **⌨️ Universal Global Shortcut**: Instantly show/hide OmniLaunch anywhere in Windows with a customizable hotkey (e.g. `Ctrl+Shift+Space`, `Ctrl+Alt+O`, `Alt+Space`).
- **🚀 Windows Autostart**: Optional autostart on Windows boot with silent background startup to the system tray.
- **🌐 Automatic Website Icon (Favicon) Retrieval**: Automatically fetches the official high-resolution favicon for any website or web URL (e.g. OpenProject at `app.teligent.ph`, Outlook Web, Google Music, Reddit, GitHub, internal intranets, etc.) with multi-tier fallback.
- **🎨 Custom Themed Message Dialogs**: Native browser alerts and confirms replaced with custom animated modals matching the OmniLaunch design system.
- **Hybrid Target Support**:
  - **Desktop Applications**: Auto-detects **Antigravity**, **Microsoft Teams**, VS Code, Chrome, Windows Terminal, Slack, Discord, Spotify, and custom `.exe`/`.bat`/scripts.
  - **Web Applications & URLs**: Quick 1-click presets for **OpenProject**, **Outlook Web**, **Google Music**, **GitHub**, **ChatGPT**, **Gmail**, **YouTube**, **Figma**, and **Notion**.
- **Dark Mode & Light Mode**: Seamless theme switching with Titlebar toggle.
- **Real-Time Status Indicators**: Clear visual feedback (Ready, Launching, Launched, Error) and toast notifications.
- **Local Persistence**: Automatically remembers your workspaces and settings locally with a clean slate to customize.

---

## Running the Application

In this directory (`C:\Users\Anubis\.gemini\antigravity\scratch\omnilaunch`):

### Option 1: Double-click
Double-click [`launch.bat`](file:///C:/Users/Anubis/.gemini/antigravity/scratch/omnilaunch/launch.bat).

### Building & Installing

### Windows Installer (.msi)
To build a production Windows Installer (`.msi`):
```powershell
npm run dist:msi
```
The installer is generated at:
[`release/OmniLaunch 1.0.0.msi`](file:///C:/Users/Anubis/.gemini/antigravity/scratch/omnilaunch/release/OmniLaunch%201.0.0.msi)

### Development
To run in development mode with hot reloading:
```powershell
npm run dev
```

---

## Tech Stack
- **Framework**: Electron 34 + React 18 + Vite 6
- **Icons**: Lucide React
- **Design System**: Vanilla CSS with dark obsidian / slate theme tokens
