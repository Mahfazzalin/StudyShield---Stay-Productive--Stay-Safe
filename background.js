// StudyShield Background Service Worker (Manifest V3)
// Handles zero-latency blocking, parental tamper protection, SafeSearch enforcement, Pomodoro timer, and streak analytics.

// Default Adult & Harmful Domains (Always Active content filter)
const defaultBlockedDomains = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com',
  'youporn.com', 'xhamster.com', 'porn.com', 'tube8.com',
  'spankbang.com', 'eporner.com', 'txxx.com', 'hqporner.com',
  'xnxx.tv', 'beeg.com', 'porntrex.com', 'tnaflix.com',
  'youjizz.com', 'drtuber.com', 'nuvid.com', 'motherless.com',
  'upornia.com', '4tube.com', 'ixxx.com', 'sunporno.com',
  'alphaporno.com', 'cam4.com', 'chaturbate.com',
  'livejasmin.com', 'bongacams.com', 'stripchat.com', 'camsoda.com',
  'onlyfans.com', 'fansly.com', 'justforfans.com', 'pornhd.com',
  'empflix.com', 'porndig.com', 'fapality.com', 'brazzers.com',
  'naughtyamerica.com', 'bangbros.com', 'realitykings.com',
  'manyvids.com', 'camwhores.tv', 'erome.com', 'rule34.xxx'
];

// Default Adult & Dangerous Keywords (Always Active)
const defaultBlockedKeywords = [
  '1xbet', 'abuse', 'adult ai', 'adult bot', 'adult cam', 'fuck', 'fucking',
  'adult chat', 'adult dating', 'adult download', 'adult forum', 'adult game', 'adult video',
  'affair', 'ai girlfriend', 'ai nude', 'anal sex', 'bangbros',
  'bdsm', 'bet app', 'bet365', 'betting', 'blackjack', 'blackmail', 'blood video',
  'blowjob', 'bong', 'boobs', 'brazzers', 'brothel', 'buy cocaine', 'buy heroin', 'buy weed',
  'cam show', 'camgirl', 'cannabis', 'casino', 'chat sex', 'cocaine', 'credit card fraud',
  'cybercrime', 'dark market', 'darkweb', 'dating', 'deepfake', 'deepweb',
  'drug dealer', 'drug party', 'drugs online', 'ecstasy', 'erotic chat', 'erotic dance',
  'erotic story', 'erotic video', 'escort service', 'explicit porn', 'extreme sex',
  'fetish porn', 'fight club', 'free porn', 'gambling', 'gay porn', 'gay video', 'gaysex',
  'grindr', 'group sex', 'guns for sale', 'hardcore porn', 'hentai video', 'heroin',
  'hitman', 'hooker', 'hookup', 'hot porn', 'human trafficking', 'illegal drugs',
  'incest porn', 'intercourse', 'lap dance', 'lesbian porn', 'lesbian video', 'live sex',
  'lottery app', 'masturbate', 'meth drug', 'milf porn', 'murder video', 'naked girl',
  'naked boy', 'narcotic', 'naughty america', 'night club escort', 'nsfw video', 'nude ai',
  'nude chat', 'nude photo', 'one night stand', 'online casino', 'online scam', 'onlyfans leak',
  'orgasm', 'paid dating', 'phishing scam', 'playboy', 'poker game', 'porn download',
  'porn film', 'porn hub', 'porn site', 'porn video', 'private sex chat', 'prostitution',
  'ransomware', 'rape video', 'red light area', 'redtube', 'revenge porn', 'roulette online',
  'secret affair', 'seduction video', 'self harm', 'sex ai', 'sex chat', 'sex game',
  'sex movie', 'sex story', 'sexting', 'shemale porn', 'sports betting', 'strip club',
  'strip show', 'stripper', 'sugar baby', 'sugar daddy', 'suicide tutorial', 'teen porn',
  'threesome', 'tinder', 'torture video', 'trans porn', 'vape online', 'video chat sex',
  'webcam show', 'weed shop', 'xhamster', 'xnxx', 'xvideos', 'xxx video', 'youporn'
];

