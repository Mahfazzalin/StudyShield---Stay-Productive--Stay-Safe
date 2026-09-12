// Content script to monitor and block content
(function() {
  'use strict';
  
  // Adult content keywords - ALWAYS ACTIVE
  const defaultBlockedKeywords = [
  '1xbet', 'abuse', 'adult', 'adult ai', 'adult bot', 'adult cam', 'fuck', 'fucking',
   'adult chat', 'adult dating', 'adult download', 'adult forum', 'adult game', 'adult video',
    'affair', 'ai girlfriend', 'ai nude', 'alcohol', 'alcohol store', 'anal', 'anal sex', 'bangbros',
     'bdsm', 'beer', 'bet app', 'bet365', 'betting', 'blackjack', 'blackmail', 'blood', 'blood video',
      'blowjob', 'bomb', 'bong', 'boobs', 'brazzers', 'breast', 'brothel', 'brothel house', 'bully',
       'bumble', 'buy cocaine', 'buy heroin', 'buy weed', 'cam show', 'camgirl', 'cannabis',
        'casino', 'chat sex', 'cocaine', 'cocaine delivery', 'condom', 'credit card fraud',
         'crime', 'cumshot', 'curse', 'cybercrime', 'dark market', 'darkweb', 'dating', 
         'death', 'deepfake', 'deepweb', 'drug', 'drug dealer', 'drug dealing', 'drug party',
          'drug shop', 'drugs online', 'ecstasy', 'erotic', 'erotic chat', 'erotic dance',
           'erotic story', 'erotic video', 'escort', 'escort service', 'explicit',
            'extreme sex', 'fetish', 'fetish porn', 'fight', 'fight club', 'fraud', 'gamble', 'gay porn', 'gay video', 'gaysex', 'grindr', 'group sex', 'gun', 'guns for sale', 'hack', 'hang', 'hardcore', 'hate', 'hentai', 'hentai video', 'heroin', 'hitman', 'hooker', 'hookup', 'hot video', 'human trafficking', 'illegal', 'illegal drugs', 'incest', 'incest story', 'intercourse', 'isis', 'jackpot', 'joint', 'kill', 'kill myself', 'kiss', 'knife', 'lap dance', 'lesbian', 'lesbian video', 'live sex', 'lottery', 'lust', 'lustful', 'malware', 'marijuana', 'masturbate', 'meth', 'milf', 'murder', 'murder plan', 'naked', 'naked boy', 'naked girl', 'narcotic', 'naughty america', 'nazi', 'night club', 'nsfw', 'nude', 'nude ai', 'nude chat', 'nude photo', 'one night stand', 'online casino', 'online scam', 'onlyfans', 'orgasm', 'paid dating', 'penis', 'phishing', 'playboy', 'poker', 'porn', 'porn download', 'porn film', 'porn hub', 'porn site', 'porn video', 'private chat', 'prostitute', 'prostitution', 'racist', 'ransomware', 'rape', 'rave party', 'red light area', 'redtube', 'revenge porn', 'roulette', 'scam', 'secret affair', 'seduce', 'seduction', 'self harm', 'sex', 'sex ai', 'sex chat', 'sex game', 'sex movie', 'sex story', 'sext', 'sexting', 'shemale', 'shoot', 'slave', 'smoke', 'smoke shop', 'softcore', 'sports betting', 'stolen', 'stolen data', 'strip club', 'strip show', 'stripper', 'sugar baby', 'sugar daddy', 'sugar dating', 'suicide', 'suicide plan', 'taboo', 'teen porn', 'terrorist', 'threesome', 'tinder', 'torture', 'torture video', 'trans porn', 'vagina', 'vape', 'vape shop', 'video chat', 'violence', 'vodka', 'vodka shop', 'voyeur', 'war', 'war video', 'weapon', 'webcam', 'webcam chat', 'webcam show', 'weed', 'weed delivery', 'whiskey', 'whiskey shop', 'wine', 'xnxx', 'xvideos', 'xxx', 'youporn'
  ];


  
  // Adult content domains - ALWAYS ACTIVE
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
    'empflix.com', 'porndig.com', 'fapality.com'
  ];
  
  // Check current page
  function checkCurrentPage() {
    chrome.storage.local.get([
      'focusMode',
      'allowedWebsites',
      'permanentBlocked',
      'blockedKeywords',
      'usePrelistedSites'
    ], (data) => {
      const currentUrl = window.location.href;
      const currentDomain = window.location.hostname.replace('www.', '');
      
      // ALWAYS CHECK ADULT CONTENT FIRST (regardless of any settings)
      // Check adult domains
      for (let domain of defaultBlockedDomains) {
        if (currentDomain.includes(domain) || domain.includes(currentDomain)) {
          blockPage('content_filter');
          return;
        }
      }
      
      // Check for adult content keywords in URL
      const urlLower = currentUrl.toLowerCase();
      for (let keyword of defaultBlockedKeywords) {
        if (urlLower.includes(keyword)) {
          blockPage('content_filter');
          return;
        }
      }
      
      // Check user keywords
      const userKeywords = data.blockedKeywords || [];
      for (let keyword of userKeywords) {
        if (urlLower.includes(keyword.toLowerCase())) {
          blockPage('keyword_filter');
          return;
        }
      }
      
      // Check focus mode
      if (data.focusMode) {
        const allowedWebsites = data.allowedWebsites || [];
        const isAllowed = allowedWebsites.some(site => {
          const cleanSite = site.replace('www.', '').toLowerCase();
          return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
        });
        
        if (!isAllowed) {
          blockPage('focus_mode');
          return;
        }
      }
      
      // Check prelisted sites
      if (data.usePrelistedSites) {
        // List of prelisted distracting sites
        const prelistedSites = [
          'snapchat.com', 'pinterest.com', 'linkedin.com', 'tumblr.com',
          'netflix.com', 'hulu.com', 'twitch.tv', 'vimeo.com',
          'dailymotion.com', 'disneyplus.com', 'hbomax.com', 'primevideo.com',
          'steam.com', 'epicgames.com', 'roblox.com', 'minecraft.net',
          'leagueoflegends.com', 'fortnite.com', 'playstation.com', 'xbox.com',
          'buzzfeed.com', 'cnn.com', 'bbc.com', 'espn.com', 'ign.com',
          'kotaku.com', 'polygon.com', 'theverge.com', 'mashable.com',
          'amazon.com', 'ebay.com', 'etsy.com', 'aliexpress.com', 'wish.com',
          'target.com', 'walmart.com', 'bestbuy.com',
          'tinder.com', 'bumble.com', 'match.com', 'okcupid.com', 'hinge.co',
          '4chan.org', '9gag.com', 'imgur.com', 'quora.com'
        ];
        
        const isPrelistedBlocked = prelistedSites.some(site => {
          const cleanSite = site.replace('www.', '').toLowerCase();
          return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
        });
        
        if (isPrelistedBlocked) {
          blockPage('prelisted_block');
          return;
        }
      }
      
      // Check permanent blocks
      const permanentBlocked = data.permanentBlocked || [];
      const isBlocked = permanentBlocked.some(site => {
        const cleanSite = site.replace('www.', '').toLowerCase();
        return currentDomain.includes(cleanSite) || cleanSite.includes(currentDomain);
      });
      
      if (isBlocked) {
        blockPage('permanent_block');
        return;
      }
    });
  }
  
  function blockPage(reason) {
    // Redirect to blocked page
    window.location.href = chrome.runtime.getURL('blocked.html') + '?reason=' + reason;
  }
  
  // Check on load
  checkCurrentPage();
  
  // Monitor for dynamic URL changes
  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      checkCurrentPage();
    }
  }).observe(document, { subtree: true, childList: true });
  
})();