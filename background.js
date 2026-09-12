// Default blocked keywords for adult content (ALWAYS ACTIVE - hidden feature)
const defaultBlockedKeywords = [
  '1xbet', 'abuse', 'adult', 'adult ai', 'adult bot', 'adult cam', 'fuck', 'fucking', 'adult chat', 'adult dating', 'adult download', 'adult forum', 'adult game', 'adult video', 'affair', 'ai girlfriend', 'ai nude', 'alcohol', 'alcohol store', 'anal', 'anal sex', 'bangbros', 'bdsm', 'beer', 'bet app', 'bet365', 'betting', 'blackjack', 'blackmail', 'blood', 'blood video', 'blowjob', 'bomb', 'bong', 'boobs', 'brazzers', 'breast', 'brothel', 'brothel house', 'bully', 'bumble', 'buy cocaine', 'buy heroin', 'buy weed', 'cam show', 'camgirl', 'cannabis', 'casino', 'chat sex', 'cocaine', 'cocaine delivery', 'condom', 'credit card fraud', 'crime', 'cumshot', 'curse', 'cybercrime', 'dark market', 'darkweb', 'dating', 'death', 'deepfake', 'deepweb', 'drug', 'drug dealer', 'drug dealing', 'drug party', 'drug shop', 'drugs online', 'ecstasy', 'erotic', 'erotic chat', 'erotic dance', 'erotic story', 'erotic video', 'escort', 'escort service', 'explicit', 'extreme sex', 'fetish', 'fetish porn', 'fight', 'fight club', 'fraud', 'gamble', 'gay porn', 'gay video', 'gaysex', 'grindr', 'group sex', 'gun', 'guns for sale', 'hack', 'hang', 'hardcore', 'hate', 'hentai', 'hentai video', 'heroin', 'hitman', 'hooker', 'hookup', 'hot video', 'human trafficking', 'illegal', 'illegal drugs', 'incest', 'incest story', 'intercourse', 'isis', 'jackpot', 'joint', 'kill', 'kill myself', 'kiss', 'knife', 'lap dance', 'lesbian', 'lesbian video', 'live sex', 'lottery', 'lust', 'lustful', 'malware', 'marijuana', 'masturbate', 'meth', 'milf', 'murder', 'murder plan', 'naked', 'naked boy', 'naked girl', 'narcotic', 'naughty america', 'nazi', 'night club', 'nsfw', 'nude', 'nude ai', 'nude chat', 'nude photo', 'one night stand', 'online casino', 'online scam', 'onlyfans', 'orgasm', 'paid dating', 'penis', 'phishing', 'playboy', 'poker', 'porn', 'porn download', 'porn film', 'porn hub', 'porn site', 'porn video', 'private chat', 'prostitute', 'prostitution', 'racist', 'ransomware', 'rape', 'rave party', 'red light area', 'redtube', 'revenge porn', 'roulette', 'scam', 'secret affair', 'seduce', 'seduction', 'self harm', 'sex', 'sex ai', 'sex chat', 'sex game', 'sex movie', 'sex story', 'sext', 'sexting', 'shemale', 'shoot', 'slave', 'smoke', 'smoke shop', 'softcore', 'sports betting', 'stolen', 'stolen data', 'strip club', 'strip show', 'stripper', 'sugar baby', 'sugar daddy', 'sugar dating', 'suicide', 'suicide plan', 'taboo', 'teen porn', 'terrorist', 'threesome', 'tinder', 'torture', 'torture video', 'trans porn', 'vagina', 'vape', 'vape shop', 'video chat', 'violence', 'vodka', 'vodka shop', 'voyeur', 'war', 'war video', 'weapon', 'webcam', 'webcam chat', 'webcam show', 'weed', 'weed delivery', 'whiskey', 'whiskey shop', 'wine', 'xnxx', 'xvideos', 'xxx', 'youporn'
  ];

