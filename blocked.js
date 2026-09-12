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
let soundMasterGain = null;
let currentVolume = 0.8;
let soundTimerHandle = null;
let activeAudioNodes = [];

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
// 1. Ambient Focus & Sleep Soundscapes (Web Audio Synth)
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
      if (soundMasterGain && audioContext) {
        soundMasterGain.gain.setValueAtTime(currentVolume, audioContext.currentTime);
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
    soundMasterGain = audioContext.createGain();
    soundMasterGain.gain.setValueAtTime(currentVolume, audioContext.currentTime);
    soundMasterGain.connect(audioContext.destination);

    const sampleRate = audioContext.sampleRate;
    const createNoiseBuffer = (seconds = 2, transform = null) => {
      const bufferSize = sampleRate * seconds;
      const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = transform ? transform(i, bufferSize) : (Math.random() * 2 - 1);
      }
      return buffer;
    };

    if (type === 'rain') {
      // 🌧️ Gentle Rainfall
      const noise = audioContext.createBufferSource();
      noise.buffer = createNoiseBuffer(2);
      noise.loop = true;
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.18, audioContext.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(soundMasterGain);
      noise.start(0);
      activeAudioNodes.push(noise, filter, gain);
    } 
    else if (type === 'thunder') {
      // ⛈️ Rain + Rolling Thunderstorm
      // 1. Steady rain background
      const rainNoise = audioContext.createBufferSource();
      rainNoise.buffer = createNoiseBuffer(2);
      rainNoise.loop = true;
      const rainFilter = audioContext.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(750, audioContext.currentTime);
      const rainGain = audioContext.createGain();
      rainGain.gain.setValueAtTime(0.15, audioContext.currentTime);

      rainNoise.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(soundMasterGain);
      rainNoise.start(0);
      activeAudioNodes.push(rainNoise, rainFilter, rainGain);

      // 2. Thunder sub-bass & deep rumble generator
      const thunderNoise = audioContext.createBufferSource();
      thunderNoise.buffer = createNoiseBuffer(4);
      thunderNoise.loop = true;
      const thunderFilter = audioContext.createBiquadFilter();
      thunderFilter.type = 'lowpass';
      thunderFilter.frequency.setValueAtTime(110, audioContext.currentTime);
      thunderFilter.Q.setValueAtTime(2.2, audioContext.currentTime);

      const thunderGain = audioContext.createGain();
      thunderGain.gain.setValueAtTime(0.001, audioContext.currentTime);

      const subOsc = audioContext.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(48, audioContext.currentTime);
      const subGain = audioContext.createGain();
      subGain.gain.setValueAtTime(0.001, audioContext.currentTime);

      thunderNoise.connect(thunderFilter);
      thunderFilter.connect(thunderGain);
      thunderGain.connect(soundMasterGain);

      subOsc.connect(subGain);
      subGain.connect(soundMasterGain);

      thunderNoise.start(0);
      subOsc.start(0);
      activeAudioNodes.push(thunderNoise, thunderFilter, thunderGain, subOsc, subGain);

      const triggerThunderRoll = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        const now = audioContext.currentTime;
        const duration = 3.5 + Math.random() * 2.5;
        const peakVol = 0.30 + Math.random() * 0.15;

        thunderGain.gain.cancelScheduledValues(now);
        thunderGain.gain.setValueAtTime(0.001, now);
        thunderGain.gain.linearRampToValueAtTime(peakVol, now + 1.1);
        thunderGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        subGain.gain.cancelScheduledValues(now);
        subGain.gain.setValueAtTime(0.001, now);
        subGain.gain.linearRampToValueAtTime(peakVol * 0.75, now + 0.9);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.5);

        subOsc.frequency.cancelScheduledValues(now);
        subOsc.frequency.setValueAtTime(56, now);
        subOsc.frequency.exponentialRampToValueAtTime(38, now + duration);
      };

      setTimeout(triggerThunderRoll, 1000);
      soundTimerHandle = setInterval(triggerThunderRoll, 9000 + Math.random() * 5000);
    }
    else if (type === 'ocean') {
      // 🌊 Rhythmic Ocean Waves
      const noise = audioContext.createBufferSource();
      noise.buffer = createNoiseBuffer(3);
      noise.loop = true;

      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, audioContext.currentTime);

      const waveGain = audioContext.createGain();
      waveGain.gain.setValueAtTime(0.12, audioContext.currentTime);

      const lfo = audioContext.createOscillator();
      lfo.frequency.setValueAtTime(0.13, audioContext.currentTime);
      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(0.09, audioContext.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(waveGain.gain);

      noise.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(soundMasterGain);

      noise.start(0);
      lfo.start(0);
      activeAudioNodes.push(noise, filter, waveGain, lfo, lfoGain);
    }
    else if (type === 'forest') {
      // 🌲 Forest Wind & Gentle Bird Chirps
      const noise = audioContext.createBufferSource();
      noise.buffer = createNoiseBuffer(3);
      noise.loop = true;

      const bandFilter = audioContext.createBiquadFilter();
      bandFilter.type = 'bandpass';
      bandFilter.frequency.setValueAtTime(820, audioContext.currentTime);
      bandFilter.Q.setValueAtTime(1.2, audioContext.currentTime);

      const windGain = audioContext.createGain();
      windGain.gain.setValueAtTime(0.12, audioContext.currentTime);

      const windLfo = audioContext.createOscillator();
      windLfo.frequency.setValueAtTime(0.2, audioContext.currentTime);
      const windLfoGain = audioContext.createGain();
      windLfoGain.gain.setValueAtTime(0.06, audioContext.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windGain.gain);

      noise.connect(bandFilter);
      bandFilter.connect(windGain);
      windGain.connect(soundMasterGain);

      noise.start(0);
      windLfo.start(0);
      activeAudioNodes.push(noise, bandFilter, windGain, windLfo, windLfoGain);

      const chirpBird = () => {
        if (!audioContext || audioContext.state === 'closed') return;
        try {
          const chirpOsc = audioContext.createOscillator();
          const chirpGain = audioContext.createGain();
          const now = audioContext.currentTime;
          const startFreq = 2600 + Math.random() * 600;
          chirpOsc.type = 'sine';
          chirpOsc.frequency.setValueAtTime(startFreq, now);
          chirpOsc.frequency.exponentialRampToValueAtTime(startFreq + 500, now + 0.12);
          chirpOsc.frequency.exponentialRampToValueAtTime(startFreq - 200, now + 0.24);

          chirpGain.gain.setValueAtTime(0.001, now);
          chirpGain.gain.linearRampToValueAtTime(0.035, now + 0.05);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          chirpOsc.connect(chirpGain);
          chirpGain.connect(soundMasterGain);
          chirpOsc.start(now);
          chirpOsc.stop(now + 0.3);
        } catch (e) {}
      };
      soundTimerHandle = setInterval(chirpBird, 5500 + Math.random() * 4000);
    }
    else if (type === 'campfire') {
      // 🕯️ Cozy Fireplace with Crackles
      const baseNoise = audioContext.createBufferSource();
      baseNoise.buffer = createNoiseBuffer(2);
      baseNoise.loop = true;
      const baseFilter = audioContext.createBiquadFilter();
      baseFilter.type = 'lowpass';
      baseFilter.frequency.setValueAtTime(260, audioContext.currentTime);
      const baseGain = audioContext.createGain();
      baseGain.gain.setValueAtTime(0.14, audioContext.currentTime);

      baseNoise.connect(baseFilter);
      baseFilter.connect(baseGain);
      baseGain.connect(soundMasterGain);
      baseNoise.start(0);
      activeAudioNodes.push(baseNoise, baseFilter, baseGain);

      const crackleBuffer = createNoiseBuffer(3, () => {
        return Math.random() < 0.0025 ? (Math.random() * 2 - 1) : (Math.random() * 0.02 - 0.01);
      });
      const crackleSource = audioContext.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;
      const crackleFilter = audioContext.createBiquadFilter();
      crackleFilter.type = 'bandpass';
      crackleFilter.frequency.setValueAtTime(1600, audioContext.currentTime);
      crackleFilter.Q.setValueAtTime(2.0, audioContext.currentTime);
      const crackleGain = audioContext.createGain();
      crackleGain.gain.setValueAtTime(0.20, audioContext.currentTime);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(soundMasterGain);
      crackleSource.start(0);
      activeAudioNodes.push(crackleSource, crackleFilter, crackleGain);
    }
    else if (type === 'cafe') {
      // ☕ Warm Cafe Ambiance
      const noise = audioContext.createBufferSource();
      noise.buffer = createNoiseBuffer(2);
      noise.loop = true;
      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, audioContext.currentTime);
      filter.Q.setValueAtTime(1.5, audioContext.currentTime);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.20, audioContext.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(soundMasterGain);
      noise.start(0);
      activeAudioNodes.push(noise, filter, gain);
    }
    else if (type === 'brown') {
      // 🌌 Deep Sleep & Alpha-Wave Brown Noise
      const noise = audioContext.createBufferSource();
      noise.buffer = createNoiseBuffer(2);
      noise.loop = true;
      const filter1 = audioContext.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(200, audioContext.currentTime);
      const filter2 = audioContext.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(200, audioContext.currentTime);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.28, audioContext.currentTime);

      noise.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(gain);
      gain.connect(soundMasterGain);
      noise.start(0);
      activeAudioNodes.push(noise, filter1, filter2, gain);
    }
    else {
      // 📻 Standard White Noise
      const noise = audioContext.createBufferSource();
      noise.buffer = createNoiseBuffer(2);
      noise.loop = true;
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, audioContext.currentTime);
      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(soundMasterGain);
      noise.start(0);
      activeAudioNodes.push(noise, filter, gain);
    }
  } catch (err) {
    console.warn('Audio synthesis error:', err);
  }
}

function stopSound() {
  if (soundTimerHandle) {
    clearInterval(soundTimerHandle);
    soundTimerHandle = null;
  }
  activeAudioNodes.forEach(node => {
    try { if (node.stop) node.stop(); } catch (e) {}
    try { if (node.disconnect) node.disconnect(); } catch (e) {}
  });
  activeAudioNodes = [];

  if (audioContext) {
    try { audioContext.close(); } catch (e) {}
    audioContext = null;
  }
  soundMasterGain = null;
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