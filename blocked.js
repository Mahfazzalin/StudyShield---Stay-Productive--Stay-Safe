// StudyShield Blocked Guardian Screen Script
// Complete Focus Timer Countdown & Ambient Focus Soundscapes

const quotes = [
  { text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { text: "Starve your distractions, feed your focus.", author: "Daniel Goleman" },
  { text: "You will never reach your destination if you stop and throw stones at every dog that barks.", author: "Winston Churchill" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" }
];

// Audio State
let audioContext = null;
let activeSoundSource = null;
let masterGain = null;
let currentVolume = 0.8;

// Timer State
let countdownInterval = null;
let currentDomain = '';
let currentReason = '';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  currentReason = params.get('reason') || 'site_blocked';
  currentDomain = params.get('domain') || '';
  const keyword = params.get('keyword') || '';

  const badgeText = document.getElementById('badgeText');
  const headline = document.getElementById('headline');
  const subtext = document.getElementById('subtext');
  const blockedTarget = document.getElementById('blockedTarget');
  const statusIcon = document.getElementById('statusIcon');

  // Display target info
  if (currentDomain) {
    blockedTarget.textContent = '🌐 ' + currentDomain;
  } else if (keyword) {
    blockedTarget.textContent = '🔍 Keyword: ' + keyword;
  } else {
    blockedTarget.style.display = 'none';
  }

  // Customize UI based on reason
  switch (currentReason) {
    case 'content_filter':
      badgeText.className = 'badge badge-danger';
      badgeText.textContent = '🛡️ Content Safety Filter';
      headline.textContent = 'Unsafe Content Filtered';
      subtext.textContent = 'This website or search was automatically filtered to keep your digital space safe, healthy, and focused.';
      statusIcon.textContent = '🛡️';
      break;

    case 'keyword_filter':
      badgeText.className = 'badge badge-danger';
      badgeText.textContent = '🔍 Restricted Search';
      headline.textContent = 'Restricted Search Query';
      subtext.textContent = 'This search contains blocked keywords and cannot be displayed.';
      statusIcon.textContent = '🚫';
      break;

    case 'focus_mode':
      badgeText.className = 'badge badge-focus';
      badgeText.textContent = '🎯 Focus Mode Active';
      headline.textContent = 'Laser Focus In Progress';
      subtext.textContent = 'Only allowed educational sites are unlocked during your study session. Stay in the zone!';
      statusIcon.textContent = '⏱️';
      break;

    case 'parent_block':
      badgeText.className = 'badge badge-danger';
      badgeText.textContent = '🔒 Parent Lock Enforced';
      headline.textContent = 'Restricted by Your Parent';
      subtext.textContent = 'This website has been strictly locked by your parent. You cannot browse or unblock this website without your parent entering the Master PIN.';
      statusIcon.textContent = '🔒';
      break;

    case 'tamper_shield':
      badgeText.className = 'badge badge-danger';
      badgeText.textContent = '🔒 Parental Tamper Lock';
      headline.textContent = 'Settings Locked by Parent';
      subtext.textContent = 'Browser extensions and system settings are strictly protected by Parent PIN and cannot be altered.';
      statusIcon.textContent = '🔐';
      document.getElementById('parentOverrideBtn').style.display = 'none';
      break;

    default:
      badgeText.className = 'badge badge-shield';
      badgeText.textContent = '🚫 Distraction Blocked';
      headline.textContent = 'Time to Get Back to Work';
      subtext.textContent = 'This distracting website is locked during study hours so you can achieve your daily learning goals.';
      statusIcon.textContent = '📚';
  }

  // Set random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quoteContent').textContent = `"${randomQuote.text}"`;
  document.getElementById('quoteAuthor').textContent = `— ${randomQuote.author}`;

  // Action Buttons
  document.getElementById('returnBtn').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://google.com';
    }
  });

  // Parent PIN Override Modal
  initParentOverrideModal();

  // Initialize Ambient Focus Soundscapes
  initSoundscapes();

  // Initialize Dynamic Timer Countdown
  initTimerCountdown(currentDomain, currentReason);
});

