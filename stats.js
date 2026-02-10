// ===== Stats State =====
let statsData = {
  daily: {},
  weekly: {},
  monthly: {},
  allTime: {
    totalZikir: 0,
    totalDays: 0,
    longestStreak: 0,
    currentStreak: 0,
    achievements: []
  }
};

// ===== Initialize Stats =====
function initStats() {
  loadStatsData();
  updateAllTimeStats();
}

// ===== Load Stats Data =====
function loadStatsData() {
  try {
    const saved = localStorage.getItem('tasbih_stats');
    if (saved) {
      statsData = JSON.parse(saved);
    }
    
    // Ensure structure exists
    if (!statsData.daily) statsData.daily = {};
    if (!statsData.weekly) statsData.weekly = {};
    if (!statsData.monthly) statsData.monthly = {};
    if (!statsData.allTime) {
      statsData.allTime = {
        totalZikir: 0,
        totalDays: 0,
        longestStreak: 0,
        currentStreak: 0,
        achievements: []
      };
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ===== Save Stats Data =====
function saveStatsData() {
  try {
    localStorage.setItem('tasbih_stats', JSON.stringify(statsData));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

// ===== Update Stats (called from tasbih.js) =====
function updateTasbihStats(currentCount, todayCount, totalCount) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const thisWeek = getWeekNumber(new Date());
  const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  // Update daily stats
  if (!statsData.daily[today]) {
    statsData.daily[today] = { count: 0, sessions: 1 };
  }
  statsData.daily[today].count = todayCount;
  
  // Update weekly stats
  if (!statsData.weekly[thisWeek]) {
    statsData.weekly[thisWeek] = { count: 0 };
  }
  statsData.weekly[thisWeek].count = calculateWeekTotal();
  
  // Update monthly stats
  if (!statsData.monthly[thisMonth]) {
    statsData.monthly[thisMonth] = { count: 0 };
  }
  statsData.monthly[thisMonth].count = calculateMonthTotal();
  
  // Update all-time stats
  statsData.allTime.totalZikir = totalCount;
  statsData.allTime.totalDays = Object.keys(statsData.daily).length;
  
  // Update streaks
  updateStreaks();
  
  // Check achievements
  checkAchievements(todayCount, totalCount);
  
  saveStatsData();
}

// ===== Calculate Week Total =====
function calculateWeekTotal() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (statsData.daily[dateStr]) {
      total += statsData.daily[dateStr].count;
    }
  }
  
  return total;
}

// ===== Calculate Month Total =====
function calculateMonthTotal() {
  const thisMonth = new Date().toISOString().substring(0, 7);
  
  let total = 0;
  Object.keys(statsData.daily).forEach(date => {
    if (date.startsWith(thisMonth)) {
      total += statsData.daily[date].count;
    }
  });
  
  return total;
}

// ===== Update Streaks =====
function updateStreaks() {
  const dates = Object.keys(statsData.daily).sort();
  if (dates.length === 0) return;
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check current streak
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (statsData.daily[dateStr] && statsData.daily[dateStr].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  dates.forEach((dateStr, index) => {
    if (statsData.daily[dateStr].count > 0) {
      tempStreak++;
      
      // Check if next day exists
      if (index < dates.length - 1) {
        const currentDate = new Date(dateStr);
        const nextDate = new Date(dates[index + 1]);
        const diffDays = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          // Streak broken
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }
  });
  
  statsData.allTime.currentStreak = currentStreak;
  statsData.allTime.longestStreak = Math.max(longestStreak, currentStreak);
}

// ===== Get Week Number =====
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

// ===== Update All Time Stats =====
function updateAllTimeStats() {
  if (typeof tasbihData !== 'undefined') {
    const total = tasbihData.getTotalCount();
    statsData.allTime.totalZikir = total;
    saveStatsData();
  }
}

// ===== Achievements System =====
const achievements = [
  { id: 'first_zikir', name: 'Langkah Pertama', desc: 'Zikir pertama kali', target: 1, icon: '🌱' },
  { id: 'day_33', name: 'Subhanallah', desc: '33 zikir dalam sehari', target: 33, icon: '📿' },
  { id: 'day_99', name: 'Asmaul Husna', desc: '99 zikir dalam sehari', target: 99, icon: '✨' },
  { id: 'day_1000', name: 'Konsisten', desc: '1000 zikir dalam sehari', target: 1000, icon: '🔥' },
  { id: 'total_1000', name: 'Seribu Kebaikan', desc: '1000 total zikir', target: 1000, icon: '⭐' },
  { id: 'total_10000', name: 'Sepuluh Ribu', desc: '10,000 total zikir', target: 10000, icon: '💎' },
  { id: 'total_100000', name: 'Seratus Ribu', desc: '100,000 total zikir', target: 100000, icon: '👑' },
  { id: 'streak_7', name: 'Seminggu Penuh', desc: '7 hari berturut-turut', target: 7, icon: '🔷' },
  { id: 'streak_30', name: 'Sebulan Penuh', desc: '30 hari berturut-turut', target: 30, icon: '🔶' },
  { id: 'streak_100', name: 'Seratus Hari', desc: '100 hari berturut-turut', target: 100, icon: '🏆' }
];

function checkAchievements(todayCount, totalCount) {
  const unlockedBefore = statsData.allTime.achievements.length;
  
  achievements.forEach(achievement => {
    // Skip if already unlocked
    if (statsData.allTime.achievements.includes(achievement.id)) return;
    
    let unlocked = false;
    
    // Check daily achievements
    if (achievement.id.startsWith('day_')) {
      if (todayCount >= achievement.target) unlocked = true;
    }
    
    // Check total achievements
    if (achievement.id.startsWith('total_')) {
      if (totalCount >= achievement.target) unlocked = true;
    }
    
    // Check streak achievements
    if (achievement.id.startsWith('streak_')) {
      if (statsData.allTime.currentStreak >= achievement.target) unlocked = true;
    }
    
    if (unlocked) {
      statsData.allTime.achievements.push(achievement.id);
      showAchievementNotification(achievement);
    }
  });
  
  if (statsData.allTime.achievements.length > unlockedBefore) {
    saveStatsData();
  }
}

// ===== Show Achievement Notification =====
function showAchievementNotification(achievement) {
  showToast(`🏆 Achievement Unlocked!\n${achievement.icon} ${achievement.name}\n${achievement.desc}`, 'success');
  
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

// ===== Display Stats =====
function displayStats() {
  if (!premium) {
    const content = document.getElementById('statsContent');
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🔒</div>
        <h3>Statistik Lengkap</h3>
        <p style="color: var(--text-secondary); margin: 16px 0;">
          Upgrade ke LUME+ Premium untuk melihat:
        </p>
        <ul class="donasi-list">
          <li>📊 Grafik harian, mingguan, bulanan</li>
          <li>🔥 Streak & konsistensi</li>
          <li>🏆 Achievement system</li>
          <li>📈 Analisis mendalam</li>
        </ul>
      </div>
    `;
    return;
  }
  
  const content = document.getElementById('statsContent');
  const today = todayCount || 0;
  const total = totalCount || 0;
  const streak = statsData.allTime.currentStreak;
  const longestStreak = statsData.allTime.longestStreak;
  
  let html = `
    <div class="stats-container">
      <!-- Summary Cards -->
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${today}</div>
          <div class="stat-label">Hari Ini</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💯</div>
          <div class="stat-value">${total.toLocaleString()}</div>
          <div class="stat-label">Total Zikir</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Streak Hari</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">${longestStreak}</div>
          <div class="stat-label">Longest Streak</div>
        </div>
      </div>
      
      <!-- Last 7 Days -->
      <div class="stats-section">
        <h3>📅 7 Hari Terakhir</h3>
        ${generateLast7DaysChart()}
      </div>
      
      <!-- Achievements -->
      <div class="stats-section">
        <h3>🏆 Achievements (${statsData.allTime.achievements.length}/${achievements.length})</h3>
        ${generateAchievementsList()}
      </div>
      
      <!-- Monthly Overview -->
      <div class="stats-section">
        <h3>📈 Ringkasan Bulan Ini</h3>
        ${generateMonthlyOverview()}
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

// ===== Generate Last 7 Days Chart =====
function generateLast7DaysChart() {
  const today = new Date();
  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    const count = statsData.daily[dateStr]?.count || 0;
    
    days.push({ date: dayName, count });
  }
  
  const maxCount = Math.max(...days.map(d => d.count), 1);
  
  let html = '<div class="bar-chart">';
  days.forEach(day => {
    const height = (day.count / maxCount) * 100;
    html += `
      <div class="bar-item">
        <div class="bar-value">${day.count}</div>
        <div class="bar-column">
          <div class="bar-fill" style="height: ${height}%"></div>
        </div>
        <div class="bar-label">${day.date}</div>
      </div>
    `;
  });
  html += '</div>';
  
  return html;
}

// ===== Generate Achievements List =====
function generateAchievementsList() {
  let html = '<div class="achievements-grid">';
  
  achievements.forEach(achievement => {
    const unlocked = statsData.allTime.achievements.includes(achievement.id);
    const className = unlocked ? 'achievement-item unlocked' : 'achievement-item locked';
    
    html += `
      <div class="${className}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.desc}</div>
        </div>
        ${unlocked ? '<div class="achievement-check">✓</div>' : '<div class="achievement-lock">🔒</div>'}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// ===== Generate Monthly Overview =====
function generateMonthlyOverview() {
  const thisMonth = new Date().toISOString().substring(0, 7);
  const monthTotal = statsData.monthly[thisMonth]?.count || 0;
  const daysInMonth = new Date().getDate();
  const avgPerDay = daysInMonth > 0 ? Math.round(monthTotal / daysInMonth) : 0;
  
  return `
    <div class="monthly-stats">
      <div class="monthly-item">
        <span>Total Bulan Ini</span>
        <strong>${monthTotal.toLocaleString()}</strong>
      </div>
      <div class="monthly-item">
        <span>Rata-rata Per Hari</span>
        <strong>${avgPerDay.toLocaleString()}</strong>
      </div>
      <div class="monthly-item">
        <span>Hari Aktif</span>
        <strong>${Object.keys(statsData.daily).filter(d => d.startsWith(thisMonth)).length} hari</strong>
      </div>
    </div>
  `;
}

// ===== Add CSS for stats display =====
const statsStyle = document.createElement('style');
statsStyle.textContent = `
  .stats-container {
    text-align: left;
  }
  
  .stats-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 20px 0;
  }
  
  .stat-card {
    background: var(--bg-card);
    padding: 16px;
    border-radius: var(--radius-md);
    text-align: center;
  }
  
  .stat-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--color-success);
    margin: 8px 0;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
  
  .stats-section {
    margin: 24px 0;
  }
  
  .stats-section h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: var(--text-primary);
  }
  
  .bar-chart {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    height: 200px;
    padding: 16px;
    background: var(--bg-card);
    border-radius: var(--radius-md);
  }
  
  .bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .bar-value {
    font-size: 12px;
    font-weight: bold;
    color: var(--text-secondary);
  }
  
  .bar-column {
    flex: 1;
    width: 100%;
    background: var(--bg-secondary);
    border-radius: 4px 4px 0 0;
    position: relative;
    display: flex;
    align-items: flex-end;
  }
  
  .bar-fill {
    width: 100%;
    background: linear-gradient(to top, var(--color-success), var(--color-warning));
    border-radius: 4px 4px 0 0;
    min-height: 4px;
  }
  
  .bar-label {
    font-size: 11px;
    color: var(--text-secondary);
  }
  
  .achievements-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .achievement-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border-left: 4px solid transparent;
  }
  
  .achievement-item.unlocked {
    border-left-color: var(--color-success);
  }
  
  .achievement-item.locked {
    opacity: 0.5;
    border-left-color: var(--text-secondary);
  }
  
  .achievement-icon {
    font-size: 32px;
  }
  
  .achievement-info {
    flex: 1;
  }
  
  .achievement-name {
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .achievement-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  .achievement-check {
    font-size: 24px;
    color: var(--color-success);
  }
  
  .achievement-lock {
    font-size: 20px;
    opacity: 0.5;
  }
  
  .monthly-stats {
    background: var(--bg-card);
    padding: 16px;
    border-radius: var(--radius-md);
  }
  
  .monthly-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--bg-secondary);
  }
  
  .monthly-item:last-child {
    border-bottom: none;
  }
  
  .monthly-item span {
    color: var(--text-secondary);
  }
  
  .monthly-item strong {
    color: var(--color-success);
  }
`;
document.head.appendChild(statsStyle);

// ===== Initialize =====
window.addEventListener('DOMContentLoaded', () => {
  initStats();
});

// ===== Export functions =====
window.statsModule = {
  getStats: () => statsData,
  displayStats: displayStats
};