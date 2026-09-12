# StudyShield 🛡️ — Stay Productive, Stay Safe

<p align="center">
  <img src="icon128.png" alt="StudyShield Logo" width="100" height="100" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>The Ultimate Open-Source Distraction Blocker, Pomodoro Focus Booster, Ambient Soundscapes Synthesizer & Tamper-Proof Parental Control Extension for Chrome.</strong>
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Manifest-V3-6366f1.svg?style=for-the-badge&logo=googlechrome" alt="Manifest V3" /></a>
  <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-10b981.svg?style=for-the-badge" alt="MIT License" /></a>
  <a href="#-privacy-first--zero-telemetry"><img src="https://img.shields.io/badge/Privacy-100%25%20Local-38bdf8.svg?style=for-the-badge" alt="Privacy First" /></a>
  <a href="#-installation"><img src="https://img.shields.io/badge/Version-2.1-f59e0b.svg?style=for-the-badge" alt="Version 2.1" /></a>
  <a href="#-offline-first-ambient-soundscapes"><img src="https://img.shields.io/badge/Audio-Web%20Audio%20Synth-8b5cf6.svg?style=for-the-badge" alt="Web Audio Synth" /></a>
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [🎯 Laser-Focus Pomodoro & Live Timer Screen](#1-laser-focus-pomodoro--live-timer-screen)
  - [🎧 8 Procedural Focus & Sleep Soundscapes](#2-8-procedural-focus--sleep-soundscapes)
  - [🔒 Parental Master PIN & Anti-Tamper Guardian](#3-parental-master-pin--anti-tamper-guardian)
  - [🏰 1-Click Anti-Uninstall Fortress Mode](#4-1-click-anti-uninstall-fortress-mode)
  - [🔞 Content Safety & SafeSearch Enforcer](#5-content-safety--safesearch-enforcer)
  - [🔥 Study Streaks & XP System](#6-study-streaks--xp-system)
- [Installation & Quick Start](#-installation--quick-start)
  - [Running Unpacked (Developer Mode)](#option-1-load-unpacked-in-chrome-recommended)
  - [Enforcing Fortress Mode via Windows Registry](#option-2-enforce-fortress-mode-windows)
- [Architecture & File Structure](#-architecture--file-structure)
- [Web Audio Synthesis Engine](#-web-audio-synthesis-engine)
- [Privacy Policy & Offline Guarantee](#-privacy-policy--offline-guarantee)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**StudyShield** is built for students, professionals, and parents who need an effective digital workspace. Modern browsers are filled with infinite feeds, distracting algorithm loops, and explicit content that derail study sessions in seconds.

Unlike traditional site blockers that are easily uninstalled or leak browsing history to remote tracking servers, StudyShield is:
1. **100% Local-First & Zero-Telemetry**: No external API dependencies, no data collection, zero network tracking.
2. **Zero-Latency Blocker**: Uses Chrome's high-speed Manifest V3 `declarativeNetRequest` engine for instant network-level interception.
3. **Tamper-Proof by Design**: Protects settings, extensions tabs, and browser configuration behind a parent PIN, plus an optional Windows Registry enterprise lock.
4. **Mindful Productivity**: Built with calming ambient audio synthesis, zen breathing animations, and motivating study streak gamification.

---

## 🚀 Key Features

### 1. Laser-Focus Pomodoro & Live Timer Screen
- Set customized study sprints (15m, 25m, 45m, 60m).
- In focus mode, all non-educational domains are automatically paused.
- **Dynamic Countdown on Blocked Page**: If a student lands on a restricted site during a study session, the blocked page displays a live countdown timer (`MM:SS`) and progress bar showing when access will be restored.
- Permanently blocked websites (social media, adult content, parent-locked sites) automatically suppress the countdown to prevent expectation of access.

### 2. 8 Procedural Focus & Sleep Soundscapes
Experience high-fidelity, relaxing ambient audio generated directly on your device via the **Web Audio API** (no audio file downloads, no buffer latency, 100% offline):
- 🌧️ **Gentle Rain**: Soothing continuous rainfall with warm lowpass filtering.
- ⛈️ **Storm (Rain + Thunderstorm)**: Ambient steady rain with dynamic, low-frequency rolling thunder rumbles and sub-bass swells.
- 🌊 **Ocean Waves**: Natural rhythmic wave crests and receding tides modulated by an LFO sine wave.
- 🌲 **Pine Forest & Breeze**: Whispering wind through trees with gentle, realistic bird chirps.
- 🕯️ **Campfire**: Warm ambient fireplace roar with organic wood-crackle impulses.
- ☕ **Cozy Cafe**: Warm low-mid coffeehouse murmur.
- 📻 **White Noise**: Smooth broadband noise to mask sharp background distractions.
- 🌌 **Deep Sleep Brown Noise**: 2-stage deep lowpass brown/red noise for deep sleep, meditation, and alpha-wave focus.
- 🔈 **Volume Slider**: Smooth gain adjustment available on both the popup and blocked screen.

### 3. Parental Master PIN & Anti-Tamper Guardian
- **PIN Protected Zone**: All parental settings, custom blocklists, and sensitive switches are secured behind a 4-digit Master PIN (Default: `1234`).
- **Anti-Uninstall Guardian (ON by default)**: Blocks access to `chrome://extensions`, `chrome://settings`, `edge://extensions`, and `brave://extensions`. Unauthorized attempts are immediately redirected to the Tamper Shield alert page.
- Parents can temporarily unlock the settings tab using their secret PIN to make configuration adjustments.

### 4. 1-Click Anti-Uninstall Fortress Mode
- Included in the `assets/` folder is `StudyShield_Fortress_Lock.reg`.
- When applied to Windows, Chrome recognizes StudyShield as an enterprise-managed extension via `ExtensionInstallForcelist`.
- The browser greys out the "Remove from Chrome" button and permanently prevents uninstallation or disabling—even through task manager or browser settings.
- Unlock easily at any time using `StudyShield_Fortress_Unlock.reg`.

### 5. Content Safety & SafeSearch Enforcer
- **Adult & Harmful Content Filter**: Blocks over 100+ adult domains, explicit platforms, and harmful media. Managed exclusively within the PIN-protected Parent Controls.
- **Strict SafeSearch**: Enforces strict filtering parameters automatically on Google (`safe=active`), Bing (`adlt=strict`), and DuckDuckGo (`kp=1`).
- **Search Query Keyword Guard**: Blocks dangerous or inappropriate search queries in real time.

### 6. Study Streaks & XP System
- Automatically tracks daily study streaks, daily focused minutes, and resisted distraction attempts.
- Awards +50 XP for completed Pomodoro sessions and +2 XP for every resisted distraction attempt.
- Features curated motivational quotes from history's deepest thinkers.

---

## 💻 Installation & Quick Start

### Option 1: Load Unpacked in Chrome (Recommended)

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/studyshield.git
   cd studyshield
   ```
2. **Open Chrome Extensions**:
   - Navigate to `chrome://extensions` in your browser address bar.
   - Enable **Developer mode** toggle in the top-right corner.
3. **Load the Extension**:
   - Click **Load unpacked** in the top-left corner.
   - Select the root folder of this project (the folder containing `manifest.json`).
4. **Pin to Toolbar**:
   - Click the puzzle icon in the Chrome toolbar and pin **StudyShield** 🛡️.

### Option 2: Enforce Fortress Mode (Windows)

To make StudyShield completely unremovable by children:
1. Open the `assets/` folder.
2. Double-click `StudyShield_Fortress_Lock.reg` and click **Yes** to merge into Windows Registry.
3. Restart Google Chrome. StudyShield will now display as "Installed by your organization" and the remove button will be disabled.
4. To remove later, run `StudyShield_Fortress_Unlock.reg`.

---

## 📂 Architecture & File Structure

```
StudyShield/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Service worker: DNR rules, Anti-Tamper guardian, alarms & stats
├── content.js                 # Content script for SPA navigation & keyword detection
├── popup.html                 # Main dashboard UI (Glassmorphic dark aesthetic)
├── popup.js                   # Popup engine: timer, soundscapes, tabs, and PIN gate
├── blocked.html               # Blocked guardian screen: dynamic countdown & soundscapes
├── blocked.js                 # Blocked screen engine: timer detection & audio synthesizers
├── icon16.png                 # Toolbar icon (16x16)
├── icon32.png                 # Toolbar icon (32x32)
├── icon48.png                 # Toolbar icon (48x48)
├── icon128.png                # Chrome Web Store & Notification icon (128x128)
├── icon512.png                # High-definition display icon (512x512)
├── icon1024.png               # Ultra-HD brand asset (1024x1024)
├── assets/
│   ├── StudyShield_Fortress_Lock.reg    # Windows Registry anti-uninstall lock script
│   └── StudyShield_Fortress_Unlock.reg  # Windows Registry unlock script
├── CHROMEWEBSTORE.md          # Chrome Web Store listing metadata, permissions & disclosures
├── README.md                  # Open-source documentation
└── LICENSE                    # MIT Open-Source License
```

---

## 🔊 Web Audio Synthesis Engine

StudyShield does not rely on large static MP3 or WAV files. All soundscapes are synthesized mathematically in real-time using standard Web Audio nodes:
- **Procedural White & Pink Noise Buffers**: Generated algorithmically with random Gaussian distributions.
- **Biquad Filters**: Precision Lowpass, Bandpass, and Highpass filters model environmental resonance (rain frequencies at ~800Hz, cafe frequencies at ~420Hz, deep brown noise at ~200Hz).
- **LFO Modulation (Low Frequency Oscillators)**: Modulate gain envelopes to recreate ocean wave tides and whispering wind gusts.
- **Impulse Synthesis**: Generates randomized microscopic pop intervals simulating burning wood in campfires.
- **Zero Asset Footprint**: Keeps the extension lightweight (<1 MB) and eliminates network buffering.

---

## 🔒 Privacy Policy & Offline Guarantee

StudyShield is built on the principle of complete user privacy:
- **No Remote Servers**: StudyShield does not send analytics, telemetry, or browsing data to external endpoints.
- **No Third-Party Cookies or Trackers**: Completely free of advertising scripts, Google Analytics, or third-party pixels.
- **Local Storage Only**: All user configurations (whitelists, blocklists, PIN hash, study streaks) are kept strictly within Chrome's local sandboxed storage (`chrome.storage.local`).
- **Child Safe**: Fully compliant with COPPA and GDPR safety standards.

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the repository (`git fork`).
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <strong>StudyShield</strong> — Stay Focused. Stay Protected. Achieve Your Goals. 🚀
</p>
