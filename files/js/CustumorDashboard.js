let a = true;
let counter = 1;

let dashMail = document.getElementById("CustumorDashForm");
dashMail.addEventListener('submit', function (evt) {
    if (!(emailIsValid(document.querySelector("#email").value))) {
        window.alert("Email ist falsch ");
        evt.preventDefault();
    } else {
        window.alert("Email richtig");
    }

});

function emailIsValid(email) {
    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

function generate() {
    //Variablen erstellen
    let request = new XMLHttpRequest();
    let request1 = new XMLHttpRequest();
    let request2 = new XMLHttpRequest();
    let requestURL;
    let b = document.body;
    let nameimg = document.createElement("img");
    let customerdiv = document.createElement("div");
    let statusImg = document.createElement("img");
    let projektname = document.createElement("p");
    let clientname = document.createElement("p");
    let clientemail = document.createElement("p");
    let versionen = document.createElement("p");
    let company = document.createElement("p");
    let statusDiv = document.createElement("div");
    let textStatus = document.createElement("p");
    //custumordiv generieren
    customerdiv.className = "clients";
    b.appendChild(customerdiv);
    nameimg.setAttribute("alt", "tick");
    nameimg.style.borderRadius = "200px";
    nameimg.style.padding = "50px";
    customerdiv.appendChild(nameimg);
    //statusImg genereiren
    statusImg.setAttribute("alt", "tick");
    statusImg.style.padding = "20px";
    customerdiv.appendChild(statusImg);
    //Projektname generieren
    projektname.innerHTML = "Projekt Name" + counter;
    projektname.setAttribute("style", "text-align:center");
    customerdiv.appendChild(projektname);
    //Name aus API holen und Namens-IMG generieren
    requestURL = "http://localhost/design-revision/api/api.php?getuser=name&format=json";
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onload = function () {
        clientname.innerHTML = request.response;
        requestURL = "http://localhost/design-revision/api/avatar.php?name=" + clientname.innerHTML;
        nameimg.setAttribute("src", requestURL);
        clientname.setAttribute("style", "text-align:center");

    };
    customerdiv.appendChild(clientname);
    //fertig
    //Clientmail generieren
    requestURL = "http://localhost/design-revision/api/api.php?getuser=email&format=json";
    request1.open('GET', requestURL);
    request1.responseType = 'json';
    request1.send();
    request1.onload = function () {
        clientemail.innerHTML = request1.response;
        clientemail.setAttribute("style", "text-align:center");
    };
    customerdiv.appendChild(clientemail);
    //Versionen genereieren
    versionen.innerHTML = "Versionen" + counter;
    versionen.setAttribute("style", "text-align:center");
    customerdiv.appendChild(versionen);
    //Company generieren
    requestURL = "http://localhost/design-revision/api/api.php?getuser=company&format=json";
    request2.open('GET', requestURL);
    request2.responseType = 'json';
    request2.send();
    request2.onload = function () {
        company.innerHTML = request2.response;
        company.setAttribute("style", "text-align:center");
    };
    customerdiv.appendChild(company);
    //StatusDiv generieren
    statusDiv.className = "status";
    customerdiv.appendChild(statusDiv);
    //Status generieren
    textStatus.innerHTML = "Fertig/Druckfreigabe";
    statusDiv.appendChild(textStatus);
    //Abfrage für den Status
    if (textStatus.innerHTML === "Fertig/Druckfreigabe") {
        statusImg.setAttribute("src", "../files/img/XBereit.png");
        boolStatus = true;
    } else {
        statusImg.setAttribute("src", "../files/img/XWarten.png");
        boolStatus = false;
    }
    //Abfrage ob der Kunden gelöscht werden kann
    if (boolStatus) {
        customerdiv.onclick = function () {
            clientDivClick(clientname.innerHTML, projektname.innerHTML);
            let id1 = clientname.innerHTML + projektname.innerHTML;
            customerdiv.setAttribute("id", id1);
        };
    }


    counter++;
}

function customerDelate() {
    let dialog = document.getElementById("dialog");
    dialog.setAttribute('open', 'open');
    toggleDialog();


}

//Button Ja gedrückt
function closeYes() {
    document.getElementById("dialog").removeAttribute('open');
    a = true;
    let divForm = document.getElementById("form1");
    let loeschen = document.getElementById("p1");
    divForm.removeChild(loeschen);
    let id1 = document.getElementById("pName").innerHTML + document.getElementById("pProjekt").innerHTML;
    let div = document.getElementById(id1);
    div.remove();
    toggleDialog();
}

//Button Nein gedrückt
function closeNo() {
    document.getElementById("dialog").removeAttribute('open');
    toggleDialog();
}

//Dialogfenster öffnen
function clientDivClick(name1, projekt1) {
    let divForm = document.getElementById("form1");
    let loeschen = document.createElement("p");
    if (a) {
        loeschen.innerHTML = "Kunde löschen";
        loeschen.setAttribute("onclick", "customerDelate()");
        loeschen.setAttribute("id", "p1");
        divForm.appendChild(loeschen);
        a = false;

    } else {
        divForm.lastChild.remove();
        a = true;
    }

    document.getElementById("pName").innerHTML = name1;
    document.getElementById("pProjekt").innerHTML = projekt1;


}

//Handler für den Dialog da manche Browser nicht kompatibel sind
function toggleDialog() {
    let dialog = document.getElementById("dialog");
    if (!dialog.hasAttribute('open')) {
        let div = document.createElement('div');
        div.id = 'backdrop';
        document.body.appendChild(div);
    } else {
        let div = document.querySelector('#backdrop');
        div.parentNode.removeChild(div);

    }
}