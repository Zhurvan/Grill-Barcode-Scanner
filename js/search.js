let currencyInput = document.querySelector('input[type="currency"]')
let currency = 'USD' // https://www.currency-iso.org/dam/downloads/lists/list_one.xml

// format inital value
onBlur({target: currencyInput})

// bind event listeners
currencyInput.addEventListener('focus', onFocus)
currencyInput.addEventListener('blur', onBlur)

function localStringToNumber(s) {
    return Number(String(s).replace(/[^0-9.-]+/g, ""))
}

function onFocus(e) {
    let value = e.target.value;
    e.target.value = value ? localStringToNumber(value) : ''
}

function onBlur(e) {
    let value = e.target.value

    let options = {
        maximumFractionDigits: 2,
        currency: currency,
        style: "currency",
        currencyDisplay: "symbol"
    }

    e.target.value = (value || value === 0)
        ? localStringToNumber(value).toLocaleString(undefined, options)
        : ''
}

document.forms["searchForm"].onsubmit = function (e) {
    e.preventDefault();
    let searchInput = document.getElementById("search");
    let typeInput = document.getElementById("searchType");
    let priceInput = document.getElementById("price");
    let query = searchInput.value.toLowerCase();
    let arr = [];
    axios.get("https://grill-barcode-default-rtdb.firebaseio.com/codes.json").then(res => {
        let keys = Object.keys(res.data);
        if (typeInput.value === "name") {
            keys.forEach(element => {
                let name = res.data[element].name.toLowerCase();
                name.split(' ').forEach(word => {
                    if (stringSimilarity.compareTwoStrings(word, query) > .56) {
                        arr.push(res.data[element]);
                    } else {
                        query.split("").forEach(queryWord => {
                            if (stringSimilarity.compareTwoStrings(word, queryWord) > .56) {
                                arr.push(res.data[element]);
                            }
                        });
                    }
                });
            });
        } else if (typeInput.value === "barcode") {
            keys.forEach(element => {
                if (+element === +query) {
                    arr.push(res.data[element]);
                }
            });
        }
        if (priceInput.value && !(searchInput.value)) {
            let maxPrice = +priceInput.value.replace('$', '');
            keys.forEach(element => {
                let price = +res.data[element].price.replace('$', '');
                if (price <= maxPrice) {
                    arr.push(res.data[element]);
                }
            });
        } else if (priceInput.value && searchInput.value) {
            let maxPrice = +priceInput.value.replace('$', '');
            for (let i = 0; i < arr.length; i++) {
                let price = +arr[i].price.replace('$', '');
                if (price >= maxPrice) {
                    arr.splice(i, 1);
                    i--;
                }
            }
        }
    }).then(() => {
        arr = [...new Set(arr)];
        arr.forEach(element => {
            element.priceVal = +element.price.replace('$', '');
        });
        arr.sort(priceCompare);
        document.getElementById("list").innerHTML = ""
        document.getElementById("list").appendChild(arrayToList(arr));
    });
}

function arrayToList(array) {
    let list = document.createElement('ul');
    list.id = "results";
    if (array.length === 0) {
        let item = document.createElement('li');
        item.innerText = `No results found.`
        item.setAttribute("class", "resultItem");
        list.appendChild(item);
    } else {
        array.forEach(element => {
            let item = document.createElement('li');
            item.innerHTML = `${element.name} <hr> ${element.price}`
            item.setAttribute("class", "resultItem");
            list.appendChild(item);
        });
    }
    return list;
}

function priceCompare(a, b) {
    let comparison = 0;
    if (a.priceVal > b.priceVal) {
        comparison = 1;
    } else if (a.priceVal < b.priceVal) {
        comparison = -1;
    }
    return comparison;
}