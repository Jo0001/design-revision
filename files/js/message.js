let mes;
let text;
let icon;
let btn;
let h;
let list;
let clist2;
let readyStateCheckIntervalMes = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckIntervalMes);
        mes = document.getElementById("mes");
        load();
        text = document.getElementById("mes-txt");
        icon = document.getElementById("mes-icon");
        btn = document.getElementById("mes-btn");
        h = document.getElementById("mes-h");
        list = null;
        clist2 = null;

    }
}, 200);

function load() {
    let h1 = document.createElement("h1");
    h1.id = "mes-h";
    let micon = document.createElement("div");
    micon.id = "mes-icon";
    let mtxt = document.createElement("p");
    mtxt.id = "mes-txt";
    let mbtn = document.createElement("button");
    mbtn.id = "mes-btn";
    mbtn.type = "button";
    mbtn.innerText = "Okay";
    mbtn.style.color = "black";
    mbtn.setAttribute("onClick", "cls()");
    mes.appendChild(h1);
    mes.appendChild(micon);
    mes.appendChild(mtxt);
    mes.appendChild(mbtn);
}


function cls() {
    //page reload only for Dashboard
    location.reload(true);
    mes.style.display = "none";
}

function showmes(type, txt) {
    list = mes.classList;
    clist2 = icon.classList;
    mes.classList.remove(list);
    mes.classList.add(type);
    icon.classList = '';
   //icon.classList.remove(clist2);
    icon.classList.add(type);
    icon.classList.add("circle");
    icon.classList.add("center");
    switch (type) {
        case "warn":
            btn.style.backgroundColor = "#ffce00";
            h.innerHTML = "Warnung";
            icon.innerHTML = "!";
            break;
        case "error":
            btn.style.backgroundColor = "red";
            h.innerHTML = "Fehler";
            icon.innerHTML = "X";
            break;
        default:
            btn.style.backgroundColor = "#0db00d";
            h.innerHTML = "Info";
            icon.innerHTML = "i";
            break;
    }
    text.innerHTML = txt;
    mes.style.display = "block";
}