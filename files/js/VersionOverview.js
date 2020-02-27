let counter =1;
let urlParameter;
let newVersion = true;
let awaitData=true;
function generate() {
        awaitData=false;
        let tableNummer = document.getElementById("tnummer");
        let tableLink = document.getElementById("tlink");
        let tableLastModified = document.getElementById("tZuletztBearbeitet");
        let nummer = document.createElement("p");
        let link = document.createElement("a");
        link.style.cursor = "pointer";
        link.style.textDecoration = "none";
        link.style.color = "black";
        link.onmouseover = function () {
            link.style.color = "lightgray";
        };
        link.onmouseout = function () {
            link.style.color = "black";
        };
        let lastModified = document.createElement("p");
        let requestURL = window.location.origin + "/design-revision/api/project/history?id=" + urlParameter;
        let request = new XMLHttpRequest();
        request.open('GET', requestURL, true);
        request.send();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                let obj = JSON.parse(request.response);
                console.log(obj);
                nummer.innerHTML = "" + counter;
                link.innerHTML = "link.to/file" + counter;
                link.href = window.location.origin + "/design-revision/" + obj[counter - 1].link;
                lastModified.innerHTML = obj[counter - 1].lastedit;
                awaitData=true;
                console.log(counter);
                if(counter===obj.length){
                    newVersion=false;
                    console.log("HEllo")
                }else {
                    counter++;
                }
            } else if (request.readyState === 4 && request.status === 401) {
                console.log("Nicht eingelogt");
                document.location = "../login/login.html";
            } else if (request.readyState === 4 && request.status === 403) {
                console.log("Verboten");
            } else if (request.readyState === 4 && request.status === 404) {
                console.log("Nichts gefunden");
            } else if (request.readyState === 4 && request.status === 400) {
                console.log("Unbekannter Anfrageparameter");
            }

        };
        tableNummer.appendChild(nummer);
        tableLink.appendChild(link);
        tableLastModified.appendChild(lastModified);
}



let readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        urlParameter=getURLParameter('id');
        let getVersion = setInterval(function() {
            if(awaitData){
                generate();
            }
            if(newVersion){
                clearInterval(getVersion);
            }
        },100);


    }
}, 10);

function getURLParameter(name) {
    let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
}