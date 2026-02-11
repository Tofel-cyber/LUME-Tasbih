// ===== Adzan Auto State =====
let adzanEnabled = false;
let prayerTimes = {};
let adzanInterval = null;
let notificationPermission = false;

// Prayer names in Indonesian
const prayerNames = {
  fajr: 'Subuh',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya'
};

// ===== Initialize Adzan =====
function initAdzan() {
  loadAdzanSettings();
  
  if (adzanEnabled) {
    calculatePrayerTimes();
    startAdzanMonitoring();
  }
}

// ===== Load Settings =====
function loadAdzanSettings() {
  try {
    const saved = localStorage.getItem('adzan_enabled');
    adzanEnabled = saved === 'true';
    
    if (adzanEnabled) {
      updateAdzanButton(true);
    }
  } catch (error) {
    console.error('Error loading adzan settings:', error);
  }
}

// ===== Toggle Adzan =====
function toggleAdzan() {
  if (!premium) {
    showToast('Adzan Otomatis hanya untuk LUME+ Premium', 'error');
    return;
  }
  
  if (adzanEnabled) {
    // Disable
    adzanEnabled = false;
    localStorage.setItem('adzan_enabled', 'false');
    stopAdzanMonitoring();
    updateAdzanButton(false);
    showToast('Adzan Otomatis dinonaktifkan', 'success');
  } else {
    // Enable
    requestNotificationPermission();
  }
}

// ===== Request Notification Permission =====
function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Browser tidak support notifikasi', 'error');
    return;
  }
  
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      notificationPermission = true;
      adzanEnabled = true;
      localStorage.setItem('adzan_enabled', 'true');
      updateAdzanButton(true);
      calculatePrayerTimes();
      startAdzanMonitoring();
      showToast('✅ Adzan Otomatis aktif!', 'success');
    } else {
      showToast('Izin notifikasi ditolak', 'error');
    }
  });
}

// ===== Update Button UI =====
function updateAdzanButton(enabled) {
  const icon = document.getElementById('adzanIcon');
  const text = document.getElementById('adzanText');
  
  if (enabled) {
    icon.innerText = '🔔';
    text.innerText = 'Adzan Otomatis: Aktif';
  } else {
    icon.innerText = '🔕';
    text.innerText = 'Aktifkan Adzan Otomatis';
  }
}

// ===== Calculate Prayer Times =====
function calculatePrayerTimes() {
  // Using simplified calculation for demo
  // In production, use proper library like adhan.js or PrayTimes.js
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Simplified times (UTC+7 for Indonesia - adjust as needed)
  prayerTimes = {
    fajr: new Date(today.getTime() + (4 * 60 + 30) * 60000), // 04:30
    dhuhr: new Date(today.getTime() + (12 * 60 + 0) * 60000), // 12:00
    asr: new Date(today.getTime() + (15 * 60 + 15) * 60000), // 15:15
    maghrib: new Date(today.getTime() + (18 * 60 + 0) * 60000), // 18:00
    isha: new Date(today.getTime() + (19 * 60 + 15) * 60000) // 19:15
  };
  
  // Store in localStorage
  localStorage.setItem('prayer_times', JSON.stringify({
    date: today.toDateString(),
    times: prayerTimes
  }));
  
  console.log('Prayer times calculated:', prayerTimes);
}

// ===== Start Monitoring =====
function startAdzanMonitoring() {
  if (adzanInterval) {
    clearInterval(adzanInterval);
  }
  
  // Check every minute
  adzanInterval = setInterval(() => {
    checkPrayerTime();
  }, 60000); // 1 minute
  
  // Also check immediately
  checkPrayerTime();
}

// ===== Stop Monitoring =====
function stopAdzanMonitoring() {
  if (adzanInterval) {
    clearInterval(adzanInterval);
    adzanInterval = null;
  }
}

// ===== Check if Prayer Time =====
function checkPrayerTime() {
  if (!adzanEnabled) return;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const [prayer, time] of Object.entries(prayerTimes)) {
    const prayerMinutes = time.getHours() * 60 + time.getMinutes();
    
    // Check if within 1 minute of prayer time
    if (Math.abs(currentTime - prayerMinutes) < 1) {
      const lastNotified = localStorage.getItem(`adzan_last_${prayer}`);
      const today = new Date().toDateString();
      
      // Only notify once per day per prayer
      if (lastNotified !== today) {
        showAdzanNotification(prayer);
        localStorage.setItem(`adzan_last_${prayer}`, today);
      }
    }
  }
}

// ===== Show Adzan Notification =====
function showAdzanNotification(prayer) {
  const prayerName = prayerNames[prayer];
  
  // Browser notification
  if (notificationPermission && Notification.permission === 'granted') {
    new Notification('🕌 Waktu Sholat', {
      body: `Waktu ${prayerName} telah tiba.\n\nAllahu Akbar, Allahu Akbar`,
      icon: '/icon.png', // Add your icon
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      requireInteraction: true
    });
  }
  
  // In-app toast
  showToast(`🕌 Waktu ${prayerName} telah tiba`, 'success');
  
  // Vibration
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
  
  // Play adzan sound (if you have audio file)
  playAdzanSound();
  
  // Log to stats
  if (typeof logPrayerNotification === 'function') {
    logPrayerNotification(prayer);
  }
}

// ===== Play Adzan Sound =====
function playAdzanSound() {
  // You can add actual adzan audio file here
  // For demo, we'll use a simple beep
  
  try {
    if (!window.audioContext) {
      window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const context = window.audioContext;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing adzan sound:', error);
  }
}

// ===== Get Next Prayer =====
function getNextPrayer() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const [prayer, time] of Object.entries(prayerTimes)) {
    const prayerMinutes = time.getHours() * 60 + time.getMinutes();
    
    if (prayerMinutes > currentMinutes) {
      return {
        name: prayerNames[prayer],
        time: time,
        minutes: prayerMinutes - currentMinutes
      };
    }
  }
  
  // If no prayer left today, return tomorrow's Fajr
  return {
    name: prayerNames.fajr,
    time: new Date(prayerTimes.fajr.getTime() + 24 * 60 * 60000),
    minutes: (24 * 60) - currentMinutes + (prayerTimes.fajr.getHours() * 60 + prayerTimes.fajr.getMinutes())
  };
}

// ===== Format Time =====
function formatTime(date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===== Get Prayer Times Display =====
function getPrayerTimesDisplay() {
  const display = {};
  for (const [key, time] of Object.entries(prayerTimes)) {
    display[prayerNames[key]] = formatTime(time);
  }
  return display;
}

// ===== Initialize on window load =====
window.addEventListener('DOMContentLoaded', () => {
  if (premium) {
    initAdzan();
  }
});

// ===== Recalculate at midnight =====
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    calculatePrayerTimes();
  }
}, 60000);

// ===== Export functions =====
window.adzanFunctions = {
  getPrayerTimes: () => prayerTimes,
  getNextPrayer: getNextPrayer,
  getPrayerTimesDisplay: getPrayerTimesDisplay,
  isEnabled: () => adzanEnabled
};