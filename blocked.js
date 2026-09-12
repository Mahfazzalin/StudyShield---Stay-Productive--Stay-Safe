// Motivational quotes for focus mode
const motivationalQuotes = [
  "Focus is the art of knowing what to ignore.",
  "You can't build a reputation on what you're going to do.",
  "The successful warrior is the average person, with laser-like focus.",
  "Where focus goes, energy flows.",
  "Concentrate all your thoughts upon the work at hand.",
  "Stay focused, go after your dreams and keep moving toward your goals.",
  "Focus on being productive instead of busy.",
  "The key to success is to focus our conscious mind on things we desire.",
  "Your focus determines your reality.",
  "Lack of direction, not lack of time, is the problem."
];

// Get block reason from URL
const urlParams = new URLSearchParams(window.location.search);
const reason = urlParams.get('reason');

const reasonElement = document.getElementById('reason');
const messageElement = document.getElementById('message');
const quoteElement = document.getElementById('quote');
const quoteTextElement = document.getElementById('quoteText');

// Set content based on reason
switch(reason) {
  case 'focus_mode':
    reasonElement.textContent = '🎯 Focus Mode is active. Only allowed websites can be accessed during your focus session.';
    messageElement.textContent = 'Stay focused on your goals!';
    showTimer();
    showMotivationalQuote();
    break;
  case 'prelisted_block':
    reasonElement.textContent = '📋 This website is on the prelisted distracting sites list.';
    messageElement.textContent = 'Stay productive!';
    showMotivationalQuote();
    break;
  case 'permanent_block':
    reasonElement.textContent = '🚫 This website is in your permanently blocked list.';
    messageElement.textContent = 'Stay on track!';
    showMotivationalQuote();
    break;
  case 'content_filter':
    reasonElement.textContent = '🛡️ This content has been filtered for your safety and wellbeing.';
    messageElement.textContent = 'Protected by content filter';
    break;
  case 'keyword_filter':
    reasonElement.textContent = '🔍 This search contains blocked keywords.';
    messageElement.textContent = 'Try searching for something else';
    break;
  default:
    reasonElement.textContent = '⛔ This website is currently blocked.';
    messageElement.textContent = 'Blocked by Focus Timer';
}

// Show motivational quote
function showMotivationalQuote() {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  quoteTextElement.textContent = randomQuote;
  quoteElement.style.display = 'block';
}

// Show timer for focus mode
function showTimer() {
  const timerContainer = document.getElementById('timerContainer');
  const timerElement = document.getElementById('timer');
  timerContainer.style.display = 'block';
  
  function updateTimer() {
    chrome.storage.local.get(['timerEndTime'], (data) => {
      if (data.timerEndTime) {
        const remaining = Math.max(0, data.timerEndTime - Date.now());
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        timerElement.textContent = 
          `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (remaining > 0) {
          setTimeout(updateTimer, 1000);
        } else {
          timerElement.textContent = 'Session Complete!';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    });
  }
  
  updateTimer();
}

// Event listeners (no inline handlers)
document.getElementById('goBackBtn').addEventListener('click', () => {
  window.history.back();
});