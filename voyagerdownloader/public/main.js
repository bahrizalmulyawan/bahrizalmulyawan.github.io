"use strict";
let debug = 1;
let CANVAS_HEIGHT;
let CANVAS_WIDTH;
const SAMPLE_RATE = 44100;
const audioContext = new AudioContext({
    sampleRate: SAMPLE_RATE,
});
let dom = {
    imgSelector: null,
    imgNext: null,
    imgBack: null,
    pauseBtn: null,
    playBtn: null,
    loader: null,
    compileAll: null,
    downloadZip: null,
    compileStatus: null,
    compileDetail: null,
    compileProgress: null,
};
function init() {
    dom = {
        imgSelector: document.querySelector("#imgSelector"),
        pauseBtn: document.querySelector("#pause"),
        playBtn: document.querySelector("#play"),
        imgNext: document.querySelector("#imgNext"),
        imgBack: document.querySelector("#imgBack"),
        loader: document.querySelector(".loader"),
        compileAll: document.querySelector("#compileAll"),
        downloadZip: document.querySelector("#downloadZip"),
        compileStatus: document.querySelector("#compileStatus"),
        compileDetail: document.querySelector("#compileDetail"),
        compileProgress: document.querySelector("#imageCompileProgress"),
    };
    dom.imgSelector.value = '1';
    IMG_DATA.right.oscilliscopeCanvas = document.querySelector("#rightWaveformCanvas");
    IMG_DATA.right.imageCanvas = document.querySelector("#rightChannelImage");
    IMG_DATA.left.oscilliscopeCanvas = document.querySelector("#leftWaveformCanvas");
    IMG_DATA.left.imageCanvas = document.querySelector("#leftChannelImage");
    IMG_DATA.right.creditsContainer = document.querySelector("#rightCredits");
    IMG_DATA.right.creditsTitle = document.querySelector("#rightCreditsTitle");
    IMG_DATA.right.creditsPerson = document.querySelector("#rightCreditsPerson");
    IMG_DATA.left.creditsContainer = document.querySelector("#leftCredits");
    IMG_DATA.left.creditsTitle = document.querySelector("#leftCreditsTitle");
    IMG_DATA.left.creditsPerson = document.querySelector("#leftCreditsPerson");
    CANVAS_WIDTH = IMG_DATA.right.imageCanvas.width;
    CANVAS_HEIGHT = IMG_DATA.right.imageCanvas.height;
    getAudio();
    setupImageCompiler();
    return;
}
document.addEventListener('DOMContentLoaded', init);
function toggleBtn() {
    var _a, _b;
    (_a = dom.pauseBtn) === null || _a === void 0 ? void 0 : _a.classList.toggle('hide');
    (_b = dom.playBtn) === null || _b === void 0 ? void 0 : _b.classList.toggle('hide');
    IMG_DATA.pause = !IMG_DATA.pause;
}
function assignListeners() {
    var _a, _b, _c, _d, _e;
    (_a = dom.imgSelector) === null || _a === void 0 ? void 0 : _a.addEventListener('input', () => {
        updateImageOffset("slider", Number(dom.imgSelector.value));
    });
    (_b = dom.imgBack) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
        updateImageOffset("inc", -2);
    });
    (_c = dom.imgNext) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
        //No idea why increment must be 0 
        updateImageOffset("inc", 0);
    });
    (_d = dom.pauseBtn) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
        toggleBtn();
    });
    (_e = dom.playBtn) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
        toggleBtn();
    });
    return;
}
/**
 * Static deployment mode: audio is always read from the bundled asset.
 * No upload / IndexedDB source is used.
 */
