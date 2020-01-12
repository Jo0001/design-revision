let a = true;
let counter = 0;
let customerid;
let bool1 = false;

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
    let arrayMember;
    let arrayRole;
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
    let members = document.createElement("p");
    let role = document.createElement("p");
    //custumordiv generieren
    customerdiv.className = "clients";
    b.appendChild(customerdiv);
    nameimg.setAttribute("alt", "tick");
    nameimg.style.borderRadius = "200px";
    nameimg.style.padding = "40px";
    customerdiv.appendChild(nameimg);
    //statusImg genereiren
    statusImg.setAttribute("alt", "tick");
    customerdiv.appendChild(statusImg);
    //Projektname generieren
    requestURL = window.location.origin + "/design-revision/api/?getproject&id=" + projectid;
    request1.open('GET', requestURL, true);
    request1.send();
    request1.onreadystatechange = function () {
        //wir bekommen ein Jason Object
        if (request1.readyState === 4 && request1.status === 200) {
            let projectObejct = JSON.parse(request1.response);
            projektname.innerHTML = projectObejct.project.name;
            versionen.innerHTML = projectObejct.project.version;
            textStatus.innerHTML = projectObejct.project.status;
            let members1 = projectObejct.project.members;
            //members bekommen
            let help = members1[0].id;
            let helpRole = members1[0].role;
            let length = members1.length;
            for (let i = 1; i < length; i++) {
                help = help + "," + members1[i].id;
                helpRole = helpRole + "," + members1[i].role;
            }
            //members generieren
            members.innerHTML = help;
            members.style.display = "none";
            members.id = "members";
            customerdiv.appendChild(members);
            arrayMember = members.innerHTML;
            arrayMember = arrayMember.split(",");
            //role generiern
            role.innerHTML = helpRole;
            role.style.display = "none";
            customerdiv.appendChild(role);
            arrayRole = role.innerHTML;
            arrayRole = arrayRole.split(",");
            members.remove();
            role.remove();
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
    customerdiv.appendChild(projektname);

    //Jason user Object aus Api holen
    requestURL = window.location.origin + "/design-revision/api/?getuser";
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
            //customerdiv id geben
            customerdiv.setAttribute('data-id', counter);
            counter++;
        } else if (request.readyState === 4 && request.status === 403) {
            window.alert("Forbidden");
        } else if (request.readyState === 4 && request.status === 404) {
            window.alert("Nichts gefunden");
        } else if (request1.readyState === 4 && request1.status === 400) {
            window.alert("Unbekannter AnfrageParameter");
        }
    };
    customerdiv.appendChild(clientname);
    //fertig
    customerdiv.appendChild(clientemail);
    //Versionen erstellen

    customerdiv.appendChild(versionen);
    //Company erstellen
    customerdiv.appendChild(company);
    //StatusDiv erstellen
    statusDiv.className = "status";
    customerdiv.appendChild(statusDiv);
    //Status erstellem
    statusDiv.appendChild(textStatus);
    //Abfrage für den Status
    let boolStatus;
    if (textStatus.innerHTML=== "Fertig/Druckfreigabe") {
        statusImg.setAttribute("src", "../files/img/XBereit.png");
        boolStatus = true;
    } else {
        statusImg.setAttribute("src", "../files/img/XWarten.png");
        boolStatus = false;
    }
    //Abfrage ob der Kunden gelöscht werden kann

    customerdiv.onclick = function () {
        let id1 = clientname.innerHTML + projektname.innerHTML;
        customerdiv.setAttribute("id", id1);
        clientDivClick(clientname.innerHTML, projektname.innerHTML, id1, boolStatus, arrayMember, arrayRole);

    };
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
function clientDivClick(name1, projekt1, id1, boolStatus, members, role) {
    let divForm = document.getElementById("form1");
    let loeschen = document.createElement("p");
    let content = document.querySelectorAll('[data-id');
    let arrayLength = content.length;
    let help;
    if (a) {
        for (let i = 0; i < arrayLength; i++) {
            help = content[i].getAttribute("data-id");
            if (members.includes(help)) {
                let help1 = members.indexOf(help);
                if (role[help1] == 0) {
                    let messageMember = document.createElement("p");
                    messageMember.innerHTML = "Ist Mitglied in dem Gew&auml;hlten project";
                    messageMember.style.paddingLeft = "10px";
                    content[i].style.background = "#00FF66";
                    content[i].appendChild(messageMember);
                }
                if (role[help1] == 1) {
                    let messageMember = document.createElement("p");
                    messageMember.innerHTML = "Ist Admin in dem Gew&auml;hlten project";
                    messageMember.style.paddingLeft = "10px";
                    content[i].style.background = "orange";
                    content[i].appendChild(messageMember);
                }
            }

        }
        customerid = id1;
        let customerdiv1 = document.getElementById(customerid);
        //Abfrage ob der Kunde gelöscht werden kann
        if (boolStatus) {
            loeschen.innerHTML = "Kunde löschen";
            loeschen.setAttribute("onclick", "customerDelate()");
            loeschen.setAttribute("id", "p1");
            divForm.appendChild(loeschen);
            customerdiv1.style.border = "4px solid red";
        } else {
            customerdiv1.style.background = "#0cfad6";
        }
        a = false;

    } else {
        //Abfrage ob der Kunde gelöscht werden kann
        if (boolStatus) {
            divForm.lastChild.remove();
        }
        let customerdiv1 = document.getElementById(customerid);
        customerdiv1.style.background = "white";
        customerdiv1.style.border = "4px solid black";
        a = true;
        for (let i = 0; i < arrayLength; i++) {
            help = content[i].getAttribute("data-id");
            if (members.includes(help)) {
                content[i].style.background = "white";
                content[i].lastChild.remove();

            }
        }
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


function showRes() {
    let content = document.querySelectorAll('[data-test');
    let arrayLength = content.length;
    let value = document.getElementById("searchform").value;
    value = value.toLowerCase();
    let message = document.getElementById("message");
    let dis = [];
    if (bool1) {
        message.style.display = "none";
        bool1 = false;
    }
//sucht nach CustomerDivs die Datatest haben un macht sie in ein Array
    for (let i = 0; i < arrayLength; i++) {
        let help = content[i].getAttribute("data-test");
        help = help.toLowerCase();
        //schaut ob die inhalte desvon data-test mit dem Suchbegriff übereinstimmen
        if (help.match(value)) {
            content[i].style.display = "block";
            dis[i] = "block";
            //die Div werden entwieder sichtbar oder unsichtbar
        } else {
            content[i].style.display = "none";
            dis[i] = "none";
        }

    }
    //schaut ob mindestens ein div angeziegt wird
    if (!(dis.includes("block"))) {
        message.style.display = "block";
        bool1 = true;

    }
}

//Wartet bis die Seite geladen ist
let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        //generirt 3 User
        for (let i = 0; i <= 10; i++) {
            generate();
        }
        //E-Mail validierung
        let dashMail = document.getElementById("CustumorDashForm");
        dashMail.addEventListener('submit', function (evt) {
            if (!(emailIsValid(document.querySelector("#email").value))) {
                window.alert("Email ist falsch ");
                evt.preventDefault();
            } else {

                window.alert("Email richtig");
            }

        });
        //beim submit Event wird der Submit gehindert
        document.getElementById('search1').onsubmit = function (evt) {
            evt.preventDefault();
        };
        // führt die Methode showRes beim Keyup_Event aus
        document.getElementById("searchform").addEventListener('keyup', showRes);
    }
}, 10);



