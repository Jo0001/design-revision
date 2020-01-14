let counter =1;
let urlParameter;
//nur zum Testen today
let today = new Date();

function generate() {
    let tableNummer =document.getElementById("tnummer");
    let tableLink =document.getElementById("tlink");
    let tableLastModified=document.getElementById("tZuletztBearbeitet");
    let nummer = document.createElement("p");
    let link =document.createElement("p");
    let lastModified =document.createElement("p");
    // parameter übergabe  austehend
    urlParameter=2;
   let requestURL = window.location.origin + "/design-revision/api/?getproject&id="+urlParameter;
   let request= new XMLHttpRequest();
    request.open('GET', requestURL, true);
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            let obj = JSON.parse(request.response);
            nummer.innerHTML=""+counter;
            //link.href= obj.project.link;
            link.innerHTML="link.to/file"+counter;
            link.onclick=function(){
                window.location=obj.project.link;
            };
            lastModified.innerHTML=""+today.toLocaleString();
            counter++;
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
        for (let i = 0; i <6; i++) {
            generate();
            urlParameter=getURLParameter('id');

        }
    }
}, 10);

function getURLParameter(name) {
    let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
}