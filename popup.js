// StudyShield Modern Extension Popup Engine (v2.0)

let currentDomain = '';
let activePresetMins = 25;
let timerInterval = null;
let audioContext = null;
let activeSoundSource = null;
let isParentUnlocked = false;

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  await loadSettings();
  loadCurrentTabInfo();
  initTimer();
  initSoundscapes();
  initParentalZone();
});

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==========================================
// 1. Tab Navigation & Sensitive Gate
// ==========================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');
  const pinGate = document.getElementById('pinGate');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Check if Parental tab requires PIN
      if (targetTab === 'tab-parents' && !isParentUnlocked) {
        chrome.storage.local.get(['parentalLockEnabled'], (data) => {
          if (data.parentalLockEnabled !== false) {
            promptPinGate(() => switchTab(targetTab, btn));
          } else {
            switchTab(targetTab, btn);
          }
        });
        return;
      }

      switchTab(targetTab, btn);
    });
  });

  function switchTab(targetTab, activeBtn) {
    tabBtns.forEach(b => b.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));
    activeBtn.classList.add('active');
    const targetPane = document.getElementById(targetTab);
    if (targetPane) targetPane.classList.add('active');
  }

  // Gate cancel button
  document.getElementById('cancelGateBtn').addEventListener('click', () => {
    pinGate.classList.remove('active');
  });
}

function promptPinGate(onSuccess) {
  const pinGate = document.getElementById('pinGate');
  const pinInput = document.getElementById('gatePinInput');
  const pinError = document.getElementById('gatePinError');
  const submitBtn = document.getElementById('submitGateBtn');
  const fillDefaultBtn = document.getElementById('fillDefaultPinBtn');
  const toggleVisBtn = document.getElementById('togglePinVisBtn');
  const defaultNotice = document.getElementById('defaultPinNotice');

  pinGate.classList.add('active');
  pinInput.value = '';
  pinInput.type = 'password';
  pinError.style.display = 'none';
  pinInput.focus();

  // Check if PIN has been customized
  chrome.runtime.sendMessage({ action: 'checkPinStatus' }, (res) => {
    if (res && res.isCustomized) {
      if (defaultNotice) defaultNotice.style.display = 'none';
      if (fillDefaultBtn) fillDefaultBtn.style.display = 'none';
    } else {
      if (defaultNotice) defaultNotice.style.display = 'block';
      if (fillDefaultBtn) fillDefaultBtn.style.display = 'inline-block';
    }
  });

  // Toggle Visibility
  toggleVisBtn.onclick = () => {
    pinInput.type = pinInput.type === 'password' ? 'text' : 'password';
  };

  // Quick fill default PIN (1234)
  if (fillDefaultBtn) {
    fillDefaultBtn.onclick = () => {
      pinInput.value = '1234';
      handleVerify();
    };
  }

  const handleVerify = () => {
    const enteredPin = pinInput.value.trim();
    if (!enteredPin) return;

    chrome.runtime.sendMessage({ action: 'verifyPin', pin: enteredPin }, (response) => {
      if (response && response.valid) {
        isParentUnlocked = true;
        pinGate.classList.remove('active');
        checkDefaultPinWarning();
        onSuccess();
      } else {
        pinError.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
      }
    });
  };

  submitBtn.onclick = handleVerify;
  pinInput.onkeydown = (e) => {
    if (e.key === 'Enter') handleVerify();
  };
}

