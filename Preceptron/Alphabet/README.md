# Perceptron OCR Huruf A–Z

Aplikasi OCR edukasi berbasis HTML, CSS, dan JavaScript untuk menggambar dan mengklasifikasikan **huruf kapital A sampai Z** menggunakan perceptron multiclass. Tidak membutuhkan instalasi paket atau server.

## Fitur

- Kanvas gambar 16 × 16 (256 input biner).
- Klasifikasi 26 kelas huruf A–Z.
- Model demo-pretrained: pada pemakaian pertama, model otomatis dilatih dari 26 pola huruf sintetis bawaan.
- Training manual dari gambar dan label yang dipilih pengguna.
- Training dataset dan Training Analytics (grafik akurasi serta confusion matrix).
- Skor kelas, top-3 softmax, visualisasi bobot, dan log perhitungan.
- Save/Load model di LocalStorage serta ekspor/impor snapshot JSON.
- Mode Perceptron dan CNN-Lite untuk pembelajaran.

## Menjalankan

1. Unduh atau clone repositori.
2. Buka `Perceptron.html` di browser modern.
3. Gambar huruf kapital pada grid lalu tekan **Recognize**.
4. Untuk menyesuaikan model, pilih label A–Z, gambar huruf, lalu tekan **Train Sample**. Tombol **Train Dataset** melatih pada pola sintetis bawaan.
5. Gunakan **Save Model** atau **Export JSON** untuk menyimpan hasil training.

## Struktur proyek

- `Perceptron.html` — aplikasi utama.
- `About.html` — penjelasan konsep, fitur, dan keterbatasan.
- `README.md` — dokumentasi GitHub.

## Tentang pretrained

Model awal dilatih otomatis di browser dengan pola bitmap sintetis 5 × 7 yang dipetakan ke grid 16 × 16. Ini adalah **demo-pretrained**, bukan bobot hasil pelatihan dataset besar seperti EMNIST. Training Analytics juga mengevaluasi pola sintetis demo, sehingga angkanya bukan jaminan akurasi tulisan tangan nyata.

## Catatan teknis

- Perceptron: 256 input dan 26 output linear.
- CNN-Lite: empat filter konvolusi tetap, ReLU, max-pooling, dan dense head yang dilatih di browser; bukan CNN end-to-end yang pretrained.
- Penyimpanan LocalStorage berlaku pada browser/origin yang sama. Ekspor JSON disarankan untuk backup.
- Model angka dan model huruf memakai format/penyimpanan terpisah agar bobot 10 kelas dan 26 kelas tidak tercampur.

## Author

**Bahrizal Helmi Mulyawan**
