let a = true;
var counter = 1;
let customerid;

function emailIsValid(email) {
    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

function generate() {
    //Variablen erstellen
    let request = new XMLHttpRequest();
    let request1 = new XMLHttpRequest();
    let requestURL;
    let projectid = 2;
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
    requestURL = "http://localhost/design-revision/api/?getproject&id=" + projectid;
    request1.open('GET', requestURL, true);
    request1.send();
    request1.onreadystatechange = function () {
        //wir bekommen ein Jason Object
        if (request1.readyState === 4 && request1.status === 200) {
            let projectObejct = JSON.parse(request1.response);
            projektname.innerHTML = projectObejct.project.name;
            versionen.innerHTML = projectObejct.project.version;
            textStatus.innerHTML = projectObejct.project.status;
            //window.location als ersatz zu a da man sonst dedign ändern muss
            projektname.onclick = function () {
                window.location = projectObejct.project.link;
            }
        } else if (request1.readyState === 4 && request1.status === 401) {
            customerdiv.remove();
            //window.alert("Nicht eingelogt");
            document.location = "../login/login.html";
        } else if (request1.readyState === 4 && request1.status === 403) {
            window.alert("Forbidden");
        } else if (request1.readyState === 4 && request1.status === 404) {
            window.alert("Nichts gefunden");
        } else if (request1.readyState === 4 && request1.status === 400) {
            window.alert("Unbekannter Anfrageparameter");
        }
    };

    //Projectname erstellen
    projektname.setAttribute("style", "text-align:center");
    customerdiv.appendChild(projektname);

    //Jason user Object aus Api holen
    requestURL = "http://localhost/design-revision/api/?getuser";
    request.open('GET', requestURL);
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            let userObject = JSON.parse(request.response);
            clientname.innerHTML = userObject.user.name + counter;
            let help = userObject.user.name + counter;
            customerdiv.setAttribute('data-test', help);
            nameimg.setAttribute("src", userObject.user.avatar);
            clientemail.innerHTML = userObject.user.email;
            company.innerHTML = userObject.user.company;
            counter++;
        } else if (request.readyState === 4 && request.status === 403) {
            window.alert("Forbidden");
        } else if (request.readyState === 4 && request.status === 404) {
            window.alert("Nichts gefunden");
        } else if (request1.readyState === 4 && request1.status === 400) {
            window.alert("Unbekannter AnfrageParameter");
        }
    };
    clientname.setAttribute("style", "text-align:center");
    customerdiv.appendChild(clientname);
    //fertig
    clientemail.setAttribute("style", "text-align:center");
    customerdiv.appendChild(clientemail);
    //Versionen erstellen
    versionen.setAttribute("style", "text-align:center");
    customerdiv.appendChild(versionen);
    //Company erstellen
    company.setAttribute("style", "text-align:center");
    customerdiv.appendChild(company);
    //StatusDiv erstellen
    statusDiv.className = "status";
    customerdiv.appendChild(statusDiv);
    //Status erstellem
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
            let id1 = clientname.innerHTML + projektname.innerHTML;
            customerdiv.setAttribute("id", id1);
            clientDivClick(clientname.innerHTML, projektname.innerHTML, id1);


        };
    }
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
    let div = document.getElementById(customerid);
    div.remove();
    toggleDialog();
}

//Button Nein gedrückt
function closeNo() {
    document.getElementById("dialog").removeAttribute('open');
    toggleDialog();
}

//Dialogfenster öffnen
function clientDivClick(name1, projekt1, id1) {
    let divForm = document.getElementById("form1");
    let loeschen = document.createElement("p");
    if (a) {
        loeschen.innerHTML = "Kunde löschen";
        loeschen.setAttribute("onclick", "customerDelate()");
        loeschen.setAttribute("id", "p1");
        divForm.appendChild(loeschen);
        customerid = id1;
        let customerdiv1 = document.getElementById(customerid);
        customerdiv1.style.border = "4px solid red";
        a = false;

    } else {
        divForm.lastChild.remove();
        let customerdiv1 = document.getElementById(customerid);
        customerdiv1.style.border = "4px solid black";
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