// ==========================================
// 2. Current Website Inspector & Actions
// ==========================================
function loadCurrentTabInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].url) return;

    try {
      const url = new URL(tabs[0].url);
      if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
        document.getElementById('currentSiteDomain').textContent = 'System / Extension Page';
        document.getElementById('currentSiteMeta').textContent = 'Cannot be restricted';
        document.getElementById('quickAllowBtn').disabled = true;
        document.getElementById('quickBlockBtn').disabled = true;
        return;
      }

      currentDomain = url.hostname.replace('www.', '').toLowerCase();
      document.getElementById('currentSiteDomain').textContent = currentDomain;
      document.getElementById('currentSiteIcon').textContent = currentDomain.charAt(0).toUpperCase();

      updateCurrentSiteStatus();
    } catch (e) {
      document.getElementById('currentSiteDomain').textContent = 'Unknown Page';
    }
  });

  document.getElementById('quickAllowBtn').addEventListener('click', async () => {
    if (!currentDomain) return;
    const data = await chrome.storage.local.get(['allowedWebsites', 'permanentBlocked', 'parentBlockedWebsites']);
    const parentBlocked = data.parentBlockedWebsites || [];

    if (parentBlocked.includes(currentDomain)) {
      showToast('🔒 Cannot allow: Locked by Parent PIN!');
      return;
    }

    let allowed = data.allowedWebsites || [];
    let blocked = (data.permanentBlocked || []).filter(s => s.toLowerCase() !== currentDomain);

    if (!allowed.includes(currentDomain)) {
      allowed.push(currentDomain);
    }

    await chrome.storage.local.set({ allowedWebsites: allowed, permanentBlocked: blocked });
    chrome.runtime.sendMessage({ action: 'syncRules' });
    showToast(`Allowed ${currentDomain}`);
    renderAllChips();
    updateCurrentSiteStatus();
  });

  document.getElementById('quickBlockBtn').addEventListener('click', async () => {
    if (!currentDomain) return;
    const data = await chrome.storage.local.get(['allowedWebsites', 'permanentBlocked', 'parentAllowedWebsites']);
    const parentAllowed = data.parentAllowedWebsites || [];

    if (parentAllowed.includes(currentDomain)) {
      showToast('⭐ Cannot block: Approved by Parent!');
      return;
    }

    let blocked = data.permanentBlocked || [];
    let allowed = (data.allowedWebsites || []).filter(s => s.toLowerCase() !== currentDomain);

    if (!blocked.includes(currentDomain)) {
      blocked.push(currentDomain);
    }

    await chrome.storage.local.set({ permanentBlocked: blocked, allowedWebsites: allowed });
    chrome.runtime.sendMessage({ action: 'syncRules' });
    showToast(`Blocked ${currentDomain}`);
    renderAllChips();
    updateCurrentSiteStatus();
  });
}

async function updateCurrentSiteStatus() {
  if (!currentDomain) return;
  const data = await chrome.storage.local.get([
    'allowedWebsites',
    'permanentBlocked',
    'parentBlockedWebsites',
    'parentAllowedWebsites'
  ]);
  const allowed = data.allowedWebsites || [];
  const blocked = data.permanentBlocked || [];
  const parentBlocked = data.parentBlockedWebsites || [];
  const parentAllowed = data.parentAllowedWebsites || [];

  const tag = document.getElementById('currentSiteTag');
  const meta = document.getElementById('currentSiteMeta');
  const allowBtn = document.getElementById('quickAllowBtn');
  const blockBtn = document.getElementById('quickBlockBtn');

  if (parentBlocked.includes(currentDomain)) {
    tag.className = 'site-status-tag status-blocked';
    tag.textContent = '🔒 Parent Locked';
    meta.textContent = 'Permanently restricted by Parent PIN';
    allowBtn.disabled = true;
    allowBtn.style.opacity = '0.5';
    blockBtn.disabled = true;
    blockBtn.style.opacity = '0.7';
    blockBtn.textContent = '🔒 Parent Blocked';
  } else if (parentAllowed.includes(currentDomain)) {
    tag.className = 'site-status-tag status-allowed';
    tag.textContent = '⭐ Parent Safe';
    meta.textContent = 'Approved by Parent (Always safe)';
    allowBtn.disabled = true;
    allowBtn.style.opacity = '0.7';
    allowBtn.textContent = '⭐ Approved';
    blockBtn.disabled = true;
    blockBtn.style.opacity = '0.5';
  } else if (blocked.includes(currentDomain)) {
    tag.className = 'site-status-tag status-blocked';
    tag.textContent = 'Blocked';
    meta.textContent = 'In your focus blocklist';
    allowBtn.disabled = false;
    allowBtn.style.opacity = '1';
    allowBtn.innerHTML = '<span>✓</span> Allow Domain';
    blockBtn.disabled = false;
    blockBtn.style.opacity = '0.7';
    blockBtn.innerHTML = '<span>✕</span> Blocked';
  } else if (allowed.includes(currentDomain)) {
    tag.className = 'site-status-tag status-allowed';
    tag.textContent = 'Allowed';
    meta.textContent = 'On educational whitelist';
    allowBtn.disabled = false;
    allowBtn.style.opacity = '0.7';
    allowBtn.innerHTML = '<span>✓</span> Allowed';
    blockBtn.disabled = false;
    blockBtn.style.opacity = '1';
    blockBtn.innerHTML = '<span>✕</span> Block Domain';
  } else {
    tag.className = 'site-status-tag status-neutral';
    tag.textContent = 'Standard';
    meta.textContent = 'Unrestricted browsing';
    allowBtn.disabled = false;
    allowBtn.style.opacity = '1';
    allowBtn.innerHTML = '<span>✓</span> Allow Domain';
    blockBtn.disabled = false;
    blockBtn.style.opacity = '1';
    blockBtn.innerHTML = '<span>✕</span> Block Domain';
  }
}