// Prelisted Distracting Websites (Grouped)
const prelistedDistractingSites = [
  // Social Media
  'facebook.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com',
  'snapchat.com', 'pinterest.com', 'tumblr.com', 'threads.net',
  // Video & Streaming
  'netflix.com', 'hulu.com', 'twitch.tv', 'vimeo.com', 'dailymotion.com',
  'disneyplus.com', 'hbomax.com', 'max.com', 'primevideo.com',
  // Gaming
  'roblox.com', 'minecraft.net', 'steamcommunity.com', 'store.steampowered.com',
  'epicgames.com', 'leagueoflegends.com', 'fortnite.com', 'poki.com', 'crazygames.com',
  // Shopping
  'amazon.com', 'aliexpress.com', 'ebay.com', 'shein.com', 'temu.com', 'etsy.com',
  // Entertainment & Memes
  '9gag.com', 'reddit.com', 'buzzfeed.com', 'imgur.com', '4chan.org'
];

// Temporary whitelist overrides allowed by Parent PIN (domain -> expiryTimestamp)
let tempOverrides = new Map();

// Helper: SHA-256 for secure PIN storage
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Format date YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Initialize default state
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get([
    'focusMode',
    'allowedWebsites',
    'permanentBlocked',
    'blockedKeywords',
    'timerDuration',
    'usePrelistedSites',
    'adultShieldEnabled',
    'parentalLockEnabled',
    'parentPinHash',
    'strictTamperGuard',
    'safeSearchEnabled',
    'soundscapesEnabled',
    'parentBlockedWebsites',
    'parentAllowedWebsites',
    'streakStats',
    'theme'
  ]);

  const defaultPinHash = await hashString('1234');

  const updates = {};
  if (data.focusMode === undefined) updates.focusMode = false;
  if (!data.allowedWebsites) updates.allowedWebsites = ['wikipedia.org', 'khanacademy.org', 'google.com', 'classroom.google.com', 'coursera.org'];
  if (!data.permanentBlocked) updates.permanentBlocked = [];
  if (!data.parentBlockedWebsites) updates.parentBlockedWebsites = [];
  if (!data.parentAllowedWebsites) updates.parentAllowedWebsites = [];
  if (!data.blockedKeywords) updates.blockedKeywords = [];
  if (!data.timerDuration) updates.timerDuration = 25;
  if (data.usePrelistedSites === undefined) updates.usePrelistedSites = true;
  if (data.adultShieldEnabled === undefined) updates.adultShieldEnabled = true;
  if (data.parentalLockEnabled === undefined) updates.parentalLockEnabled = true;
  if (!data.parentPinHash) updates.parentPinHash = defaultPinHash; // Default PIN 1234
  if (data.strictTamperGuard === undefined) updates.strictTamperGuard = true;
  if (data.safeSearchEnabled === undefined) updates.safeSearchEnabled = true;
  if (data.soundscapesEnabled === undefined) updates.soundscapesEnabled = true;
  if (!data.theme) updates.theme = 'dark';

  if (!data.streakStats) {
    updates.streakStats = {
      streakCount: 1,
      lastActiveDate: getTodayString(),
      todayFocusMinutes: 0,
      todayBlockedAttempts: 0,
      totalFocusMinutes: 0,
      xp: 50,
      weeklyHistory: []
    };
  }

  await chrome.storage.local.set(updates);

  // Set uninstall feedback/alert URL
  try {
    chrome.runtime.setUninstallURL('https://forms.gle/StudyShieldFeedbackAlert');
  } catch (e) {
    // Ignore if not permitted
  }

  // Sync DeclarativeNetRequest Dynamic Rules for zero-latency blocking
  await syncDeclarativeRules();

  // Enforce Anti-Tamper immediately on all open tabs (ON by default)
  await scanOpenTabsForTamperGuard();
});

