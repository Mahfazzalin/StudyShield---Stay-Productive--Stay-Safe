# Chrome Web Store Listing — StudyShield

> **Last Updated:** 2026-09-12  
> **Extension Version:** 2.1  
> **Manifest Version:** Manifest V3 (MV3)

---

## 1. Store Listing Details

**Extension Name**
```
StudyShield - Stay Productive, Stay Safe
```

**Short Description** (128 / 132 characters)
```
Smart website blocker, Pomodoro focus timer with ambient soundscapes, study streaks, and tamper-proof parental controls.
```

**Detailed Description**
```
StudyShield is an all-in-one distraction blocker, study productivity booster, and parental safety extension designed for students and focused learners.

Tired of endless social media rabbit holes and video binge-watching during study hours? StudyShield combines high-performance website blocking, science-backed Pomodoro timeboxing, relaxing ambient focus soundscapes, and tamper-proof parental controls to help you achieve peak concentration and build sustainable study streaks.

KEY FEATURES:

🎯 POMODORO FOCUS SESSIONS & DYNAMIC TIMER COUNTDOWN
• Start customizable focus sessions (15m, 25m, 45m, 60m) with high-efficiency website whitelist blocking.
• Live real-time countdown timer directly on blocked pages showing exactly when study breaks unlock.
• Automatic session completion alerts and XP rewards to celebrate your productivity wins.

🎧 8+ PROCEDURAL AMBIENT FOCUS & SLEEP SOUNDSCAPES
• 100% offline, zero-latency procedural soundscapes synthesized directly with Web Audio API.
• Calming audio environments: Gentle Rain, Rain + Thunderstorm, Ocean Waves, Pine Forest Wind & Birds, Cozy Campfire, Coffee Shop Ambiance, Deep Sleep Brown Noise, and White Noise.
• Integrated volume control and playable both on the popup and directly on blocked distraction screens.

🔒 PIN-PROTECTED PARENTAL CONTROLS & FORTRESS MODE
• Master 4-digit PIN gate protects all sensitive parental configurations from unauthorized changes.
• Dedicated Parental Control tab to lock adult/harmful content filters and manage custom blacklist/whitelist domains.
• Anti-Uninstall & Tamper Guardian: By default, blocks access to chrome://extensions and browser settings so students cannot disable or bypass protections.
• Includes 1-Click Windows Registry Fortress Mode (.reg) policy file for enterprise-grade, unremovable lockdown.

🛡️ SMART CONTENT & KEYWORD SAFETY FILTER
• Instant blocking of 100+ explicit, adult, and harmful domains using zero-latency DeclarativeNetRequest rules.
• Automated SafeSearch enforcement across Google, Bing, and DuckDuckGo.
• Search query keyword monitor blocks prohibited distraction terms and explicit queries in real time.

🔥 STUDY STREAKS, XP & MOTIVATIONAL QUOTES
• Track your daily study streak count, total minutes focused, and resisted distraction attempts.
• Level up and earn XP for each completed study session and resisted distraction attempt.
• Inspiring daily motivational quotes keep your mindset primed for deep learning.

HOW TO USE STUDYSHIELD:
1. Click the StudyShield shield icon in your Chrome toolbar to open the dashboard.
2. Select a Pomodoro timer duration (e.g., 25 min) and click "Start Laser Focus".
3. Choose your favorite calming soundscape (such as Rain + Thunderstorm or Ocean Waves) to stay relaxed while working.
4. Add your favorite study resources (e.g., Khan Academy, Wikipedia, Google Classroom) to the Allowed Whitelist.
5. Parents can switch to the "Parents" tab, enter the Master PIN (Default: 1234), and configure child protection settings.

PRIVACY & SECURITY FIRST:
• 100% Local-First: All configurations, rules, and streaks are stored strictly on your device using Chrome's local storage.
• No Tracking or Telemetry: StudyShield does not monitor your personal browsing history, sell data, or transmit your private details to any remote servers.
• Safe for Kids: Built to COPPA/GDPR compliance standards with zero ad networks or analytics trackers.
```

**Category**
```
Productivity
```

**Single Purpose**
```
Block distracting websites and help students maintain focus with Pomodoro timers, ambient soundscapes, and parental controls.
```

**Primary Language**
```
English
```

---

## 2. Graphics & Asset Status

