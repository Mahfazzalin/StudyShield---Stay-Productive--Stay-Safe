let currentDomain = '';

// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentWebsite();
  loadSettings();
  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);
});

// Get current website
function loadCurrentWebsite() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      try {
        const url = new URL(tabs[0].url);
        currentDomain = url.hostname.replace('www.', '');
        
        // Update UI
        const icon = currentDomain.charAt(0).toUpperCase();
        document.getElementById('websiteIcon').textContent = icon;
        document.getElementById('websiteName').textContent = currentDomain;
        
        // Check if it's a chrome:// or extension page
        if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
          document.getElementById('quickAllow').disabled = true;
          document.getElementById('quickBlock').disabled = true;
          document.getElementById('websiteName').textContent = 'System Page';
        } else {
          updateQuickButtons();
        }
      } catch (e) {
        document.getElementById('websiteName').textContent = 'Invalid URL';
        document.getElementById('quickAllow').disabled = true;
        document.getElementById('quickBlock').disabled = true;
      }
    }
  });
}

// Update quick action buttons based on current lists
function updateQuickButtons() {
  chrome.storage.local.get(['allowedWebsites', 'permanentBlocked'], (data) => {
    const allowed = data.allowedWebsites || [];
    const blocked = data.permanentBlocked || [];
    
    const isAllowed = allowed.some(site => 
      site.replace('www.', '').toLowerCase() === currentDomain.toLowerCase()
    );
    const isBlocked = blocked.some(site => 
      site.replace('www.', '').toLowerCase() === currentDomain.toLowerCase()
    );
    
    // Update button text
    const allowBtn = document.getElementById('quickAllow');
    const blockBtn = document.getElementById('quickBlock');
    
    if (isAllowed) {
      allowBtn.innerHTML = '<span>✓</span> Allowed';
      allowBtn.style.opacity = '0.6';
    } else {
      allowBtn.innerHTML = '<span>✓</span> Allow';
      allowBtn.style.opacity = '1';
    }
    
    if (isBlocked) {
      blockBtn.innerHTML = '<span>✓</span> Blocked';
      blockBtn.style.opacity = '0.6';
    } else {
      blockBtn.innerHTML = '<span>✕</span> Block';
      blockBtn.style.opacity = '1';
    }
  });
}

function loadSettings() {
  chrome.storage.local.get([
    'focusMode',
    'allowedWebsites',
    'permanentBlocked',
    'blockedKeywords',
    'timerDuration',
    'usePrelistedSites'
  ], (data) => {
    document.getElementById('focusModeToggle').checked = data.focusMode || false;
    document.getElementById('prelistedToggle').checked = data.usePrelistedSites || false;
    document.getElementById('timerDuration').value = data.timerDuration || 25;
    
    renderList('allowedList', data.allowedWebsites || [], 'allowed');
    renderList('blockedList', data.permanentBlocked || [], 'blocked');
    renderList('keywordList', data.blockedKeywords || [], 'keyword');
    
    updateCounts(data);
  });
}

function updateCounts(data) {
  document.getElementById('allowedCount').textContent = (data.allowedWebsites || []).length;
  document.getElementById('blockedCount').textContent = (data.permanentBlocked || []).length;
  document.getElementById('keywordCount').textContent = (data.blockedKeywords || []).length;
}