// Scan on browser startup as well
chrome.runtime.onStartup.addListener(async () => {
  await scanOpenTabsForTamperGuard();
});

// Sync DeclarativeNetRequest Rules
async function syncDeclarativeRules() {
  if (!chrome.declarativeNetRequest) return;

  try {
    const data = await chrome.storage.local.get([
      'adultShieldEnabled',
      'usePrelistedSites',
      'permanentBlocked',
      'parentBlockedWebsites'
    ]);

    const domainsToBlock = new Map(); // domain -> reason

    // 1. Adult domains if adult shield is active
    if (data.adultShieldEnabled !== false) {
      defaultBlockedDomains.forEach(d => domainsToBlock.set(d, 'content_filter'));
    }

    // 2. Prelisted distracting domains
    if (data.usePrelistedSites) {
      prelistedDistractingSites.forEach(d => {
        if (!domainsToBlock.has(d)) domainsToBlock.set(d, 'site_blocked');
      });
    }

    // 3. Parent-enforced blocked domains (Locked by Parent PIN)
    if (Array.isArray(data.parentBlockedWebsites)) {
      data.parentBlockedWebsites.forEach(d => {
        const clean = d.trim().replace(/^https?:\/\//i, '').replace('www.', '').split('/')[0].toLowerCase();
        if (clean) domainsToBlock.set(clean, 'parent_block');
      });
    }

    // 4. Regular user blocked domains
    if (Array.isArray(data.permanentBlocked)) {
      data.permanentBlocked.forEach(d => {
        const clean = d.trim().replace(/^https?:\/\//i, '').replace('www.', '').split('/')[0].toLowerCase();
        if (clean && !domainsToBlock.has(clean)) domainsToBlock.set(clean, 'site_blocked');
      });
    }

    // Remove any currently temporary overridden domains
    const now = Date.now();
    for (let [domain, expiry] of tempOverrides.entries()) {
      if (expiry > now) {
        domainsToBlock.delete(domain);
      } else {
        tempOverrides.delete(domain);
      }
    }

    const blockedUrl = chrome.runtime.getURL('blocked.html');
    const newRules = [];
    let ruleId = 1;

    for (let [domain, reason] of domainsToBlock.entries()) {
      if (ruleId > 4500) break; // Chrome DNR dynamic rule limit is 5000
      newRules.push({
        id: ruleId++,
        priority: reason === 'parent_block' ? 2 : 1,
        action: {
          type: 'redirect',
          redirect: { url: `${blockedUrl}?reason=${reason}&domain=${encodeURIComponent(domain)}` }
        },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ['main_frame']
        }
      });
    }

    const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = currentRules.map(r => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeRuleIds,
      addRules: newRules
    });
  } catch (err) {
    console.warn('DeclarativeNetRequest sync error:', err);
  }
}

// Log a blocked attempt in today's stats
async function logBlockedAttempt(domain, reason) {
  try {
    const data = await chrome.storage.local.get(['streakStats']);
    const stats = data.streakStats || {
      streakCount: 1,
      lastActiveDate: getTodayString(),
      todayFocusMinutes: 0,
      todayBlockedAttempts: 0,
      totalFocusMinutes: 0,
      xp: 0
    };

    const today = getTodayString();
    if (stats.lastActiveDate !== today) {
      stats.lastActiveDate = today;
      stats.todayFocusMinutes = 0;
      stats.todayBlockedAttempts = 0;
    }

    stats.todayBlockedAttempts = (stats.todayBlockedAttempts || 0) + 1;
    stats.xp = (stats.xp || 0) + 2; // +2 XP for resisting distraction!

    await chrome.storage.local.set({ streakStats: stats });
  } catch (e) {
    console.error('Error logging blocked attempt:', e);
  }
}