| Asset | Dimension | File Path | Status |
| :--- | :--- | :--- | :--- |
| **Store Icon** | 128×128 PNG | `icon128.png` | ✅ Ready |
| **Toolbar Icon** | 16×16, 32×32, 48×48 PNG | `icon16.png`, `icon32.png`, `icon48.png` | ✅ Ready |
| **HD Display Icon** | 512×512, 1024×1024 PNG | `icon512.png`, `icon1024.png` | ✅ Ready |
| **Primary Screenshot** | 1280×800 PNG | `assets/screenshot_popup.png` | ⬜ Recommended for CWS Dashboard |
| **Blocked Page Screenshot** | 1280×800 PNG | `assets/screenshot_blocked.png` | ⬜ Recommended for CWS Dashboard |
| **Small Promo Tile** | 440×280 PNG | `assets/promo_small.png` | ⬜ Recommended for CWS Dashboard |

---

## 3. Permissions Justification

| Permission | Type | User-Facing Purpose & Technical Justification |
| :--- | :--- | :--- |
| `declarativeNetRequest` | Permission | **Zero-Latency Website Blocking**: Evaluates incoming navigation requests at the network level and redirects blocked/distracting domains to `blocked.html` without inspecting request bodies or user data. |
| `storage` | Permission | **Settings & Streak Persistence**: Saves user blocklists, whitelists, Pomodoro timer state, parental PIN hash, and daily study statistics locally on the user's device (`chrome.storage.local`). |
| `tabs` | Permission | **Safe Navigation & Anti-Tamper**: Reads the active tab's URL to enforce Strict SafeSearch query parameters, detect navigation to protected `chrome://extensions` / `chrome://settings` tabs, and redirect distractions during active focus sessions. |
| `alarms` | Permission | **Pomodoro Timer Precision**: Manages accurate countdown timing for focus study sessions using background alarms (`chrome.alarms`), ensuring timer completion triggers even when the service worker becomes idle. |
| `notifications` | Permission | **Study Alerts**: Sends clean desktop notifications when a Pomodoro focus session finishes or when anti-tamper security prevents unauthorized extension removal. |
| `activeTab` | Permission | **Toolbar Quick-Block**: Grants momentary tab access when the user clicks the toolbar icon to quickly inspect the current domain and add it to the whitelist or blocklist. |
| `<all_urls>` | Host Permission | **Declarative Network Filtering & SPA Monitoring**: Required by `declarativeNetRequest` redirect rules to intercept arbitrary distracting domains (social media, gaming, adult content) across all web traffic. |

---

## 4. Privacy & Data Use Disclosures

### Data Collection Audit

| Category | Collected? | Transmitted Off-Device? | Stored Location | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| **Personally Identifiable Info (PII)** | ❌ No | ❌ No | None | Not collected |
| **Health or Financial Data** | ❌ No | ❌ No | None | Not collected |
| **Authentication Credentials** | ❌ No | ❌ No | `chrome.storage.local` | Only local SHA-256 parent PIN hash |
| **Personal Communications** | ❌ No | ❌ No | None | Not collected |
| **Location Data** | ❌ No | ❌ No | None | Not collected |
| **Full Web Browsing History** | ❌ No | ❌ No | None | Not collected or stored |
| **User Activity Analytics** | ❌ No | ❌ No | `chrome.storage.local` | Daily focus minutes & blocked count |
| **Website Content / Keystrokes** | ❌ No | ❌ No | None | Never accessed or logged |

### Chrome Web Store Certifications
- [x] **StudyShield does NOT sell user data to third parties.**
- [x] **StudyShield does NOT transfer data off-device for purposes unrelated to core functionality.**
- [x] **StudyShield does NOT use or transfer user data for creditworthiness or lending decisions.**

---

## 5. Version History

| Version | Date | Key Release Notes | Status |
| :--- | :--- | :--- | :--- |
| **2.1** | 2026-09-12 | • Added 8 procedural ambient focus & sleep soundscapes (Rain, Thunderstorm, Ocean Waves, Forest, Campfire, Cafe, Brown Noise, White Noise).<br>• Live Pomodoro countdown timer and progress bar on the blocked page.<br>• Relocated Adult Content Filter to Parent PIN protected tab.<br>• Default-ON Anti-Uninstall & Tamper Guardian. | **Ready for Submission** |
| **2.0** | 2026-08-20 | • Introduced Manifest V3 architecture with zero-latency DeclarativeNetRequest dynamic rules.<br>• Added Parental Master PIN Gate, Tamper Lock, and 1-Click Anti-Uninstall Windows Registry fortress script. | Published |
| **1.0** | 2026-05-15 | • Initial MVP release with Pomodoro timer, custom domain blocklist, and basic quote banner. | Deprecated |