// ==========================================
// 3. Pomodoro Timer 2.0 & Circular Ring
// ==========================================
function initTimer() {
  const presetBtns = document.querySelectorAll('.preset-chip');
  const startBtn = document.getElementById('startTimerBtn');
  const stopBtn = document.getElementById('stopTimerBtn');
  const dashStartBtn = document.getElementById('dashStartBtn');

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePresetMins = Number(btn.getAttribute('data-mins'));
      document.getElementById('timerDisplay').textContent = `${String(activePresetMins).padStart(2, '0')}:00`;
    });
  });

  startBtn.addEventListener('click', startFocusSession);
  dashStartBtn.addEventListener('click', startFocusSession);
  stopBtn.addEventListener('click', stopFocusSession);

  updateTimerTick();
  timerInterval = setInterval(updateTimerTick, 1000);
}

function startFocusSession() {
  chrome.runtime.sendMessage({ action: 'startTimer', duration: activePresetMins }, () => {
    showToast(`Laser Focus Started (${activePresetMins}m)`);
    updateTimerTick();
  });
}

function stopFocusSession() {
  chrome.runtime.sendMessage({ action: 'stopTimer' }, () => {
    showToast('Focus session paused');
    updateTimerTick();
  });
}

function updateTimerTick() {
  chrome.storage.local.get(['timerEndTime', 'focusMode', 'timerDuration'], (data) => {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerModeLabel = document.getElementById('timerModeLabel');
    const startBtn = document.getElementById('startTimerBtn');
    const stopBtn = document.getElementById('stopTimerBtn');
    const ring = document.getElementById('timerProgressRing');
    const dashTitle = document.getElementById('dashTimerTitle');
    const dashSub = document.getElementById('dashTimerSub');
    const dashStartBtn = document.getElementById('dashStartBtn');

    const totalCircumference = 471; // 2 * PI * 75

    if (data.timerEndTime && data.timerEndTime > Date.now()) {
      const remaining = data.timerEndTime - Date.now();
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      timerDisplay.textContent = timeStr;
      timerModeLabel.textContent = 'FOCUSING';
      timerModeLabel.style.color = '#34d399';

      startBtn.style.display = 'none';
      stopBtn.style.display = 'flex';

      dashTitle.textContent = `🎯 Focus Active (${timeStr})`;
      dashSub.textContent = 'Whitelisted study mode active';
      dashStartBtn.style.display = 'none';

      const totalDurationMs = (data.timerDuration || activePresetMins) * 60 * 1000;
      const progressRatio = Math.max(0, remaining / totalDurationMs);
      ring.style.strokeDashoffset = totalCircumference * (1 - progressRatio);
    } else {
      timerDisplay.textContent = `${String(activePresetMins).padStart(2, '0')}:00`;
      timerModeLabel.textContent = 'READY';
      timerModeLabel.style.color = '#818cf8';

      startBtn.style.display = 'flex';
      stopBtn.style.display = 'none';

      dashTitle.textContent = 'Focus Session';
      dashSub.textContent = 'Ready for a new session';
      dashStartBtn.style.display = 'inline-flex';

      ring.style.strokeDashoffset = 0;
    }
  });
}

