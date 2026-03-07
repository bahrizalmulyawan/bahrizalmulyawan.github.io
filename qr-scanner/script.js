function onScanSuccess(decodedText, decodedResult) {
    document.getElementById("result").innerText = decodedText;
}

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: 250 }
);

html5QrcodeScanner.render(onScanSuccess);