# Braille Translator

Web app Braille Translator berbasis HTML, CSS, dan JavaScript murni.

## Fitur

- Teks → Braille
- Braille → Teks
- Keyboard Braille 6 titik
- Mode multitouch dan non-multitouch
- Getaran keyboard Braille di HP/tablet
  - Menggunakan Vibration API bawaan browser
  - Durasi 300 ms
  - Bisa ON/OFF
  - Hanya diaktifkan jika perangkat dan browser mendukung vibrasi
- Perkins Brailler untuk keyboard fisik komputer/laptop
- Referensi Unicode A–Z mode ABCDE dan QWERT
- Light, Dark, dan Low Vision
- Bahasa Indonesia, English, Hindi, dan Melayu
- Copy
- Text-to-Speech menggunakan Web Speech API bawaan browser
- Tidak membutuhkan library atau API eksternal

## Struktur

```text
braille-translator/
├── index.html
└── README.md
```

## Menjalankan dengan Python

Pastikan Python 3 sudah terpasang.

### Windows / macOS / Linux

Masuk ke folder project:

```bash
cd braille-translator
```

Jalankan server:

```bash
python -m http.server 8000
```

Jika perintah `python` tidak tersedia, coba:

```bash
python3 -m http.server 8000
```

Buka:

```text
http://localhost:8000
```

## Menjalankan di server

Upload `index.html` ke hosting web/static hosting, lalu buka URL-nya.

Contoh server Python:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Kemudian akses:

```text
http://IP-SERVER:8000
```

Untuk penggunaan produksi, lebih baik gunakan web server seperti Nginx atau Apache.

## Catatan fitur getar

Getaran menggunakan:

```javascript
navigator.vibrate(300)
```

Fitur hanya diaktifkan pada perangkat yang terdeteksi sebagai HP/tablet dan browser yang menyediakan Vibration API.

Dukungan vibrasi dapat berbeda menurut browser, OS, dan pengaturan perangkat. Jika API tidak tersedia, tombol akan menunjukkan bahwa getaran tidak tersedia.

## Catatan TTS

TTS menggunakan API bawaan browser:

```javascript
window.speechSynthesis
```

Tidak ada API key dan tidak ada server TTS eksternal.

Bahasa TTS:
- Indonesia: `id-ID`
- English: `en-US`
- Hindi: `hi-IN`
- Melayu: `ms-MY`

Ketersediaan suara dan kualitas pengucapan bergantung pada browser dan suara TTS yang tersedia di perangkat.

## Lisensi

Bebas digunakan dan dimodifikasi untuk kebutuhan pribadi, pendidikan, atau pengembangan. Tambahkan lisensi khusus jika project ini akan didistribusikan sebagai produk dengan ketentuan tertentu.