// Default blocked domains for adult content (ALWAYS ACTIVE - hidden feature)
const defaultBlockedDomains = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com',
  'youporn.com', 'xhamster.com', 'porn.com', 'tube8.com',
  'spankbang.com', 'eporner.com', 'txxx.com', 'hqporner.com',
  'xnxx.tv', 'beeg.com', 'porntrex.com', 'tnaflix.com',
  'youjizz.com', 'drtuber.com', 'nuvid.com', 'motherless.com',
  'upornia.com', '4tube.com', 'ixxx.com', 'sunporno.com',
  'alphaporno.com', 'tube8.com', 'cam4.com', 'chaturbate.com',
  'livejasmin.com', 'bongacams.com', 'stripchat.com', 'camsoda.com',
  'onlyfans.com', 'fansly.com', 'justforfans.com', 'pornhd.com',
  'empflix.com', 'redtube.com', 'porndig.com', 'fapality.com'
];

// Pre-listed distracting websites (can be toggled on/off by user)
const prelistedDistractingSites = [
  // Social Media
  'snapchat.com', 'pinterest.com', 'linkedin.com', 'tumblr.com',
  
  // Video & Streaming
  'hulu.com', 'twitch.tv', 'vimeo.com',
  'dailymotion.com', 'disneyplus.com', 'hbomax.com', 'primevideo.com',
  
  // Gaming
  'steam.com', 'epicgames.com', 'twitch.tv', 'roblox.com', 'minecraft.net',
  'leagueoflegends.com', 'fortnite.com', 'playstation.com', 'xbox.com',
  
  // News & Entertainment
  'buzzfeed.com', 'cnn.com', 'bbc.com', 'espn.com', 'ign.com',
  'kotaku.com', 'polygon.com', 'theverge.com', 'mashable.com',
  
  // Shopping
  'amazon.com', 'ebay.com', 'etsy.com', 'aliexpress.com', 'wish.com',
  'target.com', 'walmart.com', 'bestbuy.com',
  
  // Dating
  'tinder.com', 'bumble.com', 'match.com', 'okcupid.com', 'hinge.co',
  
  // Forums & Communities
  '4chan.org', '9gag.com', 'imgur.com', 'quora.com'
];

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([
    'focusMode',
    'allowedWebsites',
    'permanentBlocked',
    'blockedKeywords',
    'timerDuration',
    'timerEndTime',
    'usePrelistedSites',
    'hasInitialized'
  ], (data) => {
    if (!data.focusMode) {
      chrome.storage.local.set({ focusMode: false });
    }
    if (!data.allowedWebsites) {
      chrome.storage.local.set({ allowedWebsites: [] });
    }
    if (!data.permanentBlocked) {
      chrome.storage.local.set({ permanentBlocked: [] });
    }
    if (!data.blockedKeywords) {
      chrome.storage.local.set({ blockedKeywords: [] });
    }
    if (!data.timerDuration) {
      chrome.storage.local.set({ timerDuration: 25 });
    }
    // Initialize prelisted sites option (off by default)
    if (data.usePrelistedSites === undefined) {
      chrome.storage.local.set({ usePrelistedSites: false });
    }
  });
});

