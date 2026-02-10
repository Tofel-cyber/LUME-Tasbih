# 🕌 LUME Tasbih - Digital Tasbih App on Pi Network

Aplikasi Tasbih Digital dengan fitur premium yang terintegrasi dengan Pi Network blockchain. Sempurna untuk tracking ibadah harian dengan teknologi modern.

## ✨ Fitur Utama

### 🆓 Mode Gratis
- ✅ Counter tasbih digital
- ✅ Vibration feedback
- ✅ Sound effects
- ✅ Basic statistics (hari ini & total)
- ✅ Target zikir custom
- ✅ Progress bar visual
- ✅ Auto-save data
- ✅ Keyboard shortcuts

### ⭐ Mode LUME+ Premium (0.001 Pi)
- ✅ **Adzan Otomatis** - Notifikasi 5 waktu sholat
- ✅ **Statistik Lengkap** - Grafik harian, mingguan, bulanan
- ✅ **Achievement System** - Unlock 10+ achievements
- ✅ **Custom Themes** - 4 pilihan tema warna
- ✅ **Cloud Sync** - Sinkronisasi data (simulasi)
- ✅ **Donasi Sosial** - 1% zikir untuk amal
- ✅ **Streak Tracker** - Monitor konsistensi ibadah
- ✅ **Advanced Analytics** - Insight mendalam

## 🚀 Instalasi

### Prasyarat
- Akun Pi Network aktif
- Pi Browser atau Pi App
- Akses ke Pi Developer Portal

### Langkah-langkah

1. **Clone atau Download File**
   ```bash
   git clone https://github.com/yourusername/lume-tasbih.git
   cd lume-tasbih
   ```

2. **Upload ke Pi Developer Portal**
   - Login ke https://develop.pi
   - Buat aplikasi baru
   - Upload semua file:
     - `index.html`
     - `style.css`
     - `app.js`
     - `tasbih.js`
     - `adzan-auto.js`
     - `donasi.js`
     - `stats.js`

3. **Konfigurasi Pi SDK**
   - Pastikan Pi SDK sudah terintegrasi
   - Verifikasi payment callbacks
   - Test di Pi Sandbox

4. **Deploy**
   - Test di development mode
   - Submit untuk review
   - Deploy ke production

## 📁 Struktur File

```
lume-tasbih/
├── index.html          # Main HTML structure
├── style.css           # Complete styling with animations
├── app.js              # Core app logic & Pi payment
├── tasbih.js           # Counter logic & persistence
├── adzan-auto.js       # Prayer times & notifications
├── donasi.js           # Donation tracking
├── stats.js            # Statistics & achievements
└── README.md           # Documentation
```

## 🎮 Cara Penggunaan

### Mode Gratis
1. Klik **"Tasbih Gratis"**
2. Tap tombol **"➕ Zikir"** untuk menambah counter
3. Set target dengan tombol **"🎯 Target"**
4. Reset counter dengan tombol **"🔄 Reset"**

### Mode LUME+ Premium
1. **Login** dengan Pi Network
2. Klik **"LUME+ Premium"**
3. Konfirmasi pembayaran 0.001 Pi
4. Tunggu approval & completion
5. Akses semua fitur premium!

### Fitur Premium

#### 📱 Adzan Otomatis
1. Klik **"⏰ Adzan Otomatis"**
2. Izinkan notifikasi browser
3. Sistem akan otomatis notifikasi di 5 waktu sholat

#### 📊 Statistik
1. Klik **"📊 Lihat Statistik Lengkap"**
2. Lihat grafik 7 hari terakhir
3. Track streak & achievements
4. Monitor progress bulanan

#### 🎨 Themes
1. Klik **"🎨 Ganti Theme"**
2. Cycle through 4 themes:
   - Default (Blue-Green)
   - Purple Dream
   - Ocean Blue
   - Sunset