// SafeSearch Enforcer: Google, Bing, DuckDuckGo, YouTube
function checkSafeSearch(url) {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    // Google SafeSearch
    if (host.includes('google.') && urlObj.pathname.startsWith('/search')) {
      if (urlObj.searchParams.get('safe') !== 'active') {
        urlObj.searchParams.set('safe', 'active');
        return urlObj.toString();
      }
    }

    // Bing SafeSearch
    if (host.includes('bing.com') && urlObj.pathname.startsWith('/search')) {
      if (urlObj.searchParams.get('adlt') !== 'strict') {
        urlObj.searchParams.set('adlt', 'strict');
        return urlObj.toString();
      }
    }

    // DuckDuckGo SafeSearch
    if (host.includes('duckduckgo.com')) {
      if (urlObj.searchParams.get('kp') !== '1') {
        urlObj.searchParams.set('kp', '1');
        return urlObj.toString();
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

// Check search queries for prohibited keywords
function checkKeywordViolation(url, userKeywords = []) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const searchKeys = ['q', 'query', 'search', 's', 'text', 'p', 'k'];

    let fullQuery = '';
    for (let key of searchKeys) {
      const val = params.get(key);
      if (val) fullQuery += ' ' + val.toLowerCase();
    }

    // Also check pathname
    fullQuery += ' ' + urlObj.pathname.toLowerCase().replace(/[-_/]/g, ' ');

    if (!fullQuery.trim()) return null;

    // Check adult keywords
    for (let kw of defaultBlockedKeywords) {
      if (fullQuery.includes(kw)) {
        return { violated: true, keyword: kw, reason: 'content_filter' };
      }
    }

    // Check user keywords
    for (let kw of userKeywords) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanKw && fullQuery.includes(cleanKw)) {
        return { violated: true, keyword: cleanKw, reason: 'keyword_filter' };
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

// Anti-Tamper helper to detect browser extension/settings pages
function isAntiTamperTarget(url) {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.startsWith('chrome://extensions') ||
    lower.startsWith('chrome://settings') ||
    lower.startsWith('edge://extensions') ||
    lower.startsWith('edge://settings') ||
    lower.startsWith('brave://extensions') ||
    lower.startsWith('brave://settings') ||
    lower.startsWith('opera://extensions') ||
    lower.startsWith('opera://settings') ||
    lower.startsWith('vivaldi://extensions') ||
    lower.startsWith('vivaldi://settings')
  );
}

// Redirect and block tamper tab safely
async function blockTamperTab(tabId) {
  try {
    await chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL('blocked.html?reason=tamper_shield')
    });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: '🛡️ StudyShield Anti-Tamper Guardian',
      message: 'Extension settings and uninstall options are protected by Parent PIN and cannot be altered.'
    });
  } catch (err) {
    // If Chrome blocks updating internal chrome:// page directly, close tab and display shield
    try {
      await chrome.tabs.remove(tabId);
      await chrome.tabs.create({ url: chrome.runtime.getURL('blocked.html?reason=tamper_shield') });
    } catch (e) {}
  }
}

// Scan all open tabs to enforce anti-tamper immediately
async function scanOpenTabsForTamperGuard() {
  try {
    const data = await chrome.storage.local.get(['parentalLockEnabled', 'strictTamperGuard']);
    if (data.parentalLockEnabled !== false && data.strictTamperGuard !== false) {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        const url = tab.pendingUrl || tab.url;
        if (isAntiTamperTarget(url)) {
          await blockTamperTab(tab.id);
        }
      }
    }
  } catch (e) {}
}

