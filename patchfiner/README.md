# Patchfinder

Patchfinder adalah visualizer algoritma **pathfinding** berbasis HTML/JavaScript untuk maze/grid. Aplikasi ini menampilkan proses pencarian rute secara visual, bukan hanya hasil akhirnya.

## 🚀 Live Demo

**[Buka Patchfinder Live Demo](https://bahrizalmulyawan.github.io/patchfiner/Index.html)**

Halaman demo utama menyediakan akses ke Patchfinder v1, Patchfinder v2, dan halaman explanation.

## ✨ Fitur Utama

- Visualisasi proses pencarian pathfinding.
- Pilihan algoritma:
  - Dijkstra
  - A*
  - Breadth-First Search (BFS)
  - Blind Search / DFS
  - Greedy Best-First Search
  - Bidirectional BFS
  - Bidirectional Dijkstra
  - Bidirectional A*
  - Uniform Cost Search (UCS)
  - IDA*
- Multi Start / Multi Goal pada Patchfinder v2.
- Path antar pasangan marker dapat dibuat tanpa berbagi cell path yang sudah reserved.
- Custom wall.
- Generate / randomize maze dan marker.
- Animasi proses pencarian.
- CLI/log perhitungan live.
- Light / Dark mode.
- Bahasa Indonesia / English.
- Responsive untuk desktop dan mobile.

## 📂 Struktur Proyek

```text
.
├── Index.html
├── Patchfinderv1/
│   ├── Patchfinderv1.html
│   └── explanation.html
├── Patchfinderv2/
│   ├── Index.html
│   ├── Patchfinderv2.html
│   └── explanation.html
├── README.md
└── Readme github.md
```

## 📖 Penjelasan

Untuk dokumentasi konsep dan cara kerja Patchfinder v2:

**[Buka Explanation](https://bahrizalmulyawan.github.io/patchfiner/Patchfinderv2/explanation.html)**

Halaman tersebut juga tersedia melalui tombol **Explanation** pada aplikasi Patchfinder v2.

## ▶️ Menjalankan Secara Lokal

Karena proyek ini menggunakan HTML/CSS/JavaScript tanpa build step khusus, file dapat dibuka langsung di browser modern.

Mulai dari:

```text
Index.html
```

Kemudian pilih versi Patchfinder yang ingin digunakan.

## 📝 Catatan

- URL GitHub Pages pada bagian Live Demo mengikuti path repository yang diberikan.
- Nama file dan path pada GitHub bersifat **case-sensitive**, sehingga `Index.html` dan `index.html` dianggap berbeda.
