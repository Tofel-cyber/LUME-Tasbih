// ===== Donasi State =====
let donasiEnabled = false;
let totalDonated = 0;
let donasiPercentage = 0.01; // 1% of zikir count

// Donation categories
const donasiCategories = {
  mosque: { name: '🕌 Pembangunan Masjid', amount: 0, color: '#22c55e' },
  education: { name: '📚 Pendidikan Anak Yatim', amount: 0, color: '#3b82f6' },
  food: { name: '🍚 Bantuan Pangan', amount: 0, color: '#f59e0b' }
};

// ===== Load Donasi Settings =====
function loadDonasiSettings() {
  try {
    const enabled = localStorage.getItem('donasi_enabled');
    const total = localStorage.getItem('donasi_total');
    const categories = localStorage.getItem('donasi_categories');
    
    donasiEnabled = enabled === 'true';
    totalDonated = parseFloat(total) || 0;
    
    if (categories) {
      const saved = JSON.parse(categories);
      Object.keys(donasiCategories).forEach(key => {
        if (saved[key]) {
          donasiCategories[key].amount = saved[key].amount || 0;
        }
      });
    }
  } catch (error) {
    console.error('Error loading donasi settings:', error);
  }
}

// ===== Save Donasi Settings =====
function saveDonasiSettings() {
  try {
    localStorage.setItem('donasi_enabled', donasiEnabled.toString());
    localStorage.setItem('donasi_total', totalDonated.toString());
    
    const categories = {};
    Object.keys(donasiCategories).forEach(key => {
      categories[key] = { amount: donasiCategories[key].amount };
    });
    localStorage.setItem('donasi_categories', JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving donasi settings:', error);
  }
}

// ===== Enable Donasi =====
function enableDonasi() {
  if (!premium) {
    showToast('Donasi Sosial hanya untuk LUME+ Premium', 'error');
    return;
  }
  
  if (donasiEnabled) {
    showToast('Donasi Sosial sudah aktif', 'success');
    closeModal('donasiModal');
    return;
  }
  
  donasiEnabled = true;
  saveDonasiSettings();
  
  showToast('✅ Donasi Sosial Auto aktif!\n1% dari setiap zikir akan didonasikan', 'success');
  closeModal('donasiModal');
  
  // Update button UI
  updateDonasiButton();
}

// ===== Disable Donasi =====
function disableDonasi() {
  if (!donasiEnabled) return;
  
  if (confirm('Nonaktifkan Donasi Sosial Auto?')) {
    donasiEnabled = false;
    saveDonasiSettings();
    showToast('Donasi Sosial dinonaktifkan', 'success');
    updateDonasiButton();
  }
}

// ===== Update Button UI =====
function updateDonasiButton() {
  const btn = document.querySelector('button[onclick="showDonasi()"]');
  if (btn) {
    if (donasiEnabled) {
      btn.innerHTML = '💚 Donasi Sosial: Aktif';
    } else {
      btn.innerHTML = '🤍 Donasi Sosial';
    }
  }
}

// ===== Process Donation (called when tap happens) =====
function processDonation(zikirCount) {
  if (!donasiEnabled) return;
  
  // Calculate donation amount based on zikir count
  const donationValue = zikirCount * donasiPercentage;
  
  // Distribute to categories (equal distribution)
  const perCategory = donationValue / 3;
  
  donasiCategories.mosque.amount += perCategory;
  donasiCategories.education.amount += perCategory;
  donasiCategories.food.amount += perCategory;
  
  totalDonated += donationValue;
  
  saveDonasiSettings();
  
  // Show milestone notifications
  checkDonationMilestones();
}

// ===== Check Donation Milestones =====
const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
let lastMilestone = 0;

function checkDonationMilestones() {
  const currentMilestone = milestones.find(m => totalDonated >= m && lastMilestone < m);
  
  if (currentMilestone) {
    lastMilestone = currentMilestone;
    localStorage.setItem('donasi_last_milestone', lastMilestone.toString());
    
    showToast(`🎉 Milestone! Total donasi ${currentMilestone} tercapai!\nBarakallahu fiik`, 'success');
    
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }
}

// ===== Get Donation Stats =====
function getDonasiStats() {
  return {
    enabled: donasiEnabled,
    total: totalDonated,
    categories: donasiCategories,
    percentage: donasiPercentage * 100
  };
}

// ===== Display Donation Summary =====
function displayDonasiSummary() {
  const content = document.getElementById('donasiContent');
  
  if (!content) return;
  
  const stats = getDonasiStats();
  
  let html = `
    <div class="donasi-summary">
      <div class="donasi-total">
        <h3>Total Donasi</h3>
        <div class="donasi-amount">${stats.total.toFixed(2)}</div>
        <p class="donasi-note">Setara dengan ${Math.floor(stats.total)} zikir</p>
      </div>
      
      <div class="donasi-breakdown">
        <h4>Distribusi Donasi</h4>
  `;
  
  Object.values(stats.categories).forEach(cat => {
    const percentage = stats.total > 0 ? ((cat.amount / stats.total) * 100).toFixed(1) : 0;
    html += `
      <div class="donasi-category">
        <div class="donasi-cat-header">
          <span>${cat.name}</span>
          <span>${cat.amount.toFixed(2)}</span>
        </div>
        <div class="donasi-progress-bar">
          <div class="donasi-progress-fill" style="width: ${percentage}%; background: ${cat.color};"></div>
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="donasi-info">
        <p>💡 Setiap 100 zikir = ${(100 * donasiPercentage).toFixed(1)} donasi otomatis</p>
        <p>Status: ${donasiEnabled ? '✅ Aktif' : '❌ Nonaktif'}</p>
      </div>
      
      ${donasiEnabled ? 
        '<button class="btn-danger" onclick="disableDonasi()">Nonaktifkan Donasi</button>' :
        '<button class="btn-lume" onclick="enableDonasi()">Aktifkan Donasi Auto</button>'
      }
    </div>
  `;
  
  content.innerHTML = html;
}

// ===== Show Donasi Modal =====
function showDonasi() {
  if (!premium) {
    showToast('Fitur Donasi hanya untuk LUME+ Premium', 'error');
    return;
  }
  
  displayDonasiSummary();
  document.getElementById('donasiModal').style.display = 'flex';
}

// ===== Initialize =====
window.addEventListener('DOMContentLoaded', () => {
  loadDonasiSettings();
  
  const saved = localStorage.getItem('donasi_last_milestone');
  if (saved) {
    lastMilestone = parseInt(saved);
  }
  
  if (premium) {
    updateDonasiButton();
  }
});

// ===== Hook into tasbih tap =====
// This will be called from tasbih.js
window.addEventListener('tasbihTap', (event) => {
  if (donasiEnabled && event.detail) {
    processDonation(event.detail.count);
  }
});

// ===== Export functions =====
window.donasiData = {
  isEnabled: () => donasiEnabled,
  getStats: getDonasiStats,
  getTotalDonated: () => totalDonated
};

// ===== Add CSS for donasi display =====
const style = document.createElement('style');
style.textContent = `
  .donasi-summary {
    text-align: left;
  }
  
  .donasi-total {
    background: var(--bg-card);
    padding: 20px;
    border-radius: var(--radius-md);
    margin: 16px 0;
    text-align: center;
  }
  
  .donasi-total h3 {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .donasi-amount {
    font-size: 48px;
    font-weight: bold;
    color: var(--color-success);
    margin: 12px 0;
  }
  
  .donasi-note {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .donasi-breakdown {
    margin: 20px 0;
  }
  
  .donasi-breakdown h4 {
    font-size: 18px;
    margin-bottom: 16px;
    color: var(--text-primary);
  }
  
  .donasi-category {
    margin: 12px 0;
  }
  
  .donasi-cat-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .donasi-progress-bar {
    width: 100%;
    height: 8px;
    background: var(--bg-card);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .donasi-progress-fill {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .donasi-info {
    background: var(--bg-card);
    padding: 16px;
    border-radius: var(--radius-md);
    margin: 16px 0;
    font-size: 14px;
    line-height: 1.6;
  }
  
  .donasi-info p {
    margin: 8px 0;
  }
  
  .btn-danger {
    background: linear-gradient(135deg, var(--color-danger) 0%, #dc2626 100%);
    color: #fff;
  }
`;
document.head.appendChild(style);