function renderList(elementId, items, type) {
  const container = document.getElementById(elementId);
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${type === 'allowed' ? '📝' : type === 'blocked' ? '🚫' : '🔤'}</div>
        <div>No items added yet</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'list-item';
    
    const span = document.createElement('span');
    span.className = 'item-text';
    span.textContent = item;
    
    const buttons = document.createElement('div');
    buttons.className = 'item-buttons';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn edit';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => editItem(type, index, item));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', () => deleteItem(type, index));
    
    buttons.appendChild(editBtn);
    buttons.appendChild(deleteBtn);
    
    div.appendChild(span);
    div.appendChild(buttons);
    container.appendChild(div);
  });
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msg = document.getElementById('toastMessage');
  
  toast.className = isError ? 'toast error' : 'toast success';
  icon.textContent = isError ? '❌' : '✓';
  msg.textContent = message;
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Quick Actions
document.getElementById('quickAllow').addEventListener('click', () => {
  if (!currentDomain) return;
  
  chrome.storage.local.get(['allowedWebsites'], (data) => {
    const allowed = data.allowedWebsites || [];
    
    const exists = allowed.some(site => 
      site.replace('www.', '').toLowerCase() === currentDomain.toLowerCase()
    );
    
    if (exists) {
      showToast('Already in allowed list', true);
      return;
    }
    
    allowed.push(currentDomain);
    chrome.storage.local.set({ allowedWebsites: allowed }, () => {
      renderList('allowedList', allowed, 'allowed');
      updateQuickButtons();
      updateCounts({ allowedWebsites: allowed });
      showToast('Added to allowed list');
    });
  });
});

document.getElementById('quickBlock').addEventListener('click', () => {
  if (!currentDomain) return;
  
  chrome.storage.local.get(['permanentBlocked'], (data) => {
    const blocked = data.permanentBlocked || [];
    
    const exists = blocked.some(site => 
      site.replace('www.', '').toLowerCase() === currentDomain.toLowerCase()
    );
    
    if (exists) {
      showToast('Already in blocked list', true);
      return;
    }
    
    blocked.push(currentDomain);
    chrome.storage.local.set({ permanentBlocked: blocked }, () => {
      renderList('blockedList', blocked, 'blocked');
      updateQuickButtons();
      updateCounts({ permanentBlocked: blocked });
      showToast('Added to blocked list');
      
      // Reload current tab to apply block
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});

// Focus Mode Toggle
document.getElementById('focusModeToggle').addEventListener('change', (e) => {
  chrome.storage.local.set({ focusMode: e.target.checked }, () => {
    showToast(e.target.checked ? 'Focus Mode Enabled 🎯' : 'Focus Mode Disabled');
  });
});

// Prelisted Sites Toggle
document.getElementById('prelistedToggle').addEventListener('change', (e) => {
  chrome.storage.local.set({ usePrelistedSites: e.target.checked }, () => {
    showToast(e.target.checked ? 'Blocking 60+ Distracting Sites 📋' : 'Prelisted Sites Disabled');
  });
});

// View Prelisted Sites Button
document.getElementById('viewPrelistedBtn').addEventListener('click', () => {
  document.getElementById('prelistedModal').classList.add('show');
});

// Close Modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('prelistedModal').classList.remove('show');
});

// Close modal when clicking outside
document.getElementById('prelistedModal').addEventListener('click', (e) => {
  if (e.target.id === 'prelistedModal') {
    document.getElementById('prelistedModal').classList.remove('show');
  }
});

// Timer Functions
function updateTimerDisplay() {
  chrome.storage.local.get(['timerEndTime'], (data) => {
    if (data.timerEndTime) {
      const remaining = Math.max(0, data.timerEndTime - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      if (remaining <= 0) {
        chrome.storage.local.set({ timerEndTime: null });
      }
    } else {
      const duration = parseInt(document.getElementById('timerDuration').value) || 25;
      document.getElementById('timerDisplay').textContent = 
        `${String(duration).padStart(2, '0')}:00`;
    }
  });
}

document.getElementById('startTimer').addEventListener('click', () => {
  const duration = parseInt(document.getElementById('timerDuration').value);
  
  if (!duration || duration < 1) {
    showToast('Please enter valid duration', true);
    return;
  }
  
  chrome.storage.local.set({ timerDuration: duration });
  
  chrome.runtime.sendMessage({ 
    action: 'startTimer', 
    duration: duration 
  }, (response) => {
    if (response && response.success) {
      showToast(`Timer started: ${duration} minutes ⏱️`);
      updateTimerDisplay();
    }
  });
});

document.getElementById('stopTimer').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopTimer' }, (response) => {
    if (response && response.success) {
      showToast('Timer stopped');
      updateTimerDisplay();
    }
  });
});

