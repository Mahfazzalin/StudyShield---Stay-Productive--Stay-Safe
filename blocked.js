// StudyShield Blocked Guardian Screen Script

const quotes = [
  { text: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { text: "Starve your distractions, feed your focus.", author: "Daniel Goleman" },
  { text: "You will never reach your destination if you stop and throw stones at every dog that barks.", author: "Winston Churchill" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" }
];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason') || 'site_blocked';
  const domain = params.get('domain') || '';
  const keyword = params.get('keyword') || '';

  const badgeText = document.getElementById('badgeText');
  const headline = document.getElementById('headline');
  const subtext = document.getElementById('subtext');
  const blockedTarget = document.getElementById('blockedTarget');
  const statusIcon = document.getElementById('statusIcon');

  // Display target info
  if (domain) {
    blockedTarget.textContent = '🌐 ' + domain;
  } else if (keyword) {
    blockedTarget.textContent = '🔍 Keyword: ' + keyword;
  } else {
    blockedTarget.style.display = 'none';
  }

  // Customize UI based on reason
  switch (reason) {
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

  // Button actions
  document.getElementById('returnBtn').addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://google.com';
    }
  });

  // Parent PIN Override Modal
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
        if (domain) {
          chrome.runtime.sendMessage({ action: 'tempOverride', domain }, () => {
            pinModal.classList.remove('active');
            window.location.href = `https://${domain}`;
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
});