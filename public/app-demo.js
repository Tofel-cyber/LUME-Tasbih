// ===== DEMO VERSION - No Pi SDK Required =====
// This is a demo version that works without Pi Network

let user = null;
let premium = false;
let paymentId = null;

// Load saved state
function loadState() {
  try {
    const savedUser = localStorage.getItem('lume_user');
    const savedPremium = localStorage.getItem('lume_premium');
    const savedPaymentId = localStorage.getItem('lume_payment_id');
    
    if (savedUser) {
      user = JSON.parse(savedUser);
      updateUserUI();
    }
    
    if (savedPremium === 'true' && savedPaymentId) {
      premium = true;
      paymentId = savedPaymentId;
      showPremiumBadge();
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// Save state
function saveState() {
  try {
    if (user) {
      localStorage.setItem('lume_user', JSON.stringify(user));
    }
    localStorage.setItem('lume_premium', premium.toString());
    if (paymentId) {
      localStorage.setItem('lume_payment_id', paymentId);
    }
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// ===== Initialize App =====
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  
  // Check if already logged in
  if (user) {
    showModeSection();
  }
  
  // Initialize stats
  if (typeof initStats === 'function') {
    initStats();
  }
});

// ===== Demo Login (No Pi SDK) =====
function login() {
  const loginBtn = document.getElementById('loginBtn');
  
  if (user) {
    showToast('Anda sudah login!', 'success');
    showModeSection();
    return;
  }
  
  showLoading(true);
  loginBtn.disabled = true;
  
  // Simulate login delay
  setTimeout(() => {
    // Create demo user
    user = {
      uid: 'demo_' + Date.now(),
      username: 'DemoUser' + Math.floor(Math.random() * 1000),
      publicKey: 'demo_public_key_' + Date.now()
    };
    
    saveState();
    updateUserUI();
    showModeSection();
    showToast(`Selamat datang, ${user.username}! 🎉`, 'success');
    showLoading(false);
  }, 1000);
}

// ===== Update User UI =====
function updateUserUI() {
  const status = document.getElementById('status');
  const userInfo = document.getElementById('userInfo');
  const loginSection = document.getElementById('loginSection');
  
  if (user) {
    status.innerText = `Assalamu'alaikum, ${user.username}`;
    userInfo.innerText = `👤 ${user.username} (Demo)`;
    userInfo.style.display = 'block';
    
    // Hide login button
    if (loginSection) {
      loginSection.style.display = 'none';
    }
  }
}

// ===== Show Mode Selection =====
function showModeSection() {
  document.getElementById('modeSection').style.display = 'block';
  
  if (premium) {
    showPremiumBadge();
    document.getElementById('lumeBtn').innerHTML = `
      <span class="btn-icon">✅</span> LUME+ Aktif (Demo)
      <small>Semua fitur premium tersedia</small>
    `;
  }
}

// ===== Start Free Mode =====
function startFree() {
  showTasbih();
  showToast('Mode Gratis aktif! 🆓', 'success');
}

// ===== Start LUME+ Premium (DEMO - No Payment) =====
function startLume() {
  if (!user) {
    showToast('Login dulu untuk mengakses LUME+', 'error');
    return;
  }
  
  if (premium) {
    showTasbih();
    document.getElementById('premiumPanel').style.display = 'block';
    showToast('LUME+ sudah aktif! ✨', 'success');
    return;
  }
  
  // Demo mode - no payment required
  if (!confirm('🎭 DEMO MODE\n\nAktifkan LUME+ Premium GRATIS?\n\n(Di Pi Network versi asli, ini memerlukan pembayaran 0.001 Pi)\n\nFitur:\n✅ Adzan Otomatis 5 Waktu\n✅ Statistik Lengkap\n✅ Custom Themes\n✅ Cloud Sync\n✅ Donasi Sosial Auto')) {
    return;
  }
  
  showLoading(true);
  
  // Simulate payment processing
  setTimeout(() => {
    premium = true;
    paymentId = 'demo_payment_' + Date.now();
    saveState();
    
    showLoading(false);
    showToast('🎉 LUME+ Premium aktif (Demo)!', 'success');
    
    // Update UI
    showPremiumBadge();
    showTasbih();
    document.getElementById('premiumPanel').style.display = 'block';
    
    // Update button
    document.getElementById('lumeBtn').innerHTML = `
      <span class="btn-icon">✅</span> LUME+ Aktif (Demo)
      <small>Semua fitur premium tersedia</small>
    `;
    
    // Initialize premium features
    if (typeof initAdzan === 'function') {
      initAdzan();
    }
  }, 1500);
}

// ===== Show Premium Badge =====
function showPremiumBadge() {
  const badge = document.getElementById('premiumBadge');
  if (badge) {
    badge.style.display = 'block';
  }
}

// ===== Show Tasbih Section =====
function showTasbih() {
  document.getElementById('tasbihSection').style.display = 'block';
  
  // Scroll to tasbih section
  setTimeout(() => {
    document.getElementById('tasbihSection').scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 300);
}

// ===== UI Helper Functions =====
function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// ===== Modal Controls =====
function setTarget() {
  document.getElementById('targetModal').style.display = 'flex';
}

function showStats() {
  if (!premium) {
    showToast('Fitur ini hanya untuk LUME+ Premium', 'error');
    return;
  }
  
  if (typeof displayStats === 'function') {
    displayStats();
  }
  document.getElementById('statsModal').style.display = 'flex';
}

function showDonasi() {
  if (!premium) {
    showToast('Fitur ini hanya untuk LUME+ Premium', 'error');
    return;
  }
  
  document.getElementById('donasiModal').style.display = 'flex';
}

// ===== Theme Changer =====
let currentTheme = 0;
const themes = [
  { name: 'Default', primary: '#2563eb', success: '#22c55e', warning: '#facc15' },
  { name: 'Purple Dream', primary: '#a855f7', success: '#8b5cf6', warning: '#c084fc' },
  { name: 'Ocean Blue', primary: '#0ea5e9', success: '#06b6d4', warning: '#22d3ee' },
  { name: 'Sunset', primary: '#f97316', success: '#fb923c', warning: '#fdba74' }
];

function changeTheme() {
  if (!premium) {
    showToast('Fitur theme hanya untuk LUME+ Premium', 'error');
    return;
  }
  
  currentTheme = (currentTheme + 1) % themes.length;
  const theme = themes[currentTheme];
  
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-success', theme.success);
  root.style.setProperty('--color-warning', theme.warning);
  
  showToast(`Theme: ${theme.name} 🎨`, 'success');
  localStorage.setItem('lume_theme', currentTheme.toString());
}

// Load saved theme
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('lume_theme');
  if (savedTheme && premium) {
    currentTheme = parseInt(savedTheme);
    changeTheme();
  }
});

// ===== Error Handler =====
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// ===== Prevent zoom on double tap (mobile) =====
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);