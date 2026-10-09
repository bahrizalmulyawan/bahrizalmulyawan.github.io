# Perceptron OCR Lab

Aplikasi edukasi **Optical Character Recognition (OCR)** untuk bereksperimen dengan pengenalan angka 0–9 menggunakan model Perceptron dan mode CNN-Lite. Proyek dibuat dengan HTML, CSS, dan JavaScript sehingga dapat dijalankan langsung di browser tanpa instalasi server.

**Author:** Bahrizal Helmi Mulyawan

## Fitur

- **Canvas angka 16×16** untuk menggambar angka secara manual.
- **Klasifikasi angka 0–9** dengan tampilan hasil prediksi dan skor kelas.
- **Training manual** menggunakan gambar dan label yang dipilih pengguna.
- **Training dataset demo** menggunakan pola digit sintetis bawaan.
- **Mode Perceptron dan CNN-Lite** untuk eksplorasi pendekatan model yang berbeda.
- **Training Analytics** untuk memantau metrik training dan hasil evaluasi yang ditampilkan aplikasi.
- **Confusion matrix** untuk memeriksa prediksi pada pola demo.
- **Simpan model** ke LocalStorage browser.
- **Ekspor dan impor JSON** untuk mencadangkan atau memindahkan snapshot model.
- **Antarmuka dark theme** dan halaman About yang menjelaskan konsep dasar perceptron.

## Struktur proyek

```text
Perceptron_OCR_Project/
├── Perceptron.html  # Aplikasi utama OCR
├── About.html       # Penjelasan perceptron dan batasan aplikasi
└── README.md        # Dokumentasi proyek
```

## Cara menjalankan

1. Unduh atau clone repositori ini.
2. Buka `Perceptron.html` di browser modern seperti Chrome, Edge, atau Firefox.
3. Gambar sebuah angka pada grid 16×16.
4. Pilih label angka yang benar, lalu gunakan **Train Sample** untuk melatih dari contoh tersebut.
5. Gunakan **Train Dataset** untuk menjalankan training dengan pola demo bawaan.
6. Tekan **Recognize** untuk melihat prediksi model.
7. Tekan **Save Model** untuk menyimpan model di browser.
8. Gunakan **Export JSON** untuk mengunduh snapshot model atau **Import JSON** untuk memuat snapshot yang sudah diekspor.

Halaman `About.html` dapat dibuka langsung dari browser.

## Model awal (*demo-pretrained*)

Pada penggunaan pertama, jika belum ada model tersimpan, aplikasi menyiapkan model awal melalui training pola digit sintetis bawaan. Jika snapshot tersedia di LocalStorage, aplikasi akan mencoba memulihkannya.

> **Penting:** model awal bukan model OCR yang dilatih pada dataset tulisan tangan nyata. Pola sintetis hanya ditujukan untuk demonstrasi dan pembelajaran; hasilnya tidak menjamin pengenalan tulisan tangan bebas secara akurat.

## Training Analytics dan evaluasi

Analytics membantu melihat perilaku training pada dataset demo. Angka akurasi yang ditampilkan bergantung pada pola sintetis yang digunakan aplikasi, sehingga **jangan dianggap sebagai benchmark performa OCR dunia nyata**. Untuk evaluasi yang lebih bermakna, gunakan dataset tulisan tangan yang representatif dan pisahkan data training dari data pengujian.

## Penyimpanan model

- **Save Model / LocalStorage:** penyimpanan berada di browser dan origin yang sama. Menghapus data situs atau menggunakan browser/perangkat lain dapat membuat snapshot lokal tidak tersedia.
- **Export JSON:** simpan snapshot sebagai file cadangan.
- **Import JSON:** muat snapshot yang kompatibel dari file JSON.

Simpan file JSON di tempat yang aman jika ingin mempertahankan hasil training.

## Teknologi

- HTML5
- CSS
- JavaScript murni
- Browser LocalStorage dan JSON untuk persistensi model

Tidak memerlukan backend, package manager, atau koneksi internet untuk menjalankan aplikasi lokal.

## Batasan

- Dataset bawaan terdiri dari pola angka sintetis sederhana.
- Hasil pada pola demo tidak mewakili akurasi pada tulisan tangan nyata.
- Model ini ditujukan untuk pembelajaran dan eksperimen, bukan sebagai sistem OCR produksi.
- Performa dapat berbeda tergantung pola input dan training yang dilakukan pengguna.

## Lisensi

Belum ada lisensi open-source yang ditentukan. Tambahkan file `LICENSE` sebelum menyatakan proyek ini tersedia di bawah lisensi tertentu.