function setupVisiblePlayer() {
    const audio = document.querySelector('#audioPlayer');
    const progress = document.querySelector('#audioProgress');
    const current = document.querySelector('#audioCurrent');
    const duration = document.querySelector('#audioDuration');
    const label = document.querySelector('#audioSourceLabel');
    const status = document.querySelector('#audioStatus');
    if (!audio) return;

    const formatTime = seconds => {
        if (!Number.isFinite(seconds)) return '00:00';
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    audio.src = './src/assets/audio/voyager.mp3';
    audio.preload = 'metadata';
    audio.volume = 1;
    label.textContent = '[ BUNDLED VOYAGER.MP3 ]';

    audio.addEventListener('loadedmetadata', () => {
        duration.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
        current.textContent = formatTime(audio.currentTime);
        if (progress && audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
    });
    audio.addEventListener('play', () => { status.textContent = '[ PLAYING — IMAGE/AUDIO SYNC ]'; });
    audio.addEventListener('pause', () => { status.textContent = '[ PAUSED — IMAGE/AUDIO SYNC ]'; });
    audio.addEventListener('ended', () => { status.textContent = '[ END ]'; });
    audio.addEventListener('error', () => { status.textContent = '[ ERROR ] voyager.mp3 COULD NOT BE LOADED FROM ASSET'; });
    window.__goldenRecordAudio = audio;
}

/**
 * Fetches audio through web audio api and decodes the audio into a Float32 Array
 */
function getAudio() {
    const VOYAGER_AUDIO_URL = './src/assets/audio/voyager.mp3';
    setupVisiblePlayer();
    fetch(VOYAGER_AUDIO_URL, { cache: 'no-store' }).then(response => {
        if (!response.ok) throw new Error(`Voyager MP3 could not be loaded (HTTP ${response.status}).`);
        return response.arrayBuffer();
    }).then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(decodedAudio => {
        const leftChannelData = decodedAudio.getChannelData(0);
        const rightChannelData = decodedAudio.numberOfChannels > 1 ? decodedAudio.getChannelData(1) : leftChannelData;
        IMG_DATA.left.amplitudeData = Array.from(leftChannelData, sample => sample);
        IMG_DATA.right.amplitudeData = Array.from(rightChannelData, sample => sample);
        dom.loader.classList.add('no-opacity');
        if (dom.compileAll) dom.compileAll.disabled = false;
        if (dom.compileStatus) dom.compileStatus.textContent = '[ AUDIO READY / 116 LOGICAL IMAGES ]';
        setTimeout(() => {
            dom.loader.style.display = 'none';
            channelHandler(IMG_DATA.left, false);
            channelHandler(IMG_DATA.right, true);
            assignListeners();
        }, 150);
      })
      .catch(error => {
        dom.loader.querySelector('.loader-sub').textContent='[ ERROR ] Could not decode bundled voyager.mp3 from src/assets/audio/.';
        console.error('Error fetching or decoding audio: ', error);
      });
}

/**
 * Loops displayChannelData to new image offsets.
 * Pretty poor design but ¯\_(ツ)_/¯
 */
function channelHandler(channel, updater) {
    setInterval(() => {
        if (IMG_DATA.right.go) {
            displayChannelData(channel, IMG_DATA.offset, updater);
        }
    }, 10);
}

const RASTER_RENDER_DELAY_MS = 3;
let lastZipBlob = null;

function getLogicalImageGroups(channel) {
    const groups = [];
    let i = 0;
    while (i < channel.colors.length) {
        if (channel.colors[i] === "red" && channel.colors[i + 1] === "grn" && channel.colors[i + 2] === "blu") {
            groups.push({ startIndex: i, passCount: 3, kind: "rgb" });
            i += 3;
        } else {
            groups.push({ startIndex: i, passCount: 1, kind: "bnw" });
            i += 1;
        }
    }
    return groups;
}

function clampIntensity(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(255, Math.floor(value)));
}

function findNextPeakPosition(channel, position) {
    const localMin = position + 730;
    const localMax = position + 740;
    if (localMax > channel.amplitudeData.length) return position;

    let newMax = 0;
    let newPosition = position;
    for (let i = localMin; i < localMax; i++) {
        if (channel.amplitudeData[i] > newMax) {
            newMax = channel.amplitudeData[i];
            newPosition = i;
        }
    }
    return newPosition;
}

function yieldRasterStep() {
    return new Promise(resolve => setTimeout(resolve, RASTER_RENDER_DELAY_MS));
}

function drawRasterColumnToImageData(channel, position, colIndex, rgb, pixels) {
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
        const sample = channel.amplitudeData[position + row] ?? 0;
        const intensity = clampIntensity(108 - sample * 2555);
        const base = (row * CANVAS_WIDTH + colIndex) * 4;

        if (rgb === "bnw") {
            pixels[base] = intensity;
            pixels[base + 1] = intensity;
            pixels[base + 2] = intensity;
        } else if (rgb === "red") {
            pixels[base] = intensity;
        } else if (rgb === "grn") {
            pixels[base + 1] = intensity;
        } else if (rgb === "blu") {
            pixels[base + 2] = intensity;
        }
        pixels[base + 3] = 255;
    }
}

