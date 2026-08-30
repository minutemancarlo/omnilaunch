# OmniLaunch — Desktop Multi-App & Website Workspace Orchestrator

[![Release](https://img.shields.io/github/v/release/minutemancarlo/omnilaunch?color=10b981&label=version)](https://github.com/minutemancarlo/omnilaunch/releases/latest)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue)](https://github.com/minutemancarlo/omnilaunch)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

OmniLaunch is a sleek, fast desktop workspace orchestrator built with **Electron + React + Vite**. It lets you organize, automate, and batch-launch your desktop applications, CLI scripts, and websites with a single click.

---

## 📥 Download & Install

Download the latest production release installer from GitHub:
- **[👉 Download OmniLaunch Setup (.exe)](https://github.com/minutemancarlo/omnilaunch/releases/latest)**
- **[👉 Download OmniLaunch Installer (.msi)](https://github.com/minutemancarlo/omnilaunch/releases/latest)**

---

## ✨ Key Features

- **📁 Workspaces & Routines**: Group multiple apps and websites together to orchestrate simultaneous or staggered 1-click batch launches with custom delays and live status dots.
- **⚡ Quick Shortcuts Launchpad**: Personal pinboard for standalone tools and links with live search, preset categories (**Development**, **Communication**, **Productivity**, **Media**, **Design**, **General**), custom `#tags`, and 3 view layouts (**Grid**, **Grouped**, **Compact List**).
- **🛡️ Run as Administrator**: Easily configure any desktop application or CLI terminal command to request Windows UAC elevation on launch (highlighted with distinctive amber shield badges).
- **✨ Emerald Cyber Splash Screen**: High-polish frameless startup screen featuring glowing cosmic rings, floating supersonic brand emblem, and live status progress.
- **🖼️ Native Windows Icon Extraction**: Automatically retrieves and displays authentic high-resolution icons directly from Windows `.exe` binaries and `.lnk` shortcuts using native Win32 extraction.
- **🌐 Smart Website Favicon Retrieval**: Real-time website title and high-definition favicon extraction for any public URL or intranet portal (e.g. OpenProject, Outlook, GitHub, Jira).
- **🆙 In-App Auto-Updates**: Automatic update checking, Titlebar notification pills, and seamless 1-click update installation with direct folder access.
- **🖥️ System Tray & Universal Hotkey**: Runs silently in the Windows system tray with customizable global summon hotkey (`Ctrl+Shift+Space`).
- **🚀 Windows Autostart**: Optional autostart on Windows login with silent background start to tray.
- **🌗 Obsidian Dark & Modern Light**: Seamless theme switching with fluid responsive layouts.

---

## 🛠️ Getting Started

### 1. Clone or Download the Repository
```bash
git clone https://github.com/minutemancarlo/omnilaunch.git
cd omnilaunch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Running the Application
Inside the repository folder where the project was downloaded/cloned:

#### Option A: Quick Launch (Windows)
Double-click `launch.bat` or run in terminal:
```powershell
.\launch.bat
```

#### Option B: Development Mode (Vite + Electron Hot Reloading)
```powershell
npm run dev
```

### 4. Building Installers
To build production Windows setup packages (`.exe` and `.msi`):
```powershell
npm run dist
```
The compiled setup files will be created in the `dist/` and `release/` directories.

---

## 🧱 Tech Stack
- **Shell**: Electron 34
- **Frontend**: React 18 + Vite 6
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design Tokens (Obsidian Dark & Clean Light)
