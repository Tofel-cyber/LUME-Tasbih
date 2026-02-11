// ===== Tasbih State =====
let count = 0;
let target = 33;
let todayCount = 0;
let totalCount = 0;

// ===== Initialize =====
function initTasbih() {
  loadTasbihData();
  updateDisplay();
  updateProgress();
}

// ===== Load Saved Data =====
function loadTasbihData() {
  try {
    const savedCount = localStorage.getItem('tasbih_count');
    const savedTarget = localStorage.getItem('tasbih_target');
    const savedToday = localStorage.getItem('tasbih_today');
    const savedTotal = localStorage.getItem('tasbih_total');
    const savedDate = localStorage.getItem('tasbih_date');
    
    const today = new Date().toDateString();
    
    // Reset daily count if new day
    if (savedDate !== today) {
      todayCount = 0;
      localStorage.setItem('tasbih_date', today);
      localStorage.setItem('tasbih_today', '0');
    } else {
      todayCount = parseInt(savedToday) || 0;
    }
    
    count = parseInt(savedCount) || 0;
    target = parseInt(savedTarget) || 33;
    totalCount = parseInt(savedTotal) || 0;
    
  } catch (error) {
    console.error('Error loading tasbih data:', error);
  }
}

// ===== Save Data =====
function saveTasbihData() {
  try {
    localStorage.setItem('tasbih_count', count.toString());
    localStorage.setItem('tasbih_target', target.toString());
    localStorage.setItem('tasbih_today', todayCount.toString());
    localStorage.setItem('tasbih_total', totalCount.toString());
  } catch (error) {
    console.error('Error saving tasbih data:', error);
  }
}

// ===== Tap/Count Function =====
function tap() {
  count++;
  todayCount++;
  totalCount++;
  
  // Update display
  updateDisplay();
  updateProgress();
  saveTasbihData();
  
  // Visual feedback
  const counterEl = document.getElementById('count');
  counterEl.classList.add('pulse');
  setTimeout(() => counterEl.classList.remove('pulse'), 300);
  
  // Vibration feedback
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  // Play sound (if available)
  playClickSound();
  
  // Check if target reached
  if (count === target) {
    targetReached();
  }
  
  // Update stats if function exists
  if (typeof updateTasbihStats === 'function') {
    updateTasbihStats(count, todayCount, totalCount);
  }
}

// ===== Update Display =====
function updateDisplay() {
  document.getElementById('count').innerText = count;
  document.getElementById('todayCount').innerText = todayCount;
  document.getElementById('totalCount').innerText = totalCount.toLocaleString();
  document.getElementById('targetInfo').innerText = `Target: ${target}`;
}

// ===== Update Progress Bar =====
function updateProgress() {
  const percentage = Math.min((count / target) * 100, 100);
  document.getElementById('progressFill').style.width = percentage + '%';
}

// ===== Target Reached =====
function targetReached() {
  // Vibration pattern for success
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
  
  // Show celebration
  showToast(`🎉 Target ${target} tercapai! Alhamdulillah`, 'success');
  
  // Confetti effect (if available)
  if (typeof showConfetti === 'function') {
    showConfetti();
  }
  
  // Auto-reset or ask user
  setTimeout(() => {
    if (confirm(`Target ${target} tercapai!\n\nReset counter untuk target baru?`)) {
      count = 0;
      updateDisplay();
      updateProgress();
      saveTasbihData();
    }
  }, 1500);
}

// ===== Reset Counter =====
function reset() {
  if (count === 0) {
    showToast('Counter sudah 0', 'error');
    return;
  }
  
  if (confirm(`Reset counter dari ${count} ke 0?`)) {
    count = 0;
    updateDisplay();
    updateProgress();
    saveTasbihData();
    
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    showToast('Counter direset! 🔄', 'success');
  }
}

// ===== Set Custom Target =====
function setCustomTarget(value) {
  target = value;
  updateDisplay();
  updateProgress();
  saveTasbihData();
  closeModal('targetModal');
  showToast(`Target diset ke ${value}! 🎯`, 'success');
}

function applyCustomTarget() {
  const input = document.getElementById('customTargetInput');
  const value = parseInt(input.value);
  
  if (!value || value < 1) {
    showToast('Target harus lebih dari 0', 'error');
    return;
  }
  
  if (value > 100000) {
    showToast('Target terlalu besar (max: 100,000)', 'error');
    return;
  }
  
  setCustomTarget(value);
  input.value = '';
}

// ===== Sound Effect =====
let audioContext;
let clickSound;

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (error) {
    console.log('Web Audio API not supported');
  }
}

function playClickSound() {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Silently fail
  }
}

// ===== Initialize on load =====
window.addEventListener('DOMContentLoaded', () => {
  initTasbih();
  initAudio();
});

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (event) => {
  const tasbihVisible = document.getElementById('tasbihSection').style.display !== 'none';
  
  if (!tasbihVisible) return;
  
  // Space or Enter to tap
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    tap();
  }
  
  // R to reset
  if (event.code === 'KeyR' && event.ctrlKey) {
    event.preventDefault();
    reset();
  }
  
  // T to set target
  if (event.code === 'KeyT' && event.ctrlKey) {
    event.preventDefault();
    setTarget();
  }
});

// ===== Swipe gestures (mobile) =====
let touchStartY = 0;

document.addEventListener('touchstart', (event) => {
  touchStartY = event.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (event) => {
  const touchEndY = event.changedTouches[0].clientY;
  const diff = touchStartY - touchEndY;
  
  // Swipe up to reset (with confirmation)
  if (diff > 100) {
    reset();
  }
}, { passive: true });

// ===== Auto-save on visibility change =====
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveTasbihData();
  }
});

// ===== Export for other modules =====
window.tasbihData = {
  getCount: () => count,
  getTodayCount: () => todayCount,
  getTotalCount: () => totalCount,
  getTarget: () => target,
  reset: reset
};