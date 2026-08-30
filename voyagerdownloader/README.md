# Golden Record

A simple web-based audio experience for exploring, uploading, and playing audio files while synchronizing audio with visual content.

## ✨ Fitur

* 🎵 Mendukung file **MP3** dan **WAV**
* 📤 Membaca audio Voyager dari asset statis (tanpa upload)
* ▶️ Play / Stop / Mute
* 📊 Menampilkan progress audio
* 🖼️ Sinkronisasi audio dengan gambar
* 📡 Oscilloscope audio secara real-time
* 📖 Halaman explanation dengan materi PNG
* 💾 Audio tersimpan menggunakan **IndexedDB**
* 📱 Mendukung desktop dan mobile

## 🚀 Cara Menjalankan

Tidak memerlukan build system.

1. Download atau clone repository.
2. Jalankan menggunakan local server.
3. Buka `index.html` di browser.

Contoh:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
python -m http.server 8000
```

Kemudian buka:

```text
http://localhost:8000
```

## 📂 Struktur Utama

```text
index.html
upload.html
explanation.html
js/
css/
assets/
```

## 🎧 Upload Audio

Audio utama selalu dibaca langsung dari `src/assets/audio/voyager.mp3`. Fitur upload dinonaktifkan agar deployment statis di GitHub Pages dan Netlify tidak bergantung pada IndexedDB atau server upload.

## 📜 Lisensi

Silakan tambahkan lisensi proyek sesuai kebutuhan.

---

# 中文

## Golden Record

一个简单的网页音频项目，用于上传、播放音频，并让音频与视觉内容保持同步。

### ✨ 功能

* 🎵 支持 **MP3 / WAV**
* 📤 上传并在浏览器中保存音频
* ▶️ 播放 / 停止 / 静音
* 📊 显示音频进度
* 🖼️ 音频与图像同步
* 📡 实时音频示波器
* 📖 Explanation 页面与 PNG 内容
* 💾 使用 **IndexedDB** 本地保存音频
* 📱 支持桌面和移动设备

### 🚀 运行

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
python -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

### 🎧 上传音频

进入 **Upload**，选择 `.mp3` 或 `.wav` 文件即可。

音频保存在浏览器本地，无需上传到服务器。

---

# 한국어

## Golden Record

오디오를 업로드하고 재생하며, 오디오와 시각 콘텐츠를 동기화할 수 있는 간단한 웹 프로젝트입니다.

### ✨ 주요 기능

* 🎵 **MP3 / WAV** 지원
* 📤 오디오 업로드 및 브라우저 저장
* ▶️ 재생 / 정지 / 음소거
* 📊 오디오 진행률 표시
* 🖼️ 오디오와 이미지 동기화
* 📡 실시간 오실로스코프
* 📖 PNG 자료가 포함된 Explanation 페이지
* 💾 **IndexedDB**를 이용한 로컬 저장
* 📱 데스크톱 및 모바일 지원

### 🚀 실행 방법

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
python -m http.server 8000
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:8000
```

### 🎧 오디오 업로드

**Upload** 페이지에서 `.mp3` 또는 `.wav` 파일을 선택하면 됩니다.

오디오는 서버가 아닌 브라우저에 로컬로 저장됩니다.

---

# 日本語

## Golden Record

音声ファイルをアップロード・再生し、音声とビジュアルコンテンツを同期できるシンプルなWebプロジェクトです。

### ✨ 主な機能

* 🎵 **MP3 / WAV** 対応
* 📤 音声のアップロードとブラウザ保存
* ▶️ 再生 / 停止 / ミュート
* 📊 音声プログレス表示
* 🖼️ 音声と画像の同期
* 📡 リアルタイムオシロスコープ
* 📖 PNG資料を含むExplanationページ
* 💾 **IndexedDB** によるローカル保存
* 📱 PC・モバイル対応

### 🚀 起動方法

```bash
git clone https://github.com/USERNAME/REPOSITORY.git
cd REPOSITORY
python -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000
```

### 🎧 音声のアップロード

**Upload** ページから `.mp3` または `.wav` ファイルを選択してください。

音声はサーバーではなく、ブラウザにローカル保存されます。

---

## 🌍 Language

* 🇮🇩 Bahasa Indonesia
* 🇨🇳 中文
* 🇰🇷 한국어
* 🇯🇵 日本語
## Batch image export

The main page can compile all 116 logical Golden Record images from the decoded audio. RGB image triplets (`red → grn → blu`) are merged into one final image instead of three separate files. Raster columns are processed sequentially at a controlled pace to avoid overly fast rendering.

When compilation finishes, the browser automatically downloads one ZIP containing every compiled image in PNG, JPG, and WebP formats, with encoded-time information in each filename.