// ==========================================
// 4. Ambient Focus Soundscapes (Web Audio Synth)
// ==========================================
function initSoundscapes() {
  const chips = document.querySelectorAll('.sound-chip');
  const statusLabel = document.getElementById('audioStatus');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      const soundType = chip.getAttribute('data-sound');

      if (soundType === 'off') {
        stopSound();
        statusLabel.textContent = 'Off';
      } else {
        chip.classList.add('active');
        playSound(soundType);
        statusLabel.textContent = soundType.toUpperCase();
      }
    });
  });
}

function playSound(type) {
  stopSound();

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();

    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
    } else if (type === 'cafe') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, audioContext.currentTime);
      filter.Q.setValueAtTime(1.5, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    } else { // white noise
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    whiteNoise.start(0);
    activeSoundSource = whiteNoise;
  } catch (err) {
    console.warn('Audio synthesis error:', err);
  }
}

function stopSound() {
  if (activeSoundSource) {
    try { activeSoundSource.stop(); } catch (e) {}
    activeSoundSource = null;
  }
  if (audioContext) {
    try { audioContext.close(); } catch (e) {}
    audioContext = null;
  }
}

// ==========================================
// 5. Shield, Whitelist & Keyword Management
// ==========================================
async function loadSettings() {
  const data = await chrome.storage.local.get([
    'adultShieldEnabled',
    'prelistedToggle',
    'usePrelistedSites',
    'focusMode',
    'allowedWebsites',
    'permanentBlocked',
    'blockedKeywords',
    'strictTamperGuard',
    'safeSearchEnabled',
    'streakStats'
  ]);

  // Toggles
  document.getElementById('adultShieldToggle').checked = data.adultShieldEnabled !== false;
  document.getElementById('prelistedToggle').checked = data.usePrelistedSites !== false;
  document.getElementById('focusModeToggle').checked = data.focusMode || false;
  document.getElementById('tamperGuardToggle').checked = data.strictTamperGuard !== false;
  document.getElementById('safeSearchToggle').checked = data.safeSearchEnabled !== false;

  // Listeners for toggles
  document.getElementById('adultShieldToggle').onchange = (e) => {
    if (!isParentUnlocked) {
      e.target.checked = true;
      showToast('🔒 Parent PIN required to change Adult Filter');
      return;
    }
    chrome.storage.local.set({ adultShieldEnabled: e.target.checked });
    chrome.runtime.sendMessage({ action: 'syncRules' });
    showToast(e.target.checked ? 'Adult Filter Enabled' : 'Adult Filter Disabled');
  };

  document.getElementById('prelistedToggle').onchange = (e) => {
    chrome.storage.local.set({ usePrelistedSites: e.target.checked });
    chrome.runtime.sendMessage({ action: 'syncRules' });
    showToast(e.target.checked ? 'Distraction Shield Active' : 'Distraction Shield Disabled');
  };

  document.getElementById('focusModeToggle').onchange = (e) => {
    chrome.storage.local.set({ focusMode: e.target.checked });
    showToast(e.target.checked ? 'Strict Whitelist Enabled' : 'Strict Whitelist Disabled');
  };

  document.getElementById('tamperGuardToggle').onchange = (e) => {
    chrome.storage.local.set({ strictTamperGuard: e.target.checked });
    showToast('Anti-Tamper Guardian Updated');
  };

  document.getElementById('safeSearchToggle').onchange = (e) => {
    chrome.storage.local.set({ safeSearchEnabled: e.target.checked });
    showToast('SafeSearch Setting Updated');
  };

  // Add Item Listeners
  document.getElementById('addBlockedBtn').onclick = () => addListItem('newBlockedInput', 'permanentBlocked');
  document.getElementById('newBlockedInput').onkeydown = (e) => { if (e.key === 'Enter') addListItem('newBlockedInput', 'permanentBlocked'); };

  document.getElementById('addAllowedBtn').onclick = () => addListItem('newAllowedInput', 'allowedWebsites');
  document.getElementById('newAllowedInput').onkeydown = (e) => { if (e.key === 'Enter') addListItem('newAllowedInput', 'allowedWebsites'); };

  document.getElementById('addKeywordBtn').onclick = () => addListItem('newKeywordInput', 'blockedKeywords');
  document.getElementById('newKeywordInput').onkeydown = (e) => { if (e.key === 'Enter') addListItem('newKeywordInput', 'blockedKeywords'); };

  // Parent Add Item Listeners
  const addParentBlockBtn = document.getElementById('addParentBlockedBtn');
  if (addParentBlockBtn) {
    addParentBlockBtn.onclick = () => addListItem('newParentBlockedInput', 'parentBlockedWebsites');
    document.getElementById('newParentBlockedInput').onkeydown = (e) => { if (e.key === 'Enter') addListItem('newParentBlockedInput', 'parentBlockedWebsites'); };
  }

  const addParentAllowBtn = document.getElementById('addParentAllowedBtn');
  if (addParentAllowBtn) {
    addParentAllowBtn.onclick = () => addListItem('newParentAllowedInput', 'parentAllowedWebsites');
    document.getElementById('newParentAllowedInput').onkeydown = (e) => { if (e.key === 'Enter') addListItem('newParentAllowedInput', 'parentAllowedWebsites'); };
  }

  renderAllChips();
  renderStats(data.streakStats);
}

