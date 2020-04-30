let urlParameter;
let awaitData = true;
let obj;
let length;

function generate() {
    for (let i = 0; i < length; i++) {
        let tableNummer = document.getElementById("tnummer");
        let tableLink = document.getElementById("tlink");
        let tableLastModified = document.getElementById("tZuletztBearbeitet");
        let nummer = document.createElement("p");
        let link = document.createElement("a");
        let lastModified = document.createElement("p");
        link.style.lineHeight="40px";
        nummer.style.lineHeight="25px";
        lastModified.style.lineHeight="15px";
        link.style.cursor = "pointer";
        link.style.textDecoration = "none";
        link.style.color = "black";
        link.style.paddingTop = "20px";
        link.onmouseover = function () {
            link.style.color = "lightgray";
        };
        link.onmouseout = function () {
            link.style.color = "black";
        };
        nummer.innerHTML = "" + (i + 1);
        link.innerHTML = "link.to/file" + (i + 1);
        link.href = window.location.origin + "/design-revision/app/ViewDesign.html?pdf=" + obj[i].link + "&&id=" + urlParameter;
        lastModified.innerHTML = obj[i].lastedit;
        lastModified.style.paddingTop = "10px";
        tableNummer.appendChild(nummer);
        tableLink.appendChild(link);
        let br = document.createElement("BR");
        br.style.paddingTop="px";
        tableLink.appendChild(br);
        tableLastModified.appendChild(lastModified);
    }
}



let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        urlParameter = getURLParameter('id');
        if(urlParameter===""){
            window.location=window.location.origin+"/design-revision/app/";
        }
        request();
        let getVersion = setInterval(function () {
            if (!awaitData) {
                generate();
                clearInterval(getVersion);
            }
        }, 100);
    }
}, 100);

function request() {
    let requestURL = window.location.origin + "/design-revision/api/project/history?id=" + urlParameter;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL, true);
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            obj = JSON.parse(request.response);
            length = obj.length;
            console.log(length);
            console.log(obj);
            awaitData = false;
        } else if (request.readyState === 4 && request.status === 401) {
            console.log("Nicht eingelogt");
            document.location = "../login/";
        } else if (request.readyState === 4 && request.status === 403) {
            setTimeout(function () {
                //using timeouts because otherwise the site could not show alert correctly
                showmes("error", "Verboten");
            },100);

        } else if (request.readyState === 4 && request.status === 404) {
            setTimeout(function () {
                showmes("error", "Nichts gefunden");
            },100)
        } else if (request.readyState === 4 && request.status === 400) {
            setTimeout(function () {
                showmes("error", "Unbekannter AnfrageParameter");
            },100)

        }

    };
}

function getURLParameter(name) {
    let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
}