async function renderLogicalImage(channel, group, progressCallback) {
    const image = new ImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const totalColumns = CANVAS_WIDTH * group.passCount;
    let columnsDone = 0;

    for (let pass = 0; pass < group.passCount; pass++) {
        const frameIndex = group.startIndex + pass;
        const rgb = channel.colors[frameIndex];
        let pointer = channel.timeStamps[frameIndex] ?? 0;
        let oldPosition = pointer;

        for (let col = 0; col < CANVAS_WIDTH; col++) {
            drawRasterColumnToImageData(channel, pointer, col, rgb, image.data);
            columnsDone++;
            progressCallback(columnsDone, totalColumns);

            if (col % 2 === 0 && col !== 0) {
                pointer = findNextPeakPosition(channel, oldPosition);
            } else {
                oldPosition = pointer;
                pointer += CANVAS_HEIGHT;
            }
            await yieldRasterStep();
        }
    }

    return image;
}

function imageDataToCanvas(image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.putImageData(image, 0, 0);
    return canvas;
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error(`Could not encode ${type}.`)), type, quality);
    });
}

function formatEncodedTime(samples) {
    const totalSeconds = Math.max(0, Math.floor(samples / SAMPLE_RATE));
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}m${seconds}s`;
}

function crc32(data) {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let bit = 0; bit < 8; bit++) {
            crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function le16(value) {
    return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function le32(value) {
    return new Uint8Array([
        value & 255,
        (value >>> 8) & 255,
        (value >>> 16) & 255,
        (value >>> 24) & 255,
    ]);
}

function zipPartsConcat(parts) {
    return new Blob(parts, { type: "application/zip" });
}

function createZipBlob(entries) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    for (const entry of entries) {
        const nameBytes = new TextEncoder().encode(entry.name);
        const size = entry.data.byteLength;
        const crc = crc32(entry.data);
        const localHeader = new Uint8Array(30 + nameBytes.length);
        let p = 0;
        localHeader.set(new Uint8Array([0x50,0x4b,0x03,0x04]), p); p += 4;
        localHeader.set(le16(20), p); p += 2;
        localHeader.set(le16(0), p); p += 2;
        localHeader.set(le16(0), p); p += 2;
        localHeader.set(le16(dosTime), p); p += 2;
        localHeader.set(le16(dosDate), p); p += 2;
        localHeader.set(le32(crc), p); p += 4;
        localHeader.set(le32(size), p); p += 4;
        localHeader.set(le32(size), p); p += 4;
        localHeader.set(le16(nameBytes.length), p); p += 2;
        localHeader.set(le16(0), p); p += 2;
        localHeader.set(nameBytes, p);
        localParts.push(localHeader, entry.data);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        p = 0;
        centralHeader.set(new Uint8Array([0x50,0x4b,0x01,0x02]), p); p += 4;
        centralHeader.set(le16(20), p); p += 2;
        centralHeader.set(le16(20), p); p += 2;
        centralHeader.set(le16(0), p); p += 2;
        centralHeader.set(le16(0), p); p += 2;
        centralHeader.set(le16(dosTime), p); p += 2;
        centralHeader.set(le16(dosDate), p); p += 2;
        centralHeader.set(le32(crc), p); p += 4;
        centralHeader.set(le32(size), p); p += 4;
        centralHeader.set(le32(size), p); p += 4;
        centralHeader.set(le16(nameBytes.length), p); p += 2;
        centralHeader.set(le16(0), p); p += 2;
        centralHeader.set(le16(0), p); p += 2;
        centralHeader.set(le16(0), p); p += 2;
        centralHeader.set(le16(0), p); p += 2;
        centralHeader.set(le32(0), p); p += 4;
        centralHeader.set(le32(offset), p); p += 4;
        centralHeader.set(nameBytes, p);
        centralParts.push(centralHeader);

        offset += localHeader.length + size;
    }

    const centralOffset = offset;
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    let p = 0;
    end.set(new Uint8Array([0x50,0x4b,0x05,0x06]), p); p += 4;
    end.set(le16(0), p); p += 2;
    end.set(le16(0), p); p += 2;
    end.set(le16(entries.length), p); p += 2;
    end.set(le16(entries.length), p); p += 2;
    end.set(le32(centralSize), p); p += 4;
    end.set(le32(centralOffset), p); p += 4;
    end.set(le16(0), p);

    return zipPartsConcat([...localParts, ...centralParts, end]);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function getTotalLogicalImages() {
    return getLogicalImageGroups(IMG_DATA.left).length + getLogicalImageGroups(IMG_DATA.right).length;
}

async function compileAllImages() {
    if (!IMG_DATA.left.amplitudeData.length || !IMG_DATA.right.amplitudeData.length) {
        throw new Error("Audio has not finished decoding.");
    }

    const channels = [
        [IMG_DATA.left, "left"],
        [IMG_DATA.right, "right"],
    ];
    const totalImages = getTotalLogicalImages();
    const entries = [];
    let globalImageNumber = 0;

    if (dom.compileAll) dom.compileAll.disabled = true;
    if (dom.downloadZip) dom.downloadZip.disabled = true;
    if (dom.compileStatus) dom.compileStatus.innerText = `[ COMPILING 0/${totalImages} ]`;

    try {
        for (const [channel, channelName] of channels) {
            const groups = getLogicalImageGroups(channel);
            for (let groupNumber = 0; groupNumber < groups.length; groupNumber++) {
                const group = groups[groupNumber];
                globalImageNumber++;
                const encodedStart = channel.timeStamps[group.startIndex] ?? 0;

                const image = await renderLogicalImage(channel, group, (done, total) => {
                    const imagePercent = ((globalImageNumber - 1) + done / total) / totalImages * 100;
                    if (dom.compileProgress) dom.compileProgress.value = imagePercent;
                    if (dom.compileStatus) dom.compileStatus.innerText = `[ COMPILING ${globalImageNumber}/${totalImages} · ${Math.round(done / total * 100)}% ]`;
                    if (dom.compileDetail) dom.compileDetail.innerText = `[ ${channelName.toUpperCase()} · ${group.kind.toUpperCase()} · RASTER ${done}/${total} ]`;
                });

                const exportCanvas = imageDataToCanvas(image);
                const timeLabel = formatEncodedTime(encodedStart);
                const baseName = `${String(globalImageNumber).padStart(3, "0")}-${channelName}-${String(groupNumber + 1).padStart(2, "0")}-${group.kind}-${timeLabel}`;

                const png = await canvasToBlob(exportCanvas, "image/png");
                const jpg = await canvasToBlob(exportCanvas, "image/jpeg", 0.95);
                const webp = await canvasToBlob(exportCanvas, "image/webp", 0.95);
                entries.push(
                    { name: `${channelName}/${baseName}.png`, data: new Uint8Array(await png.arrayBuffer()) },
                    { name: `${channelName}/${baseName}.jpg`, data: new Uint8Array(await jpg.arrayBuffer()) },
                    { name: `${channelName}/${baseName}.webp`, data: new Uint8Array(await webp.arrayBuffer()) },
                );

                if (dom.compileProgress) dom.compileProgress.value = globalImageNumber / totalImages * 100;
            }
        }

        lastZipBlob = createZipBlob(entries);
        const stamp = new Date();
        const nameStamp = `${stamp.getHours().toString().padStart(2, "0")}-${stamp.getMinutes().toString().padStart(2, "0")}-${stamp.getSeconds().toString().padStart(2, "0")}`;
        downloadBlob(lastZipBlob, `voyager-golden-record-${nameStamp}.zip`);
        if (dom.downloadZip) dom.downloadZip.disabled = false;
        if (dom.compileStatus) dom.compileStatus.innerText = `[ COMPLETE · ${totalImages} IMAGES · AUTO DOWNLOAD STARTED ]`;
        if (dom.compileDetail) dom.compileDetail.innerText = `[ PNG + JPG + WEBP · RGB TRIPLETS MERGED · ZIP READY ]`;
        if (dom.compileProgress) dom.compileProgress.value = 100;
    } finally {
        if (dom.compileAll) dom.compileAll.disabled = false;
    }
}

function setupImageCompiler() {
    dom.compileAll?.addEventListener("click", async () => {
        try {
            await compileAllImages();
        } catch (error) {
            console.error("Image compiler failed:", error);
            if (dom.compileStatus) dom.compileStatus.innerText = "[ ERROR · IMAGE COMPILER FAILED ]";
            if (dom.compileDetail) dom.compileDetail.innerText = "[ CHECK AUDIO DECODER / BROWSER MEMORY ]";
            if (dom.compileAll) dom.compileAll.disabled = false;
        }
    });

    dom.downloadZip?.addEventListener("click", () => {
        if (!lastZipBlob) return;
        const stamp = new Date();
        const nameStamp = `${stamp.getHours().toString().padStart(2, "0")}-${stamp.getMinutes().toString().padStart(2, "0")}-${stamp.getSeconds().toString().padStart(2, "0")}`;
        downloadBlob(lastZipBlob, `voyager-golden-record-${nameStamp}.zip`);
    });
}

function displayChannelData(channel, index, updater) {
    channel.go = false;
    channel.pointer = channel.timeStamps[index];
    let oldPosition;
    let i = 0;
    const rgb = channel.colors[IMG_DATA.offset];
    const interval = setInterval(() => {
        if (IMG_DATA.pause) {
            return;
        }
        if (IMG_DATA.changeIndex || i === CANVAS_WIDTH) {
            clearInterval(interval);
            let time = IMG_DATA.changeIndex ? 30 : 1000;
            setTimeout(() => {
                channel.go = true;
                IMG_DATA.changeIndex = false;
            }, time);
            return;
        }
        if (i === 1) {
            updateCredits(channel, index);
            //prevents updateImageOffset() from getting called twice
            if (updater)
                updateImageOffset("auto", 0);
        }
        drawSingleLine(channel, channel.pointer, i, rgb);
        updateOscilliscope(channel, 500);
        if (i % 2 === 0 && i != 0) {
            findNextPeak(channel, oldPosition);
        }
        else {
            oldPosition = channel.pointer;
            channel.pointer += CANVAS_HEIGHT;
        }
        i++;
    }, 1);
}
/**
 * Increments offset by 1 with each call, unless explicite number is provided
 */
function updateImageOffset(caller, num) {
    if (caller === "slider") {
        IMG_DATA.changeIndex = true;
        IMG_DATA.offset = num;
        return;
    }
    else if (caller === "inc") {
        IMG_DATA.changeIndex = true;
        IMG_DATA.offset += num;
        return;
    }
    if (IMG_DATA.offset < 77) {
        IMG_DATA.offset++;
    }
    else {
        IMG_DATA.offset = 0;
    }
    dom.imgSelector.value = `${IMG_DATA.offset}`;
    return;
}
/**
 * Converts audio amplitude float into pixels for single line in canvas
 * Each line represents 8ms of audio data.
 */
function drawSingleLine(channel, position, colIndex, rgb) {
    let canvas = channel.imageCanvas;
    let context = canvas.getContext('2d', { willReadFrequently: true });
    let previousImageData = context.getImageData(colIndex, 0, 1, CANVAS_HEIGHT);
    let linePixelRow = previousImageData.data;
    for (let i = 0; i < CANVAS_HEIGHT; i++) {
        let intensity = Math.floor(108 - channel.amplitudeData[position + i] * 2555);
        if (rgb === "bnw") {
            linePixelRow[0 + i * 4] = intensity; //red
            linePixelRow[1 + i * 4] = intensity; //green
            linePixelRow[2 + i * 4] = intensity; //blue
        }
        else if (rgb === "red") {
            linePixelRow[0 + i * 4] = intensity; //red
            linePixelRow[1 + i * 4] = 0; //green
            linePixelRow[2 + i * 4] = 0; //blue
        }
        else if (rgb === "grn") {
            linePixelRow[1 + i * 4] = intensity; //green
        }
        else {
            linePixelRow[2 + i * 4] = intensity; //blue
        }
        linePixelRow[3 + i * 4] = 255;
    }
    context.putImageData(previousImageData, colIndex, 0);
    return;
}
/**
 * Visualizes sound waves through oscilliscope. Each call updates the oscilliscope
 * for `linelength` amount of samples.
 */
function updateOscilliscope(channel, linelength) {
    const context = channel.oscilliscopeCanvas.getContext("2d");
    const zoom = 200;
    const height = channel.oscilliscopeCanvas.height;
    const width = channel.oscilliscopeCanvas.width;
    const center = height / 2;
    let x = 0;
    const dx = width / linelength;
    const plotStart = -50;
    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.moveTo(x, center);
    context.strokeStyle = '#39ff14';
    context.shadowColor = '#39ff14';
    context.shadowBlur = 6;
    for (let i = 0; i < linelength; i++) {
        x += dx;
        context.lineTo(x, center - channel.amplitudeData[i + channel.pointer + plotStart] * zoom);
    }
    context.stroke();
    return;
}
/**
 * Finds the next amplitude peak in the audio file, which represents a new
 * image column
 */
function findNextPeak(channel, position) {
    const LOCAL_MIN = position + 730;
    const LOCAL_MAX = position + 740;
    if (LOCAL_MAX > channel.amplitudeData.length)
        return;
    let newMax = 0;
    let newPosition = position;
    for (let i = LOCAL_MIN; i < LOCAL_MAX; i++) {
        if (channel.amplitudeData[i] > newMax) {
            newMax = channel.amplitudeData[i];
            newPosition = i;
        }
    }
    channel.pointer = newPosition;
    return;
}
/**
 * Updates the credits text, called when image changes.
 */
function updateCredits(channel, position) {
    var _a, _b;
    if (channel.credits[position].split(",")[0] != ((_a = channel.creditsTitle) === null || _a === void 0 ? void 0 : _a.innerText)) {
        let str = channel.credits[position];
        let title = channel.credits[position].split(",")[0];
        let person = channel.credits[position].split(",")[1];
        (_b = channel.creditsContainer) === null || _b === void 0 ? void 0 : _b.classList.add('changed');
        setTimeout(() => {
            var _a;
            channel.creditsTitle.innerText = title;
            channel.creditsPerson.innerText = person;
            (_a = channel.creditsContainer) === null || _a === void 0 ? void 0 : _a.classList.remove('changed');
        }, 300);
    }
    return;
}
let IMG_DATA = {
    pause: false,
    offset: 0,
    changeIndex: false,
    left: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        creditsContainer: null,
        creditsTitle: null,
        creditsPerson: null,
        amplitudeData: [],
        pointer: 0,
        // "Welcome to the digital stone age" - Ron Barry
        timeStamps: [
            691479, 956699, 1226764, 1488444, 1746346, 2003886, 2253818,
            2495501, 2738833, 2981916, 3295249, 3549540, 3812059, 4072272,
            4322136, 4575677, 4822611, 5060736, 5312170, 5569428, 5809626,
            6060410, 6312643, 6581734, 6837650, 7088915, 7340062, 7597294,
            7843816, 8098952, 8356665, 8598180, 8873049, 9132202, 9386246,
            9642641, 9897876, 10149529, 10422986, 10672601, 10931249, 11187243,
            11444253, 11702810, 11961521, 12220751, 12480495, 12724703, 12977799,
            13234000, 13492635, 13752796, 13998981, 14249093, 14495646, 14746329,
            14999878, 15249029, 15499590, 15755055, 15996882, 16247674, 16493176,
            16748591, 17006625, 17265784, 17511919, 17772949, 18015077, 18278128,
            18541817, 18838219, 19081581, 19338182, 19582170, 19829758, 20078770,
            20354900 //77
        ],
        colors: [
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "red", "grn", "blu", "red", "grn", "blu", "bnw",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn",
            "blu", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",
            "bnw", "red", "grn", "blu", "red", "grn", "blu", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn",
            "blu", "red", "grn", "blu", "bnw", "red", "grn", "blu", "red", "grn",
            "blu", "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", //70
        ],
        credits: [
            "Calibration Circle, Jon Lomberg",
            "Location of Our Solar System, Frank Drake",
            "Mathematical Definitions, Frank Drake",
            "Physical Unit Definitions, Frank Drake",
            "The Solar System, Frank Drake",
            "The Solar System, Frank Drake",
            "The Sun, HALE Observatories",
            "Solar Spectrum, Cornell NAIC",
            "Solar Spectrum, Cornell NAIC",
            "Solar Spectrum, Cornell NAIC",
            "Mercury, NASA",
            "Mars, NASA",
            "Jupiter, NASA",
            "Home, NASA",
            "Home, NASA",
            "Home, NASA",
            "Clours over Egypt, NASA",
            "Clours over Egypt, NASA",
            "Clours over Egypt, NASA",
            "DNA Bases, Frank Drake",
            "DNA Structure, Jon Lomberg",
            "DNA Structure, Jon Lomberg",
            "Cell Division, Turtox/Cambosco",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Anatomy, World Book Encyclopedia",
            "Human Sex Organs, Sinauer Associates Inc.",
            "Human Conception, Jon Lomberg",
            "Human Conception, Lennart Nilsson",
            "Fertilized Ovum, Lennart Nilsson",
            "Human Fetus, Jon Lomberg",
            "Human Fetus, Dr. Frank Allan",
            "Male and Female, Jon Lomberg",
            "Birth, Wayne Miller",
            "Nursing Mother, UN",
            "Nursing Mother, UN",
            "Nursing Mother, UN",
            "Father and Child, Davic Harvey",
            "Father and Child, Davic Harvey",
            "Father and Child, Davic Harvey",
            "Group of Children, Ruby Mera/UNICEF",
            "Group of Children, Ruby Mera/UNICEF",
            "Group of Children, Ruby Mera/UNICEF",
            "Family Portrait, Jon Lomberg",
            "Family Portrait, Nina Leen/Time inc.",
            "Continental Drift, Jon Lomberg",
            "Stucture of the Earth, Jon Lomberg",
            "Heron Island Australia, Jay M. Pasachoff",
            "Seashort Maine, Dick Smith",
            "Snake River and the Grand Tetons, Ansel Adams",
            "Sand Dunes, George F. Mobley",
            "Monument Valley, Ray Manley",
            "Monument Valley, Ray Manley",
            "Monument Valley, Ray Manley",
            "Forest scene with mushrooms, Bruce Dale",
            "Forest scene with mushrooms, Bruce Dale",
            "Forest scene with mushrooms, Bruce Dale",
            "Leaf, Arthur Herrick",
            "Fallen leaves, Jodi Cobb",
            "Fallen leaves, Jodi Cobb",
            "Fallen leaves, Jodi Cobb",
            "Snowflake over Sequoia, Josef Muench, R. Sisson",
            "Snowflake over Sequoia, Josef Muench, R. Sisson",
            "Snowflake over Sequoia, Josef Muench, R. Sisson",
            "Tree with daffodils, Gardens Winterthur",
            "Tree with daffodils, Gardens Winterthur",
            "Tree with daffodils, Gardens Winterthur",
            "Flying insect with flowers, Stephen Dalton",
            "Evolution of Vertibrates, Jon Lomberg",
            "Seashell, Herman Landshoff",
            "Dolphines, Thomas Nerbia",
        ],
        space: 948540,
    },
    right: {
        go: true,
        imageCanvas: null,
        oscilliscopeCanvas: null,
        creditsContainer: null,
        creditsTitle: null,
        creditsPerson: null,
        amplitudeData: [],
        pointer: 0,
        timeStamps: [
            748881, 995880, 1256346, 1519980, 1776918, 2029338, 2275851,
            2522144, 2774972, 3023788, 3288648, 3537656, 3790711, 4046923,
            4299934, 4548285, 4804358, 5055090, 5310427, 5566445, 5819090,
            6069487, 6325550, 6582765, 6836043, 7093042, 7351177, 7600559,
            7849962, 8115741, 8366424, 8624873, 8877756, 9129103, 9377380,
            9625985, 9876773, 10129022, 10380286, 10639088, 10889655, 11140077,
            11396186, 11641174, 11900453, 12143850, 12398103, 12654434, 12911229,
            13170090, 13427893, 13692082, 13946719, 14205961, 14468525, 14719864,
            14959214, 15213806, 15469032, 15723726, 15973659, 16223783, 16476165,
            16738170, 16996230, 17249097, 17504002, 17764240, 18023237, 18294660,
            18550444, 18831088, 19079192, 19331292, 19592658, 19839241, 20089443,
            20338733 //77
        ],
        colors: [
            "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw",
            "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "red", "grn", "blu",
            "bnw", "bnw", "red", "grn", "blu", "bnw", "bnw", "bnw", "bnw", "bnw",
            "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "bnw", "red",
            "grn", "blu", "bnw", "red", "grn", "blu", "bnw", "bnw", //70
        ],
        credits: [
            "School of Fish, David Doubilet",
            "School of Fish, David Doubilet",
            "School of Fish, David Doubilet",
            "Tree Toad in Hand, David Wikstrom",
            "Crocodile, Peter Beard",
            "Eagle, Juan Antonio Fernandez",
            "Waterhole, South Africa Tourist Group.",
            "Chimp and Scientists, Wanna Goodall",
            "Chimp and Scientists, Wanna Goodall",
            "Chimp and Scientists, Wanna Goodall",
            "Bushmen Hunters, Jon Lomberg",
            "Bushmen Hunters, R. Farbman",
            "Guatemalan Man, UN",
            "Dancer from Bali, donna Grosvenor",
            "Andean girls, Joseph Scherschel",
            "Thai Craftsman, Dean Conger",
            "Domesticated ELephant, Peter Kunstadter",
            "Man with Glasses, Jonathan Blair",
            "Man with Dog, Bruce Baumann",
            "Mountain Climber, Gaston Rebuffat",
            "Gymnast Cathy Rigbey, Philip Neonian",
            "Olympic Sprinters, Picturepoint London",
            "Schoolroom, UN",
            "Children with Globe, UN",
            "Cotton harvest, Howell Walker",
            "Grape picker, David Moore",
            "Supermarket, Herman Eckelmann",
            "Diver with Fish, Jerry Greenberg",
            "Diver with Fish, Jerry Greenberg",
            "Diver with Fish, Jerry Greenberg",
            "Fishing Boat, UN",
            "Cooking Fish, Brian Seed",
            "Chinese Dinner Party, Michael Rougier",
            "Licking Eating and Drinking, Hermann Eckelmann",
            "The Great Wall of China, Edward Kim",
            "House Construction (African), UN",
            "Construction scene (Amish country), William Albert Allard",
            "House (Africa), UN",
            "House (New England), Robert Sisson",
            "Modern House (Cloudcroft New Mexico), Frank Drake",
            "House interior with artist and fire, Jim Amos",
            "House interior with artist and fire, Jim Amos",
            "House interior with artist and fire, Jim Amos",
            "Taj Mahal, David Carroll",
            "English city (Oxford), Douglas Gilbert",
            "Boston, Ted Spiegel",
            "UN Building Day, UN",
            "UN Building Night, UN",
            "UN Building Night, UN",
            "UN Building Night, UN",
            "Sydney Opera House, Mike Long",
            "Artisan with drill, Frank Hewlett",
            "Factory interior, Fred Ward",
            "Factory interior, Fred Ward",
            "Factory interior, Fred Ward",
            "Science Museum, Davic Cupp",
            "X-ray of Hand, Herman Eckelmann",
            "Microscope, UN",
            "Street Scene (Pakistin), UN",
            "Street (India), UN",
            "Highway with Trucks, Fred Ward",
            "Golden Gate Bridge, Ansel Adams",
            "Train, Gordon Gahan",
            "Airplane in Flight, Frank Drake",
            "Toronto Airport, Lawson Graphics",
            "Antartic Sno-Cat, National Geographic Society",
            "Radio Telescope, James P. Blair",
            "Arecibo Observatory, Herman Eckelmann",
            "Page from a Book, Cornell NAIC",
            "Astronaut in Space, NASA",
            "Astronaut in Space, NASA",
            "Astronaut in Space, NASA",
            "Titan Centaur Launch, NASA",
            "Sunset, David Harvey",
            "Sunset, David Harvey",
            "Sunset, David Harvey",
            "String Quartet, Philips Recordings",
            "Score of Quartet and Violin, Cornell NAIC",
        ],
        space: 988053,
    }
};
