# WhatsApp Bot Starter (Android + GitHub)

Starter bot WhatsApp berbasis Node.js dan Baileys. Bukan APK.

## Fitur saat ini
- `.menu` / `.help`
- `.ping`, `.runtime`, `.owner`
- `.dadu`, `.tebakangka`, `.say`
- Sambutan anggota baru di grup

## Penting
Baileys memakai koneksi WhatsApp Web tidak resmi, bukan WhatsApp Business Platform resmi. Penggunaan otomatis dapat berisiko pada akun. Jangan spam atau mengirim pesan massal. Gunakan akun yang memang kamu punya izin untuk tautkan.

## Menjalankan di hosting
Butuh layanan yang mengizinkan proses Node.js berjalan terus-menerus dan menyimpan folder `auth_info` secara persisten. Hosting serverless seperti Vercel Functions bukan tempat yang cocok untuk koneksi WhatsApp Web yang harus terus hidup.

### Environment Variables
- `BOT_NUMBER`: nomor akun bot dalam format internasional tanpa `+`, spasi, atau tanda hubung, misalnya `62812xxxxxxx`.
- `OWNER_NUMBER`: nomor owner dalam format angka, misalnya `62812xxxxxxx`.
- `BOT_NAME`: nama bot, opsional.

### Start command
```bash
npm install
npm start
```

### Tautkan WhatsApp dari HP
1. Jalankan bot pertama kali dengan `BOT_NUMBER` sudah diatur.
2. Buka log/console hosting dan cari `PAIRING CODE`.
3. Di WhatsApp pada akun bot: menu titik tiga > Perangkat tertaut > Tautkan perangkat.
4. Pilih opsi tautkan dengan nomor telepon jika tersedia, lalu masukkan kode.
5. Pastikan folder `auth_info` tersimpan permanen. Jangan pernah mengunggah folder ini ke GitHub.

## Upload ke GitHub dari HP
Buat repo baru, lalu upload file-file di dalam ZIP ini langsung ke root repo (bukan mengunggah ZIP sebagai satu file). Jangan upload `auth_info`, `.env`, atau token/kunci rahasia.

## Batasan
Ini starter awal. Fitur stiker, downloader, AI, moderasi admin grup, dan database belum dipasang; masing-masing perlu ditambahkan dan diuji terpisah.