async function addListItem(inputId, storageKey) {
  const input = document.getElementById(inputId);
  const val = input.value.trim().replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
  if (!val) return;

  const data = await chrome.storage.local.get([storageKey]);
  let list = data[storageKey] || [];
  if (!list.includes(val)) {
    list.push(val);
    await chrome.storage.local.set({ [storageKey]: list });
    chrome.runtime.sendMessage({ action: 'syncRules' });
    showToast(`Added ${val}`);
  }
  input.value = '';
  renderAllChips();
  updateCurrentSiteStatus();
}

async function removeListItem(item, storageKey) {
  const data = await chrome.storage.local.get([storageKey]);
  let list = (data[storageKey] || []).filter(i => i !== item);
  await chrome.storage.local.set({ [storageKey]: list });
  chrome.runtime.sendMessage({ action: 'syncRules' });
  showToast(`Removed ${item}`);
  renderAllChips();
  updateCurrentSiteStatus();
}

async function renderAllChips() {
  const data = await chrome.storage.local.get([
    'permanentBlocked',
    'allowedWebsites',
    'blockedKeywords',
    'parentBlockedWebsites',
    'parentAllowedWebsites'
  ]);
  const userBlocked = data.permanentBlocked || [];
  const userAllowed = data.allowedWebsites || [];
  const keywords = data.blockedKeywords || [];
  const parentBlocked = data.parentBlockedWebsites || [];
  const parentAllowed = data.parentAllowedWebsites || [];

  // Update counts
  document.getElementById('blockedSitesCount').textContent = userBlocked.length + parentBlocked.length;
  document.getElementById('allowedSitesCount').textContent = userAllowed.length + parentAllowed.length;
  document.getElementById('keywordsCount').textContent = keywords.length;

  const parentBlockedCountEl = document.getElementById('parentBlockedCount');
  if (parentBlockedCountEl) parentBlockedCountEl.textContent = parentBlocked.length;
  const parentAllowedCountEl = document.getElementById('parentAllowedCount');
  if (parentAllowedCountEl) parentAllowedCountEl.textContent = parentAllowed.length;

  // 1. Render in Shield Tab (Student/Child View)
  renderShieldBlockedChips('blockedChips', userBlocked, parentBlocked);
  renderShieldAllowedChips('allowedChips', userAllowed, parentAllowed);
  renderChipsList('keywordChips', keywords, 'blockedKeywords');

  // 2. Render in Parents Tab (Parent View - can remove with PIN unlocked)
  renderChipsList('parentBlockedChips', parentBlocked, 'parentBlockedWebsites');
  renderChipsList('parentAllowedChips', parentAllowed, 'parentAllowedWebsites');
}