// Check if URL should be blocked
function shouldBlockUrl(url, focusMode, allowedWebsites, permanentBlocked, usePrelistedSites) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // ALWAYS CHECK ADULT CONTENT FIRST (this runs regardless of any settings)
    // Check adult content domains
    for (let blockedDomain of defaultBlockedDomains) {
      if (domain.includes(blockedDomain) || blockedDomain.includes(domain)) {
        return { block: true, reason: 'content_filter' };
      }
    }
    
    // Check if URL contains adult keywords in path or query
    const fullUrl = url.toLowerCase();
    for (let keyword of defaultBlockedKeywords) {
      if (fullUrl.includes(keyword)) {
        return { block: true, reason: 'content_filter' };
      }
    }
    
    // Focus mode - only allow whitelisted sites
    if (focusMode) {
      const isAllowed = allowedWebsites.some(site => {
        const cleanSite = site.replace('www.', '').toLowerCase();
        return domain.includes(cleanSite) || cleanSite.includes(domain);
      });
      
      if (!isAllowed) {
        return { block: true, reason: 'focus_mode' };
      }
    }
    
    // Check prelisted distracting sites if enabled
    if (usePrelistedSites) {
      const isPrelistedBlocked = prelistedDistractingSites.some(site => {
        const cleanSite = site.replace('www.', '').toLowerCase();
        return domain.includes(cleanSite) || cleanSite.includes(domain);
      });
      
      if (isPrelistedBlocked) {
        return { block: true, reason: 'prelisted_block' };
      }
    }
    
    // Permanent blocking
    const isPermanentBlocked = permanentBlocked.some(site => {
      const cleanSite = site.replace('www.', '').toLowerCase();
      return domain.includes(cleanSite) || cleanSite.includes(domain);
    });
    
    if (isPermanentBlocked) {
      return { block: true, reason: 'permanent_block' };
    }
    
    return { block: false };
  } catch (e) {
    return { block: false };
  }
}

// Check search queries for blocked keywords
function checkSearchQuery(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    // Check common search parameter names
    const searchParams = ['q', 'query', 'search', 's', 'text'];
    
    for (let param of searchParams) {
      const query = params.get(param);
      if (query) {
        const lowerQuery = query.toLowerCase();
        
        // ALWAYS check adult keywords in searches (regardless of settings)
        for (let keyword of defaultBlockedKeywords) {
          if (lowerQuery.includes(keyword)) {
            return true;
          }
        }
        
        // Check user-defined keywords
        chrome.storage.local.get(['blockedKeywords'], (data) => {
          const userKeywords = data.blockedKeywords || [];
          for (let keyword of userKeywords) {
            if (lowerQuery.includes(keyword.toLowerCase())) {
              return true;
            }
          }
        });
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.storage.local.get([
      'focusMode',
      'allowedWebsites',
      'permanentBlocked',
      'blockedKeywords',
      'usePrelistedSites'
    ], (data) => {
      const result = shouldBlockUrl(
        changeInfo.url,
        data.focusMode,
        data.allowedWebsites || [],
        data.permanentBlocked || [],
        data.usePrelistedSites || false
      );
      
      const hasBlockedKeyword = checkSearchQuery(changeInfo.url);
      
      if (result.block || hasBlockedKeyword) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('blocked.html') + '?reason=' + result.reason
        });
      }
    });
  }
});

// Listen for new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url && tab.url !== 'chrome://newtab/') {
    chrome.storage.local.get([
      'focusMode',
      'allowedWebsites',
      'permanentBlocked',
      'usePrelistedSites'
    ], (data) => {
      const result = shouldBlockUrl(
        tab.url,
        data.focusMode,
        data.allowedWebsites || [],
        data.permanentBlocked || [],
        data.usePrelistedSites || false
      );
      
      if (result.block) {
        chrome.tabs.update(tab.id, {
          url: chrome.runtime.getURL('blocked.html') + '?reason=' + result.reason
        });
      }
    });
  }
});

// Timer management
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer') {
    // Timer ended, turn off focus mode
    chrome.storage.local.set({ 
      focusMode: false,
      timerEndTime: null 
    });
    
    // Notify user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Focus Session Complete',
      message: 'Your focus session has ended!'
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    const duration = request.duration;
    const endTime = Date.now() + (duration * 60 * 1000);
    
    chrome.storage.local.set({ 
      timerEndTime: endTime,
      focusMode: true 
    });
    
    chrome.alarms.create('focusTimer', { when: endTime });
    sendResponse({ success: true });
  } else if (request.action === 'stopTimer') {
    chrome.alarms.clear('focusTimer');
    chrome.storage.local.set({ 
      timerEndTime: null,
      focusMode: false 
    });
    sendResponse({ success: true });
  }
  
  return true;
});