// ==========================================
// 1. Ambient Focus Soundscapes (Web Audio Synth)
// ==========================================
function initSoundscapes() {
  const chips = document.querySelectorAll('.sound-chip');
  const statusLabel = document.getElementById('audioStatus');
  const volumeSlider = document.getElementById('soundVolume');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const soundType = chip.getAttribute('data-sound');
      const isAlreadyActive = chip.classList.contains('active');

      chips.forEach(c => c.classList.remove('active'));

      if (soundType === 'off' || isAlreadyActive) {
        stopSound();
        statusLabel.textContent = 'Off';
        statusLabel.style.color = 'var(--text-muted)';
        const offChip = document.querySelector('.sound-chip[data-sound="off"]');
        if (offChip) offChip.classList.add('active');
      } else {
        chip.classList.add('active');
        playSound(soundType);
        statusLabel.textContent = soundType.toUpperCase();
        statusLabel.style.color = '#34d399';
      }
    });
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      currentVolume = Number(e.target.value) / 100;
      if (masterGain && audioContext) {
        masterGain.gain.setValueAtTime(currentVolume, audioContext.currentTime);
      }
    });
  }

  // Clean up audio on page exit/navigate
  window.addEventListener('beforeunload', stopSound);
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
    const soundGain = audioContext.createGain();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(currentVolume, audioContext.currentTime);

    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      soundGain.gain.setValueAtTime(0.18, audioContext.currentTime);
    } else if (type === 'cafe') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, audioContext.currentTime);
      filter.Q.setValueAtTime(1.5, audioContext.currentTime);
      soundGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    } else { // white noise
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, audioContext.currentTime);
      soundGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(soundGain);
    soundGain.connect(masterGain);
    masterGain.connect(audioContext.destination);

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
  masterGain = null;
}

// ==========================================
// 2. Focus Timer Live Countdown Engine
// ==========================================
async function isPermanentlyBlocked(domain, reason) {
  // Explicit permanent reasons
  const permanentReasons = [
    'permanent_block',
    'parent_block',
    'content_filter',
    'keyword_filter',
    'tamper_shield'
  ];
  if (permanentReasons.includes(reason)) {
    return true;
  }

  // Check stored permanent blocked lists
  try {
    const data = await chrome.storage.local.get([
      'permanentBlocked',
      'parentBlockedWebsites'
    ]);

    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();

      // In Custom Permanent Block list
      if (Array.isArray(data.permanentBlocked)) {
        const isPerm = data.permanentBlocked.some(site => {
          const clean = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
          return cleanDomain === clean || cleanDomain.endsWith('.' + clean);
        });
        if (isPerm) return true;
      }

      // In Parent-Enforced Block list
      if (Array.isArray(data.parentBlockedWebsites)) {
        const isParent = data.parentBlockedWebsites.some(site => {
          const clean = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
          return cleanDomain === clean || cleanDomain.endsWith('.' + clean);
        });
        if (isParent) return true;
      }
    }

    // Default site_blocked without timer is permanent
    if (reason === 'site_blocked') {
      return true;
    }
  } catch (err) {
    console.warn('Error checking permanent block status:', err);
  }

  return false;
}

async function initTimerCountdown(domain, reason) {
  const timerCard = document.getElementById('timerCard');
  if (!timerCard) return;

  // 1. Check if the site is permanently blocked
  const permBlocked = await isPermanentlyBlocked(domain, reason);
  if (permBlocked) {
    // If permanently blocked, DO NOT display countdown
    timerCard.style.display = 'none';
    return;
  }

  // 2. Query active timer status
  await checkTimerStatus(domain, reason);

  // 3. Listen for timer state changes from popup or background
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.timerEndTime || changes.focusMode || changes.timerState) {
        checkTimerStatus(domain, reason);
      }
    }
  });
}