function renderShieldBlockedChips(containerId, userBlocked, parentBlocked) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (userBlocked.length === 0 && parentBlocked.length === 0) {
    container.innerHTML = '<span style="font-size: 11.5px; color: var(--text-dim); padding: 4px;">No custom items added yet</span>';
    return;
  }

  // Parent-Locked items: Child cannot remove them!
  parentBlocked.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip-item';
    chip.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    chip.style.background = 'rgba(244, 63, 94, 0.12)';
    chip.title = 'Permanently locked by Parent PIN. Cannot be unblocked by child.';
    chip.innerHTML = `
      <span>🔒 ${item}</span>
      <span style="font-size: 10px; color: #fda4af; font-weight: 800; margin-left: 2px;">LOCKED</span>
    `;
    chip.onclick = () => {
      showToast('🔒 Locked by Parent: Cannot be removed without Parent PIN!');
    };
    container.appendChild(chip);
  });

  // User items: Child CAN remove their own added blocks
  userBlocked.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip-item';
    chip.innerHTML = `
      <span>${item}</span>
      <span class="chip-remove" title="Remove">✕</span>
    `;
    chip.querySelector('.chip-remove').onclick = (e) => {
      e.stopPropagation();
      removeListItem(item, 'permanentBlocked');
    };
    container.appendChild(chip);
  });
}

function renderShieldAllowedChips(containerId, userAllowed, parentAllowed) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (userAllowed.length === 0 && parentAllowed.length === 0) {
    container.innerHTML = '<span style="font-size: 11.5px; color: var(--text-dim); padding: 4px;">No custom items added yet</span>';
    return;
  }

  // Parent-Approved items: Always Safe
  parentAllowed.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip-item';
    chip.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    chip.style.background = 'rgba(16, 185, 129, 0.12)';
    chip.title = 'Approved safe website by Parent.';
    chip.innerHTML = `
      <span>⭐ ${item}</span>
      <span style="font-size: 10px; color: #6ee7b7; font-weight: 800; margin-left: 2px;">APPROVED</span>
    `;
    container.appendChild(chip);
  });

  // User allowed items
  userAllowed.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip-item';
    chip.innerHTML = `
      <span>${item}</span>
      <span class="chip-remove" title="Remove">✕</span>
    `;
    chip.querySelector('.chip-remove').onclick = (e) => {
      e.stopPropagation();
      removeListItem(item, 'allowedWebsites');
    };
    container.appendChild(chip);
  });
}

function renderChipsList(containerId, items, storageKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<span style="font-size: 11.5px; color: var(--text-dim); padding: 4px;">No custom items added yet</span>';
    return;
  }

  items.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip-item';
    chip.innerHTML = `
      <span>${item}</span>
      <span class="chip-remove" title="Remove">✕</span>
    `;
    chip.querySelector('.chip-remove').onclick = () => removeListItem(item, storageKey);
    container.appendChild(chip);
  });
}

// ==========================================
// 6. Parental Zone & Fortress Mode Generator
// ==========================================
function checkDefaultPinWarning() {
  chrome.runtime.sendMessage({ action: 'checkPinStatus' }, (res) => {
    const warnCard = document.getElementById('warnDefaultPinCard');
    if (warnCard) {
      warnCard.style.display = (res && res.isCustomized) ? 'none' : 'block';
    }
  });
}

