let lastCode = "0";
let codes = {};

Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#camera-stream'),    // Or '#yourElement' (optional)
        constraints: {
            width: window.innerWidth - (.10 * window.innerWidth),
            height: window.innerWidth - (.10 * window.innerWidth),
            facingMode: "environment" // or user
        }
    },
    frequency: 1.5,
    decoder: {
        readers: ["upc_reader"]
    }
}, function (err) {
    if (err) {
        console.log(err);
        return
    }
    console.log("Initialization finished. Ready to start");
    Quagga.start();
});

Quagga.onDetected((data) => {
    if (!(lastCode === data.codeResult.code)) {
        readCode(data.codeResult.code);
        lastCode = data.codeResult.code;
    } else if (codes[lastCode]) {
        if (lastCode === data.codeResult.code && Math.floor(Date.now() / 1000) - codes[lastCode].timestamp > 10) {
            readCode(data.codeResult.code);
            lastCode = data.codeResult.code;
        }
    }
});

document.getElementById("manualSearch").addEventListener("submit", function(e){
    e.preventDefault();
    let inputBox = document.getElementById("manualInput");
    readCode(inputBox.value);
    inputBox.value = "";
});

function readCode(code) {
    axios.get("https://grill-barcode-default-rtdb.firebaseio.com/codes.json").then(res => {
        console.log(res.data);
        if (res.data.codes[code]) {
            alert(`Name: ${res.data.codes[code].name} \nPrice: ${res.data.codes[code].price} \nCode: ${code}`);
            codes[code] = {};
            codes[code].timestamp = Math.floor(Date.now() / 1000);
        } else {
            alert(`Name: Not Found \nPrice: Not Found \nCode: ${code}`);
            codes[code] = {};
            codes[code].timestamp = Math.floor(Date.now() / 1000);
        }
    });
}