async function checkTimerStatus(domain, reason) {
  const timerCard = document.getElementById('timerCard');
  const timerCountdown = document.getElementById('timerCountdown');
  const timerCountdownText = document.getElementById('timerCountdownText');
  const timerProgressFill = document.getElementById('timerProgressFill');
  const timerRatio = document.getElementById('timerRatio');
  const timerSubtext = document.getElementById('timerSubtext');
  const timerCompletedMsg = document.getElementById('timerCompletedMsg');
  const unlockSiteBtn = document.getElementById('unlockSiteBtn');

  try {
    const data = await chrome.storage.local.get([
      'timerEndTime',
      'timerDuration',
      'focusMode',
      'timerState'
    ]);

    const now = Date.now();
    const hasActiveTimer = data.focusMode && data.timerEndTime && (data.timerEndTime > now);

    // If timer is active and site is blocked due to focus session
    if (hasActiveTimer && (reason === 'focus_mode' || !reason || reason === 'site_blocked')) {
      timerCard.style.display = 'block';
      timerSubtext.style.display = 'block';
      timerCompletedMsg.style.display = 'none';
      timerRatio.textContent = 'Temporary Lock';
      timerRatio.style.color = 'var(--text-muted)';

      if (countdownInterval) clearInterval(countdownInterval);

      const updateTick = () => {
        const remaining = data.timerEndTime - Date.now();
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          handleTimerComplete(domain);
          return;
        }

        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        timerCountdown.textContent = timeStr;

        if (mins > 0) {
          timerCountdownText.textContent = `${mins} minute${mins > 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
        } else {
          timerCountdownText.textContent = `${secs} second${secs !== 1 ? 's' : ''}`;
        }

        // Progress bar calculation
        const totalDurationMs = (data.timerDuration || 25) * 60 * 1000;
        const percent = Math.max(0, Math.min(100, (remaining / totalDurationMs) * 100));
        timerProgressFill.style.width = percent + '%';
      };

      updateTick();
      countdownInterval = setInterval(updateTick, 1000);
    } 
    // If timer just completed or was stopped while on this page
    else if (data.timerState === 'completed' || (!data.focusMode && !data.timerEndTime && timerCard.style.display === 'block')) {
      if (countdownInterval) clearInterval(countdownInterval);
      handleTimerComplete(domain);
    } 
    else {
      // No active timer session, hide countdown card
      if (countdownInterval) clearInterval(countdownInterval);
      timerCard.style.display = 'none';
    }
  } catch (e) {
    console.warn('Error reading timer state:', e);
  }
}

function handleTimerComplete(domain) {
  const timerCountdown = document.getElementById('timerCountdown');
  const timerProgressFill = document.getElementById('timerProgressFill');
  const timerRatio = document.getElementById('timerRatio');
  const timerSubtext = document.getElementById('timerSubtext');
  const timerCompletedMsg = document.getElementById('timerCompletedMsg');
  const unlockSiteBtn = document.getElementById('unlockSiteBtn');

  timerCountdown.textContent = '00:00';
  timerProgressFill.style.width = '0%';
  timerRatio.textContent = 'Access Unlocked';
  timerRatio.style.color = '#34d399';
  timerSubtext.style.display = 'none';
  timerCompletedMsg.style.display = 'flex';

  if (domain) {
    unlockSiteBtn.textContent = `🚀 Open ${domain}`;
    unlockSiteBtn.onclick = () => {
      window.location.href = `https://${domain}`;
    };
  } else {
    unlockSiteBtn.textContent = '🚀 Return to Browsing';
    unlockSiteBtn.onclick = () => {
      window.history.back();
    };
  }
}

// ==========================================
// 3. Parent PIN Override Modal
// ==========================================
function initParentOverrideModal() {
  const pinModal = document.getElementById('pinModal');
  const parentOverrideBtn = document.getElementById('parentOverrideBtn');
  const cancelPinBtn = document.getElementById('cancelPinBtn');
  const confirmPinBtn = document.getElementById('confirmPinBtn');
  const parentPinInput = document.getElementById('parentPinInput');
  const pinError = document.getElementById('pinError');

  parentOverrideBtn.addEventListener('click', () => {
    pinModal.classList.add('active');
    parentPinInput.value = '';
    pinError.style.display = 'none';
    parentPinInput.focus();
  });

  cancelPinBtn.addEventListener('click', () => {
    pinModal.classList.remove('active');
  });

  confirmPinBtn.addEventListener('click', handlePinSubmit);
  parentPinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlePinSubmit();
  });

  async function handlePinSubmit() {
    const enteredPin = parentPinInput.value.trim();
    if (!enteredPin) return;

    chrome.runtime.sendMessage({ action: 'verifyPin', pin: enteredPin }, (response) => {
      if (response && response.valid) {
        // Unlock domain for 10 minutes
        if (currentDomain) {
          chrome.runtime.sendMessage({ action: 'tempOverride', domain: currentDomain }, () => {
            pinModal.classList.remove('active');
            window.location.href = `https://${currentDomain}`;
          });
        } else {
          pinModal.classList.remove('active');
          window.history.back();
        }
      } else {
        pinError.style.display = 'block';
        parentPinInput.value = '';
        parentPinInput.focus();
      }
    });
  }
}