// Add items
document.getElementById('addAllowed').addEventListener('click', () => {
  const input = document.getElementById('allowedInput');
  const website = input.value.trim().toLowerCase();
  
  if (!website) {
    showToast('Please enter a website', true);
    return;
  }
  
  chrome.storage.local.get(['allowedWebsites'], (data) => {
    const allowed = data.allowedWebsites || [];
    
    if (allowed.includes(website)) {
      showToast('Already in list', true);
      return;
    }
    
    allowed.push(website);
    chrome.storage.local.set({ allowedWebsites: allowed }, () => {
      renderList('allowedList', allowed, 'allowed');
      input.value = '';
      updateCounts({ allowedWebsites: allowed });
      updateQuickButtons();
      showToast('Website added');
    });
  });
});

document.getElementById('addBlocked').addEventListener('click', () => {
  const input = document.getElementById('blockedInput');
  const website = input.value.trim().toLowerCase();
  
  if (!website) {
    showToast('Please enter a website', true);
    return;
  }
  
  chrome.storage.local.get(['permanentBlocked'], (data) => {
    const blocked = data.permanentBlocked || [];
    
    if (blocked.includes(website)) {
      showToast('Already in list', true);
      return;
    }
    
    blocked.push(website);
    chrome.storage.local.set({ permanentBlocked: blocked }, () => {
      renderList('blockedList', blocked, 'blocked');
      input.value = '';
      updateCounts({ permanentBlocked: blocked });
      updateQuickButtons();
      showToast('Website added');
    });
  });
});

document.getElementById('addKeyword').addEventListener('click', () => {
  const input = document.getElementById('keywordInput');
  const keyword = input.value.trim().toLowerCase();
  
  if (!keyword) {
    showToast('Please enter a keyword', true);
    return;
  }
  
  chrome.storage.local.get(['blockedKeywords'], (data) => {
    const keywords = data.blockedKeywords || [];
    
    if (keywords.includes(keyword)) {
      showToast('Already in list', true);
      return;
    }
    
    keywords.push(keyword);
    chrome.storage.local.set({ blockedKeywords: keywords }, () => {
      renderList('keywordList', keywords, 'keyword');
      input.value = '';
      updateCounts({ blockedKeywords: keywords });
      showToast('Keyword added');
    });
  });
});

// Edit Item
function editItem(type, index, currentValue) {
  const newValue = prompt('Enter new value:', currentValue);
  
  if (!newValue || newValue.trim() === '') return;
  
  const storageKey = type === 'allowed' ? 'allowedWebsites' : 
                     type === 'blocked' ? 'permanentBlocked' : 'blockedKeywords';
  const listId = type === 'allowed' ? 'allowedList' : 
                 type === 'blocked' ? 'blockedList' : 'keywordList';
  
  chrome.storage.local.get([storageKey], (data) => {
    const items = data[storageKey] || [];
    items[index] = newValue.trim().toLowerCase();
    
    chrome.storage.local.set({ [storageKey]: items }, () => {
      renderList(listId, items, type);
      updateCounts({ [storageKey]: items });
      updateQuickButtons();
      showToast('Updated successfully');
    });
  });
}

// Delete Item
function deleteItem(type, index) {
  if (!confirm('Delete this item?')) return;
  
  const storageKey = type === 'allowed' ? 'allowedWebsites' : 
                     type === 'blocked' ? 'permanentBlocked' : 'blockedKeywords';
  const listId = type === 'allowed' ? 'allowedList' : 
                 type === 'blocked' ? 'blockedList' : 'keywordList';
  
  chrome.storage.local.get([storageKey], (data) => {
    const items = data[storageKey] || [];
    items.splice(index, 1);
    
    chrome.storage.local.set({ [storageKey]: items }, () => {
      renderList(listId, items, type);
      updateCounts({ [storageKey]: items });
      updateQuickButtons();
      showToast('Deleted successfully');
    });
  });
}

// Enter key support
document.getElementById('allowedInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('addAllowed').click();
});

document.getElementById('blockedInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('addBlocked').click();
});

document.getElementById('keywordInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('addKeyword').click();
});