// Anti-Tamper & Tab Monitoring Listener
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const currentUrl = changeInfo.url || tab.pendingUrl || tab.url;
  if (!currentUrl) return;

  const data = await chrome.storage.local.get([
    'focusMode',
    'allowedWebsites',
    'permanentBlocked',
    'blockedKeywords',
    'usePrelistedSites',
    'adultShieldEnabled',
    'parentalLockEnabled',
    'strictTamperGuard',
    'safeSearchEnabled',
    'parentBlockedWebsites',
    'parentAllowedWebsites'
  ]);

  // 1. ANTI-TAMPER GUARDIAN: Block navigation to chrome://extensions or chrome://settings (ON by default)
  if (data.parentalLockEnabled !== false && data.strictTamperGuard !== false) {
    if (isAntiTamperTarget(currentUrl)) {
      await blockTamperTab(tabId);
      return;
    }
  }

  // 2. SafeSearch Enforcement
  if (data.safeSearchEnabled !== false) {
    const safeUrl = checkSafeSearch(currentUrl);
    if (safeUrl && safeUrl !== currentUrl) {
      chrome.tabs.update(tabId, { url: safeUrl });
      return;
    }
  }

  // Check temporary parent override
  try {
    const urlObj = new URL(currentUrl);
    const domain = urlObj.hostname.replace('www.', '').toLowerCase();
    if (tempOverrides.has(domain)) {
      if (tempOverrides.get(domain) > Date.now()) {
        return; // Temporarily allowed
      } else {
        tempOverrides.delete(domain);
      }
    }

    // 2.1 Check Parent-Enforced Blocklist (Children cannot bypass this)
    const parentBlocked = data.parentBlockedWebsites || [];
    const isParentBlocked = parentBlocked.some(site => {
      const clean = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
      return domain === clean || domain.endsWith('.' + clean);
    });

    if (isParentBlocked) {
      logBlockedAttempt(domain, 'parent_block');
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`blocked.html?reason=parent_block&domain=${encodeURIComponent(domain)}`)
      });
      return;
    }

    // 2.2 Check Parent-Approved Whitelist (Always allowed)
    const parentAllowed = data.parentAllowedWebsites || [];
    const isParentAllowed = parentAllowed.some(site => {
      const clean = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
      return domain === clean || domain.endsWith('.' + clean);
    });

    if (isParentAllowed) {
      return; // Parent has whitelisted this site permanently
    }

    // 3. Keyword Search Verification
    const keywordResult = checkKeywordViolation(currentUrl, data.blockedKeywords || []);
    if (keywordResult && keywordResult.violated) {
      logBlockedAttempt(domain, keywordResult.reason);
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`blocked.html?reason=${keywordResult.reason}&keyword=${encodeURIComponent(keywordResult.keyword)}`)
      });
      return;
    }

    // 4. Focus Mode Strict Whitelist
    if (data.focusMode) {
      const allowedList = data.allowedWebsites || [];
      const isAllowed = allowedList.some(site => {
        const cleanSite = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
        return domain === cleanSite || domain.endsWith('.' + cleanSite);
      });

      if (!isAllowed && !currentUrl.startsWith('chrome-extension://') && !currentUrl.startsWith('chrome://')) {
        logBlockedAttempt(domain, 'focus_mode');
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL(`blocked.html?reason=focus_mode&domain=${encodeURIComponent(domain)}`)
        });
        return;
      }
    }
  } catch (e) {
    // Ignore invalid URLs
  }
});

// Also monitor newly created tabs for Anti-Tamper
chrome.tabs.onCreated.addListener(async (tab) => {
  const currentUrl = tab.pendingUrl || tab.url;
  if (!currentUrl) return;
  const data = await chrome.storage.local.get(['parentalLockEnabled', 'strictTamperGuard']);
  if (data.parentalLockEnabled !== false && data.strictTamperGuard !== false) {
    if (isAntiTamperTarget(currentUrl)) {
      await blockTamperTab(tab.id);
    }
  }
});

// Also monitor tab switching/activation for Anti-Tamper
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const currentUrl = tab.pendingUrl || tab.url;
    if (isAntiTamperTarget(currentUrl)) {
      const data = await chrome.storage.local.get(['parentalLockEnabled', 'strictTamperGuard']);
      if (data.parentalLockEnabled !== false && data.strictTamperGuard !== false) {
        await blockTamperTab(tab.id);
      }
    }
  } catch (e) {}
});

