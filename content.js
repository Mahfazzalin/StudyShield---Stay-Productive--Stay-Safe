// StudyShield Content Script
// Active content & search monitoring across web pages and single-page apps (SPAs)

(function() {
  'use strict';

  // Do not run on chrome-extension pages
  if (window.location.protocol === 'chrome-extension:' || window.location.protocol === 'chrome:') {
    return;
  }

  // Adult content keywords (Always active content guard)
  const defaultBlockedKeywords = [
    'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn', 'xhamster', 'spankbang',
    'eporner', 'onlyfans', 'fansly', 'chaturbate', 'livejasmin', 'stripchat',
    'hentai', 'deepfake nude', 'erotic video', 'hardcore sex', 'camgirl live',
    'escort service', 'sugar baby dating', 'free porn', 'xxx videos', 'sex webcam'
  ];

  function checkPageSafety() {
    try {
      chrome.storage.local.get([
        'focusMode',
        'allowedWebsites',
        'permanentBlocked',
        'blockedKeywords',
        'usePrelistedSites',
        'adultShieldEnabled'
      ], (data) => {
        if (chrome.runtime.lastError) return;

        const currentUrl = window.location.href.toLowerCase();
        const currentDomain = window.location.hostname.replace('www.', '').toLowerCase();

        // 1. Check Adult Keyword in URL or Page Title if adult shield is active
        if (data.adultShieldEnabled !== false) {
          const pageTitle = (document.title || '').toLowerCase();
          for (let kw of defaultBlockedKeywords) {
            if (currentUrl.includes(kw) || pageTitle.includes(kw)) {
              blockCurrentPage('content_filter', kw);
              return;
            }
          }
        }

        // 2. Check Custom User Blocked Keywords
        const userKeywords = data.blockedKeywords || [];
        const pageTitle = (document.title || '').toLowerCase();
        for (let kw of userKeywords) {
          const cleanKw = kw.toLowerCase().trim();
          if (cleanKw && (currentUrl.includes(cleanKw) || pageTitle.includes(cleanKw))) {
            blockCurrentPage('keyword_filter', cleanKw);
            return;
          }
        }

        // 3. Check Focus Mode (Allowed Sites Only)
        if (data.focusMode) {
          const allowedList = data.allowedWebsites || [];
          const isAllowed = allowedList.some(site => {
            const clean = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
            return currentDomain === clean || currentDomain.endsWith('.' + clean);
          });

          if (!isAllowed) {
            blockCurrentPage('focus_mode', currentDomain);
            return;
          }
        }

        // 4. Check Permanent Blocked List
        const permanentBlocked = data.permanentBlocked || [];
        const isBlocked = permanentBlocked.some(site => {
          const clean = site.replace(/^https?:\/\//i, '').replace('www.', '').toLowerCase();
          return currentDomain === clean || currentDomain.endsWith('.' + clean);
        });

        if (isBlocked) {
          blockCurrentPage('permanent_block', currentDomain);
          return;
        }
      });
    } catch (e) {
      // Storage access or context invalidated
    }
  }

  function blockCurrentPage(reason, target) {
    try {
      window.location.replace(
        chrome.runtime.getURL(`blocked.html?reason=${reason}&domain=${encodeURIComponent(target || window.location.hostname)}`)
      );
    } catch (e) {
      // Fallback
      window.location.href = chrome.runtime.getURL('blocked.html?reason=' + reason);
    }
  }

  // Initial check
  checkPageSafety();

  // Handle SPA navigation (YouTube, Twitter/X, etc.)
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      checkPageSafety();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      checkPageSafety();
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  window.addEventListener('popstate', checkPageSafety);
})();