function initParentalZone() {
  // Re-Lock Button
  const reLockBtn = document.getElementById('reLockParentBtn');
  if (reLockBtn) {
    reLockBtn.addEventListener('click', () => {
      isParentUnlocked = false;
      const homeBtn = document.querySelector('[data-tab="tab-dashboard"]');
      if (homeBtn) homeBtn.click();
      showToast('🔒 Parent Mode Locked');
    });
  }

  // Change PIN
  document.getElementById('savePinBtn').addEventListener('click', () => {
    const newPin = document.getElementById('newPinInput').value.trim();
    if (newPin.length < 4) {
      showToast('PIN must be at least 4 digits');
      return;
    }

    chrome.runtime.sendMessage({ action: 'setNewPin', pin: newPin }, () => {
      document.getElementById('newPinInput').value = '';
      showToast('Parent Master PIN updated successfully!');
      checkDefaultPinWarning();
    });
  });

  // 1-Click Anti-Uninstall Fortress (.reg) Download
  document.getElementById('downloadFortressBtn').addEventListener('click', () => {
    const extensionId = chrome.runtime.id || "studyshield";
    const regContent = `Windows Registry Editor Version 5.00\r\n\r\n; StudyShield 1-Click Anti-Uninstall Lock\r\n[HKEY_CURRENT_USER\\Software\\Policies\\Google\\Chrome\\ExtensionInstallForcelist]\r\n"101"="${extensionId};https://clients2.google.com/service/update2/crx"\r\n\r\n[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome\\ExtensionInstallForcelist]\r\n"101"="${extensionId};https://clients2.google.com/service/update2/crx"\r\n`;

    const blob = new Blob([regContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'StudyShield_Fortress_Lock.reg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Downloaded! Run this file to lock extension.');
  });
}

// ==========================================
// 7. Gamification, XP & Streaks Analytics
// ==========================================
function renderStats(stats) {
  const s = stats || {
    streakCount: 1,
    todayFocusMinutes: 0,
    todayBlockedAttempts: 0,
    totalFocusMinutes: 0,
    xp: 50
  };

  // Header streak
  document.getElementById('streakCount').textContent = `${s.streakCount || 1} Day${s.streakCount > 1 ? 's' : ''}`;
  document.getElementById('statsStreakVal').textContent = `🔥 ${s.streakCount || 1} Day${s.streakCount > 1 ? 's' : ''}`;

  // Dashboard stats
  document.getElementById('dashFocusMins').textContent = `${s.todayFocusMinutes || 0} min`;
  document.getElementById('dashBlockedCount').textContent = s.todayBlockedAttempts || 0;

  // XP & Level calculations
  const xp = s.xp || 0;
  let level = 1;
  let levelName = 'Novice Scholar';
  let nextXp = 100;

  if (xp >= 1000) {
    level = 5;
    levelName = 'Zen Grandmaster 🏆';
    nextXp = 2000;
  } else if (xp >= 600) {
    level = 4;
    levelName = 'Productivity Champion ⚡';
    nextXp = 1000;
  } else if (xp >= 300) {
    level = 3;
    levelName = 'Deep Work Scholar 📖';
    nextXp = 600;
  } else if (xp >= 100) {
    level = 2;
    levelName = 'Focus Apprentice 🎯';
    nextXp = 300;
  }

  document.getElementById('statsLevelNum').textContent = level;
  document.getElementById('statsLevelName').textContent = levelName;
  document.getElementById('statsXp').textContent = xp;

  const pct = Math.min(100, Math.round((xp / nextXp) * 100));
  document.getElementById('statsXpBar').style.width = `${pct}%`;

  // Total Study Time & Time Saved
  const totalHours = ((s.totalFocusMinutes || 0) / 60).toFixed(1);
  document.getElementById('statsTotalTimeVal').textContent = `${totalHours} hrs`;

  const timeSavedHrs = (((s.totalFocusMinutes || 0) * 0.4 + (s.todayBlockedAttempts || 0) * 10) / 60).toFixed(1);
  document.getElementById('statsTimeSavedVal').textContent = `~${timeSavedHrs} hrs saved`;
}