// Pomodoro Timer Alarm Handling
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'focusTimer') {
    const data = await chrome.storage.local.get(['timerDuration', 'streakStats']);
    const sessionMins = data.timerDuration || 25;

    // Update streak stats & XP
    const stats = data.streakStats || {
      streakCount: 1,
      lastActiveDate: getTodayString(),
      todayFocusMinutes: 0,
      todayBlockedAttempts: 0,
      totalFocusMinutes: 0,
      xp: 0
    };

    const today = getTodayString();
    if (stats.lastActiveDate !== today) {
      // Check if studied yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (stats.lastActiveDate === yesterdayStr) {
        stats.streakCount = (stats.streakCount || 0) + 1;
      } else {
        stats.streakCount = 1;
      }
      stats.lastActiveDate = today;
      stats.todayFocusMinutes = 0;
      stats.todayBlockedAttempts = 0;
    }

    stats.todayFocusMinutes = (stats.todayFocusMinutes || 0) + sessionMins;
    stats.totalFocusMinutes = (stats.totalFocusMinutes || 0) + sessionMins;
    stats.xp = (stats.xp || 0) + 50; // +50 XP for completing a Pomodoro session!

    await chrome.storage.local.set({
      focusMode: false,
      timerEndTime: null,
      timerState: 'completed',
      streakStats: stats
    });

    // Notify User
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: '🎉 Focus Session Complete!',
      message: `Outstanding! You completed ${sessionMins} minutes of laser-focused study. +50 XP earned!`
    });
  }
});

// Message Handling from Popups and Blocked Page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      if (request.action === 'startTimer') {
        const duration = Number(request.duration) || 25;
        const endTime = Date.now() + (duration * 60 * 1000);

        await chrome.storage.local.set({
          timerEndTime: endTime,
          timerDuration: duration,
          focusMode: true,
          timerState: 'running'
        });

        chrome.alarms.create('focusTimer', { when: endTime });
        sendResponse({ success: true, endTime });
      } 
      else if (request.action === 'stopTimer') {
        chrome.alarms.clear('focusTimer');
        await chrome.storage.local.set({
          timerEndTime: null,
          focusMode: false,
          timerState: 'idle'
        });
        sendResponse({ success: true });
      }
      else if (request.action === 'syncRules') {
        await syncDeclarativeRules();
        sendResponse({ success: true });
      }
      else if (request.action === 'verifyPin') {
        const inputPin = String(request.pin || '').trim();
        const inputHash = await hashString(inputPin);
        const defaultHash = await hashString('1234');
        const data = await chrome.storage.local.get(['parentPinHash', 'isPinCustomized']);
        
        // If not customized yet, 1234 is unconditionally valid
        const isDefault = (inputPin === '1234' && !data.isPinCustomized);
        const currentHash = data.parentPinHash || defaultHash;
        const isValid = isDefault || (inputHash === currentHash);

        // Self-heal storage if needed
        if (!data.parentPinHash) {
          await chrome.storage.local.set({ parentPinHash: defaultHash, isPinCustomized: false });
        }
        sendResponse({ valid: isValid, isCustomized: !!data.isPinCustomized });
      }
      else if (request.action === 'setNewPin') {
        const newPin = String(request.pin || '').trim();
        const newHash = await hashString(newPin);
        await chrome.storage.local.set({ parentPinHash: newHash, isPinCustomized: true });
        sendResponse({ success: true });
      }
      else if (request.action === 'checkPinStatus') {
        const data = await chrome.storage.local.get(['isPinCustomized']);
        sendResponse({ isCustomized: !!data.isPinCustomized });
      }
      else if (request.action === 'tempOverride') {
        // Allow domain for 10 minutes
        const domain = request.domain.replace('www.', '').toLowerCase();
        tempOverrides.set(domain, Date.now() + (10 * 60 * 1000));
        await syncDeclarativeRules();
        sendResponse({ success: true });
      }
      else if (request.action === 'checkTamperGuard') {
        await scanOpenTabsForTamperGuard();
        sendResponse({ success: true });
      }
      else if (request.action === 'getTodayStats') {
        const data = await chrome.storage.local.get(['streakStats']);
        sendResponse({ stats: data.streakStats });
      }
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  })();

  return true; // Keep channel open for async response
});