#### 🤍 Donasi Sosial
1. Klik **"🤍 Donasi Sosial"**
2. Aktifkan donasi auto
3. 1% dari setiap zikir = donasi
4. Track distribusi donasi

## ⌨️ Keyboard Shortcuts

- `Space` / `Enter` - Tap zikir
- `Ctrl + R` - Reset counter
- `Ctrl + T` - Set target

## 💾 Data Persistence

Semua data disimpan di localStorage:
- Counter saat ini
- Target custom
- Statistik harian/bulanan
- Achievements unlocked
- Premium status
- Donation tracking
- Theme preference

Data otomatis tersinkronisasi antar sesi.

## 🔐 Keamanan Payment

Aplikasi ini menggunakan Pi SDK payment flow yang aman:

1. **createPayment** - Inisiasi pembayaran
2. **onReadyForServerApproval** - Server verification
3. **approvePayment** - Approve transaksi
4. **onReadyForServerCompletion** - Complete payment
5. **completePayment** - Finalisasi

⚠️ **PENTING untuk Production:**
- Setup backend server untuk verifikasi
- Validate payment di blockchain
- Never trust client-side only

## 🎯 Achievements

| Icon | Name | Description |
|------|------|-------------|
| 🌱 | Langkah Pertama | Zikir pertama kali |
| 📿 | Subhanallah | 33 zikir dalam sehari |
| ✨ | Asmaul Husna | 99 zikir dalam sehari |
| 🔥 | Konsisten | 1000 zikir dalam sehari |
| ⭐ | Seribu Kebaikan | 1000 total zikir |
| 💎 | Sepuluh Ribu | 10,000 total zikir |
| 👑 | Seratus Ribu | 100,000 total zikir |
| 🔷 | Seminggu Penuh | 7 hari streak |
| 🔶 | Sebulan Penuh | 30 hari streak |
| 🏆 | Seratus Hari | 100 hari streak |

## 🛠️ Customization

### Mengubah Harga Premium
```javascript
// Di app.js, line ~145
amount: 0.001  // Ubah sesuai kebutuhan
```

### Mengubah Waktu Sholat
```javascript
// Di adzan-auto.js, line ~87-91
prayerTimes = {
  fajr: new Date(...),    // Sesuaikan waktu
  dhuhr: new Date(...),
  // dst...
}
```

### Menambah Achievement
```javascript
// Di stats.js, line ~110
achievements.push({
  id: 'your_achievement',
  name: 'Your Achievement',
  desc: 'Description',
  target: 1000,
  icon: '🎖️'
});
```

## 🐛 Troubleshooting

### Payment Tidak Jalan
- Pastikan sudah login Pi Network
- Cek koneksi internet
- Verifikasi Pi SDK loaded
- Lihat console untuk error

### Notifikasi Tidak Muncul
- Izinkan notifikasi di browser
- Cek permission di settings
- Restart aplikasi

### Data Hilang
- Cek localStorage browser
- Jangan clear browser data
- Pastikan auto-save aktif

### Adzan Tidak Tepat Waktu
- Gunakan library proper (adhan.js)
- Set lokasi geografis
- Adjust timezone

## 📱 Browser Support

- ✅ Chrome/Chromium
- ✅ Pi Browser
- ✅ Safari (limited)
- ✅ Firefox
- ⚠️ Edge (mostly works)

## 🔮 Roadmap

- [ ] Backend server integration
- [ ] Real prayer times API
- [ ] Actual adzan audio
- [ ] Multi-language support
- [ ] Social features (leaderboard)
- [ ] Export/import data
- [ ] Offline mode (PWA)
- [ ] Desktop app (Electron)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal/commercial projects

## 👨‍💻 Author

Created with ❤️ for the Muslim community

## 🙏 Doa

> "Sesungguhnya dalam mengingat Allah, hati menjadi tenteram." (QS. Ar-Ra'd: 28)

---

**Barakallahu fiikum!** 🕌✨

PT. LUMENSIA SMAT TECHNOLOGIE 2025
