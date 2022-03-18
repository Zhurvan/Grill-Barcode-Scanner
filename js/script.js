let lastCode = "0";
let codes = {};
let submitButton = document.getElementById('submitLink');

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
        readers: ["upc_reader", "upc_e_reader"]
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

function readCode(code) {
    axios.get("https://grill-barcode-default-rtdb.firebaseio.com/codes.json").then(res => {
        console.log(res.data);
        if (res.data[code]) {
            alert(`Name: ${res.data[code].name} \nPrice: ${res.data[code].price} \nCode: ${code}`);
            codes[code] = {};
            codes[code].timestamp = Math.floor(Date.now() / 1000);
        } else {
            alert(`Name: Not Found \nPrice: Not Found \nCode: ${code}`);
            codes[code] = {};
            codes[code].timestamp = Math.floor(Date.now() / 1000);
        }
    });
    submitButton.setAttribute('href', `https://docs.google.com/forms/d/e/1FAIpQLSdJlXyxbxVLk8zwOkQ3oi67T2KsEHCGXPKeTEt7LBVqiwOelg/viewform?usp=pp_url&entry.1172952014=${code}`);
    submitButton.target = "_blank";
}
