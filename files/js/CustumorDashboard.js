let a = true;
let counter = 0;
let counterForId = 0;
let customerid;
let projectid;
let ableNewProject = true;
let bool1 = false;
let boolStatus;
let select = true;
let doubleClickSelect = true;
let sendArray = [];
let sendFile;
let sendArrayFields = [];
let updateOrCreate = true;
let nameLenght = false;
let moreMember = 1;
let tmpClients;
function emailIsValid(email) {
    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

function generate() {
    //Variablen erstellen
    let request = new XMLHttpRequest();
    let request1 = new XMLHttpRequest();
    let requestURL;
    let b = document.body;
    let arrayMember;
    let arrayRole;
    let projectsArray;
    let requestredy = false;
    let nameimg = document.createElement("img");
    let customerdiv = document.createElement("div");
    let statusImg = document.createElement("img");
    let projektname = document.createElement("a");
    projektname.style.cursor = "pointer";
    projektname.style.fontSize = "28px";
    projektname.style.textDecoration = "none";
    projektname.style.color = "black";
    projektname.onmouseover = function () {
        projektname.style.color = "lightgray";
    };
    projektname.onmouseout = function () {
        projektname.style.color = "black";
    };
    let clientname = document.createElement("p");
    let clientemail = document.createElement("p");
    let versionen = document.createElement("p");
    let company = document.createElement("p");
    let statusDiv = document.createElement("div");
    let textStatus = document.createElement("p");
    let members = document.createElement("p");
    let role = document.createElement("p");
    let includedPorjects = document.createElement("p");
    //custumordiv generieren
    customerdiv.className = "clients";
    b.appendChild(customerdiv);
    nameimg.setAttribute("alt", "tick");
    nameimg.style.borderRadius = "200px";
    nameimg.style.padding = "40px";
    customerdiv.appendChild(nameimg);
    //statusImg genereiren
    statusImg.setAttribute("alt", "tick");
    statusImg.style.zIndex = "2";
    customerdiv.appendChild(statusImg);
    //Projektname generieren

    //Projectname erstellen
    customerdiv.appendChild(projektname);
    //Jason user Object aus Api holen
    requestURL = window.location.origin + "/design-revision/api/?getuser";
    request.open('GET', requestURL, true);
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            let userObject = JSON.parse(request.response);
            clientname.innerHTML = userObject.user.name + counter;
            nameimg.setAttribute("src", userObject.user.avatar);
            clientemail.innerHTML = userObject.user.email + " " + counter;
            customerdiv.setAttribute('data-email', userObject.user.email + counter);
            company.innerHTML = userObject.user.company;
            if (!(userObject.user.status === "VERIFIED")) {
                window.location = window.location.origin + "/design-revision/login/verifizieren.html"
            }
            //Projects-array von Api holen
            let tmp = userObject.user.projects;
            if (tmp === null) {
                customerdiv.remove();
                clearInterval(checkForprojects);
                ableNewProject = false;
                window.alert("Noch keine Projekte");
                window.location = window.location.origin + "/design-revision/login/login.html";
            } else {
                let tmp1 = tmp[0];
                for (let i = 1; i < tmp.length; i++) {
                    tmp1 = tmp1 + "," + tmp[i];
                }
                includedPorjects.innerHTML = tmp1;
                includedPorjects.style.display = "none";
                customerdiv.appendChild(includedPorjects);
                projectsArray = includedPorjects.innerHTML;
                projectsArray = projectsArray.split(",");
                requestredy = true;
                includedPorjects.remove();
            }
            customerdiv.setAttribute('data-memberId', ""+ counter);
            counter++;

        } else if (request.readyState === 4 && request.status === 403) {
            console.log("Forbidden");
        } else if (request.readyState === 4 && request.status === 401) {
            document.location = window.location.origin + "/design-revision/login/login.html";
        } else if (request.readyState === 4 && request.status === 404) {
            window.alert("Nichts gefunden");
        } else if (request1.readyState === 4 && request1.status === 400) {
            window.alert("Unbekannter AnfrageParameter");
        }
    };
    let checkForprojects = setInterval(function () {
        if (requestredy) {
            clearInterval(checkForprojects);
            projectid = projectsArray[counterForId];
            //window.location als ersatz zu a da man sonst dedign ändern muss
            let link = window.location.origin + "/design-revision/simulate/edit.php?id=" + projectid;
            projektname.href = link;
            //customerdiv id geben
            customerdiv.setAttribute('data-id', "" + projectsArray[counterForId]);
            ableNewProject = counterForId < projectsArray.length;
            if (!ableNewProject) {
                customerdiv.remove();
            } else {
                counterForId++;
                requestURL = window.location.origin + "/design-revision/api/?getproject&id=" + projectid;
                request1.open('GET', requestURL, true);
                request1.send();
                request1.onreadystatechange = function () {
                    //wir bekommen ein Jason Object
                    if (request1.readyState === 4 && request1.status === 200) {
                        let projectObejct = JSON.parse(request1.response);
                        projektname.innerHTML = projectObejct.project.name;
                        versionen.innerHTML = "Versionen: " + projectObejct.project.version;
                        textStatus.innerHTML = projectObejct.project.status;
                        let members1 = projectObejct.project.members;
                        let search = projectObejct.project.name ;
                        customerdiv.setAttribute('data-test', search);
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
                    } else if (request1.readyState === 4 && request1.status === 401) {
                        customerdiv.remove();
                        //window.alert("Nicht eingelogt");
                        document.location = "../login/login.html";
                    } else if (request1.readyState === 4 && request1.status === 403) {
                        window.alert("Sie sind noch in keinem Projekt warten sie bis wir sie zu einem hinzufügen!");
                        console.log("Forbidden");
                    } else if (request1.readyState === 4 && request1.status === 404) {
                        window.alert("Nichts gefunden");
                    } else if (request1.readyState === 4 && request1.status === 400) {
                        console.log("Unbekannter Anfrageparameter");
                    }
                };
            }
        }
    }, 200);


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

    //todo zum test != sonst ===
    if (textStatus.innerHTML != "Fertig/Druckfreigabe") {
        statusImg.setAttribute("src", "../files/img/XBereit.png");
        boolStatus = true;
    } else {
        statusImg.setAttribute("src", "../files/img/XWarten.png");
        boolStatus = false;
    }
    //Abfrage ob der Kunden gelöscht werden kann

    customerdiv.onclick = function () {
        let content = document.querySelectorAll('[data-memberid');
        let arrayLength = content.length;
        for (let i = 0; i <arrayLength ; i++) {
            content[i].style.background = "white";
            content[i].style.border = "4px solid black";
        }

        if (select) {
            let id1 = clientname.innerHTML + projektname.innerHTML;
            customerdiv.setAttribute("id", id1);
            customerdiv.style.background = "white";
            clientDivClick(clientname.innerHTML, projektname.innerHTML, id1, boolStatus, arrayMember, arrayRole);
            let btnAddMember = document.getElementById("btnAddMember");
            let projektErsellen = document.getElementById("projektErstellen");
            let projektName = document.getElementById("projectname");
            projektName.required = true;
            projektName.style.display = "block";
            projektErsellen.innerHTML = "Projekt erstellen";
            btnAddMember.onclick = function () {
                addMember();
            };
            updateOrCreate = true;
            doubleClickSelect = true;
        }
    };
    //Client Doppel Click
    customerdiv.addEventListener('dblclick', function (e) {
        let btnAddMember = document.getElementById("btnAddMember");
        let projektErsellen = document.getElementById("projektErstellen");
        let projektName = document.getElementById("projectname");
        let content = document.querySelectorAll('[data-memberid');
        let arrayLength = content.length;
        if (doubleClickSelect) {
            for (let i = 0; i < arrayLength; i++) {
                content[i].style.background = "white";
                content[i].style.border = "4px solid black";
            }
            if (a === false) {
                for (let i = 0; i < arrayLength; i++) {
                    let temp = content[i].lastChild;
                    if (temp.innerHTML === "Ist Admin in dem Gewählten project" || temp.innerHTML === "Ist Mitglied in dem Gewählten project") {
                        temp.style.display = "none";
                    }
                }
                //löschen nachricht verstecken
                if (boolStatus) {
                    let delet = document.getElementById("form1");
                    //messageMember verstecken
                    delet.lastChild.style.display = "none";
                }
                a = true;
            }
            if (select) {
                projektName.required = false;
                projektName.style.display = "none";
                projektErsellen.innerHTML = "Projekt ändern";
                customerdiv.style.background = "#FFFF99";
                btnAddMember.onclick = function () {
                    changeClientState(arrayMember, arrayRole, customerdiv.getAttribute("data-memberid"));
                    customerdiv.style.background = "#FFFF99";
                };
                updateOrCreate = false;
                doubleClickSelect = false;
                a = false;
            }
        }
    });
}

function customerDelate(members, content, arrayLength) {
    let dialog = document.getElementById("dialog");
    dialog.setAttribute('open', 'open');
    let btnYes = document.getElementById("btnYes");
    btnYes.onclick = function () {
        closeYes(members, content, arrayLength);
    };
    toggleDialog();


}

//Button Ja gedrückt
function closeYes(members, content, arrayLength) {
    document.getElementById("dialog").removeAttribute('open');
    a = true;
    let divForm = document.getElementById("form1");
    let loeschen = document.getElementById("p1");
    divForm.removeChild(loeschen);
    let div = document.getElementById(customerid);
    let id = div.getAttribute("data-id");
    sendDelet(id);
    //Daten der Cusomer löschen
    for (let i = 0; i < arrayLength; i++) {
        let help = content[i].getAttribute("data-id");
        if (members.includes(help)) {
            content[i].style.background = "white";
            content[i].lastChild.remove();
        }
    }
    loeschen.remove();
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
    let content = document.querySelectorAll('[data-memberId');
    let arrayLength = content.length;
    let help;
    if (a) {
        tmpClients=members;
        for (let i = 0; i < arrayLength; i++) {
            help = content[i].getAttribute("data-memberId");
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
            loeschen.onclick = function () {
                customerDelate(members, content, arrayLength);
            };
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
            divForm.lastChild.style.display = "none";
        }
        let customerdiv1 = document.getElementById(customerid);
        customerdiv1.style.background = "white";
        customerdiv1.style.border = "4px solid black";
        a = true;
        for (let i = 0; i < arrayLength; i++) {
            help = content[i].getAttribute("data-memberId");
            if (tmpClients.includes(help)) {
                content[i].style.background = "white";
                content[i].lastChild.style.display = "none";

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
        //generirt  User solange sie Projekte haben
        let userInterval = setInterval(function () {
            if (ableNewProject) {
                generate();
            } else {
                clearInterval(userInterval);
            }

        }, 200);

        addMemberWithEmail();
        let projectName = document.getElementById("projectname");
        projectName.addEventListener("keyup", function () {
            let feedback = document.getElementById("nameToLong");
            console.log(projectName.value.length);
            if (projectName.value.length >= 80) {
                feedback.style.color = "red";
                feedback.style.paddingLeft = "100px";
                feedback.innerHTML = "<strong>Name zu lang!</strong>"
                nameLenght = true;
            } else {
                feedback.innerHTML = "";
                nameLenght = false;
            }
        });

        let CustumorDashForm = document.getElementById("CustumorDashForm");
        CustumorDashForm.addEventListener('submit', function (evt) {
            if (sendFile === undefined || nameLenght) {
                console.log(Error);
            } else {
                let allRight = putArrayTogether();
                if (allRight) {
                    if (updateOrCreate) {
                        sendNewProject();
                    } else {
                        sendUpdateProject();
                    }
                    cleraForm();
                }
            }
            evt.preventDefault();
        });
        //beim submit Event wird der Submit gehindert
        document.getElementById('search1').onsubmit = function (evt) {
            evt.preventDefault();
        };
        // führt die Methode showRes beim Keyup_Event aus
        document.getElementById("searchform").addEventListener('keyup', showRes);
    }

    //Datei Upload
    const inputFile = document.getElementById("inputFile");
    const previewContainer = document.getElementById("imagePreview");
    const previewFile = previewContainer.querySelector(".image-preview__file");
    const pdfIcon = document.getElementById("pdfIcon");
    const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
    previewContainer.addEventListener('dragover', handleDragOver, false);
    previewContainer.addEventListener('drop', dateiauswahl, false);
    inputFile.addEventListener("change", function () {
        const file = this.files[0];
        console.log(file);
        previewFile.style.fontSize = "12px";
        if (file) {
            if (file.type === "application/pdf") {
                sendFile = file;
                pdfIcon.style.display = "block";
                previewDefaulText.style.display = "none";
                previewFile.style.display = "block";
                previewFile.style.color = "black";
                previewFile.style.fontSize = "12px";
                previewFile.innerHTML = file.name + " (" + file.type + ")- " + file.size + " bytes,zuletzt Bearbeitet " + file.lastModifiedDate;

            } else {
                previewFile.style.fontSize = "16px";
                previewFile.innerHTML = "Bitte PDF hinzufügen!";
                previewFile.style.color = "#cccccc";
                previewDefaulText.style.display = "none";
                pdfIcon.style.display = "none";
            }
        } else {
            pdfIcon.style.display = "none";
            previewDefaulText.style.display = "block";
            previewFile.innerHTML = "Keine Datei ausgewählt";
            previewFile.style.display = "none";
            sendFile = null;
        }
    });
    setTimeout(function () {
        document.getElementById('pageLoader').style.display = "none";
    }, 1000);

}, 10);

//Drag and Drop
function dateiauswahl(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    let file = evt.dataTransfer.files;
    let f = file[0];
    const previewContainer = document.getElementById("imagePreview");
    const previewFile = previewContainer.querySelector(".image-preview__file");
    const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
    const pdfIcon = document.getElementById("pdfIcon");

    if (f.type === "application/pdf") {
        sendFile = f;
        let output = f.name + " (" + f.type + ")- " + f.size + " bytes,zuletzt Bearbeitet " + f.lastModifiedDate;
        pdfIcon.style.display = "block";
        previewFile.innerHTML = output;
        previewDefaulText.style.display = "none";
        previewFile.style.display = "block";
        previewFile.style.color = "black";
        previewFile.style.fontSize = "12px";
    } else {
        previewFile.style.fontSize = "16px";
        previewFile.style.display = "block";
        pdfIcon.style.display = "none";
        previewFile.style.color = "#cccccc";
        previewFile.innerHTML = "Bitte PDF hinzufügen!";
        previewDefaulText.style.display = "none";
    }
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function addMember() {
    let content = document.querySelectorAll('[data-email');
    let arrayLength = content.length;
    let addButton = document.getElementById("btnAddMember");
    let jasonmembers = [];

    if (select) {
        if (a === false) {
            //löschen nachricht verstecken
            let delet = document.getElementById("form1");
            //messageMember verstecken
            delet.lastChild.style.display = "none";
            for (let i = 0; i < arrayLength; i++) {
                let temp = content[i].lastChild;
                if (temp.innerHTML === "Ist Admin in dem Gewählten project" || temp.innerHTML === "Ist Mitglied in dem Gewählten project") {
                    temp.style.display = "none";
                }
            }
            a = true;
        }
        addButton.value = "Zu Projekt hinzufügen";
        for (let i = 0; i < arrayLength; i++) {
            content[i].style.background = "white";
            content[i].style.border = "4px solid black";
            let buttonAdmin = document.createElement("button");
            buttonAdmin.innerHTML = "Admin";
            //Button Click event
            buttonAdmin.addEventListener('click', function () {
                let parent = buttonAdmin.parentNode;
                let email = parent.getAttribute("data-email");
                let role = 1;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[i].email == email) {
                            jasonmembers[i].role = 1;
                            include = false;
                        }
                    }
                }
                if (include) {
                    let member = {"email": email, "role": role};
                    jasonmembers.push(member);
                }
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "#FFA500";
            });
            content[i].appendChild(buttonAdmin);
            let buttonMember = document.createElement("button");
            //Butto Click event
            buttonMember.addEventListener('click', function () {
                let parent = buttonMember.parentNode;
                let email = parent.getAttribute("data-email");
                let role = 0;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[i].email == email) {
                            jasonmembers[i].role = 0;
                            include = false;
                        }
                    }
                }

                if (include) {
                    let member = {"email": email, "role": role};
                    jasonmembers.push(member);
                }
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "#00FF66"
            });
            buttonMember.innerHTML = "Member";
            content[i].appendChild(buttonMember);
            let buttonDeletMember = document.createElement("button");
            buttonDeletMember.innerHTML = "Entfehrnen";
            buttonDeletMember.addEventListener('click', function () {
                let parent = buttonDeletMember.parentNode;
                let email = parent.getAttribute("data-email");
                for (let k in jasonmembers) {
                    if (jasonmembers.hasOwnProperty(k)) {
                        if (jasonmembers[k].email == email) {
                            jasonmembers.splice(k, 1);
                        }
                    }

                }
                console.log(jasonmembers);
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "white";
            });
            content[i].appendChild(buttonDeletMember);
            select = false;
        }
    } else {
        console.log(sendArray);
        addButton.value = "Member auswählen";
        select = true;
        for (let i = 0; i < arrayLength; i++) {
            content[i].style.background = "white";
            content[i].lastChild.remove();
            content[i].lastChild.remove();
            content[i].lastChild.remove();
        }
    }

}

function changeClientState(members, role, id) {
    let content = document.querySelectorAll('[data-memberId');
    let arrayLength = content.length;
    let addButton = document.getElementById("btnAddMember");
    let jasonmembers = [];
    let helpArray=[];
    if (select) {
        if (a === false) {
            for (let i = 0; i < arrayLength; i++) {
                content[i].style.background = "white";
                content[i].style.border = "4px solid black";
                let temp = content[i].lastChild;
                if (temp.innerHTML === "Ist Admin in dem Gewählten project" || temp.innerHTML === "Ist Mitglied in dem Gewählten project") {
                    temp.style.display = "none";
                }
            }
            //löschen nachricht verstecken
            let delet = document.getElementById("form1");
            //messageMember verstecken
            if (boolStatus)
                delet.lastChild.style.display = "none";
            a = true;
        }

        for (let i = 0; i < arrayLength; i++) {
            let help = content[i].getAttribute("data-memberId");
            if (members.includes(help)) {
                let help1 = members.indexOf(help);
                if (role[help1] == 0) {
                    content[i].style.background = "#00FF66";
                }
                if (role[help1] == 1) {
                    content[i].style.background = "#FFA500";
                }
            }
        }
        let j=0;
        for (let i = 0; i <content.length ; i++) {
            if(members.includes(content[i].getAttribute("data-memberId"))){
               helpArray[j]=content[i].getAttribute("data-email");
                j++;
            }
        }

        for (let i = 0; i < members.length; i++) {
            if(content.length>members[i]) {
                let mail = helpArray[i];
                let member = {"email": mail, "role": role[i]};
                jasonmembers.push(member);
            }
        }
        addButton.value = "Zu Projekt hinzufügen";
        for (let i = 0; i < arrayLength; i++) {
            let buttonAdmin = document.createElement("button");
            buttonAdmin.innerHTML = "Admin";
            //Button Click event
            buttonAdmin.addEventListener('click', function () {
                let parent = buttonAdmin.parentNode;
                let email = parent.getAttribute("data-email");
                let role = 1;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[j].email == email) {
                            jasonmembers[i].role = 1;
                            include = false;
                        }
                    }
                }
                if (include) {
                    let member = {"email": email, "role": role};
                    jasonmembers.push(member);
                }
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "#FFA500";
            });
            content[i].appendChild(buttonAdmin);
            let buttonMember = document.createElement("button");
            //Butto Click event
            buttonMember.addEventListener('click', function () {
                let parent = buttonMember.parentNode;
                let email = parent.getAttribute("data-email");
                let role = "0";
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[j].email == email) {

                            jasonmembers[i].role = 0;
                            include = false;
                        }
                    }
                }

                if (include) {
                    let member = {"email": email, "role": role};
                    jasonmembers.push(member);
                }
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "#00FF66"
            });
            buttonMember.innerHTML = "Member";
            content[i].appendChild(buttonMember);
            let buttonDeletMember = document.createElement("button");
            buttonDeletMember.innerHTML = "Entfehrnen";
            buttonDeletMember.addEventListener('click', function () {
                let parent = buttonDeletMember.parentNode;
                let email = parent.getAttribute("data-email");
                for (let k in jasonmembers) {
                    if (jasonmembers.hasOwnProperty(k)) {
                        if (jasonmembers[k].email == email) {
                            jasonmembers.splice(k, 1);
                        }
                    }

                }
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "white";
            });
            content[i].appendChild(buttonDeletMember);
            if (i == id) {
                buttonMember.style.display = "none";
                buttonAdmin.style.display = "none";
                buttonDeletMember.style.display = "none"
            }
            select = false;
        }
    } else {
        console.log(sendArray);
        addButton.value = "Member auswählen";
        select = true;
        for (let i = 0; i < arrayLength; i++) {
            content[i].style.background = "white";
            content[i].style.border = "4px solid black";
            content[i].lastChild.remove();
            content[i].lastChild.remove();
            content[i].lastChild.remove();
        }
    }


}

function sendNewProject() {
    let data = new FormData();
    let projectname = document.getElementById("projectname").value;
    let progressBar = document.getElementById("loader");
    let percentage = document.getElementById("percentage");
    let tmpArray = JSON.stringify(sendArray);
    console.log(tmpArray);
    let sendURL = window.location.origin + "/design-revision/api/";
    data.append("createproject", "");
    data.append("name", projectname);
    data.append("members", tmpArray);
    data.append("file", sendFile);
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.upload.addEventListener("progress", function (event) {
        if (event.lengthComputable) {
            let complete = (event.loaded / event.total * 100 | 0);
            progressBar.style.display = "block";
            percentage.style.display = "block";
            percentage.innerHTML = complete + " %"
        }
    });

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            let message = document.getElementById("sendFeedBack");
            message.style.display = "block";
            //wartet
            setTimeout(function () {
                message.style.display = "none";
                progressBar.style.display = "none";
                percentage.style.display = "none";
                javascript:location.reload(true);
            }, 1000);

            console.log(this.responseText);
        }
    });
    xhr.open("POST", sendURL);
    xhr.send(data);

}

function sendDelet(id) {
    let data = new FormData();
    data.append("id", id);
    console.log(id);
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("DELETE", "http://localhost/design-revision/api/");

    xhr.send(data);

}

//Hello
function sendUpdateProject() {
    let data = new FormData();
    let sendURL = window.location.origin + "/design-revision/api/";
    let progressBar = document.getElementById("loader");
    let percentage = document.getElementById("percentage");
    //Daten in Api sollten auf Member Array und File geändert werden
    data.append("updateproject", "addmember");
    data.append("id", "value");
    data.append("role", "value");

    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        let message = document.getElementById("sendFeedBack");
        message.style.display = "block";
        if (this.readyState === 4) {
            //wartet 6 sekunden
            setTimeout(function () {
                progressBar.style.display = "none";
                message.style.display = "none";
                percentage.style.display = "none";
            }, 1000);
            console.log(this.responseText);
        }
    });
    xhr.upload.addEventListener("progress", function (event) {
        if (event.lengthComputable) {
            let complete = (event.loaded / event.total * 100 | 0);
            progressBar.style.display = "block";
            percentage.style.display = "block";
            percentage.innerHTML = complete + " %";
        }
    });

    xhr.open("PUT", sendURL);
    xhr.send(data);

}

function addMemberWithEmail() {
    let adminOrMember = document.getElementById("AdminOrMember");
    let emailFiled = document.getElementById("email");
    let role = -1;
    let member = "";
    let objMember;
    emailFiled.onblur = function () {
        member = emailFiled.value;
        objMember = {"email": member, "role": role};
        sendArrayFields[0] = objMember;
        console.log(sendArrayFields);
    };
    adminOrMember.onchange = function () {
        let test = adminOrMember.value;
        if (test === "Member") {
            role = 0;
            objMember = {"email": member, "role": role};
            sendArrayFields[0] = objMember;
            console.log(sendArrayFields);
        }
        if (test === "Admin") {
            role = 1;
            objMember = {"email": member, "role": role};
            sendArrayFields[0] = objMember;
            console.log(sendArrayFields);
        }


    };

}

function addEmailField() {
    //limiteirt die Felder
    if (moreMember !== 3) {
        let emailSpan = document.getElementById('emailSpan');
        let childes = emailSpan.childNodes;
        let role = -1;
        let member = "";
        let objMember;
        let emailClone = document.createElement("input");
        emailClone.setAttribute('data-emailFormId', "" + moreMember);
        emailClone.type = "email";
        emailClone.required = true;
        emailClone.placeholder = "E-mail";
        emailClone.style.width = "55%";
        //clont die beiden Elmente;
        let selectClone = childes[3].cloneNode(true);
        selectClone.setAttribute('data-emailFormId', "" + moreMember);
        emailSpan.appendChild(emailClone);
        emailSpan.appendChild(selectClone);
        let remove = document.createElement("b");
        remove.setAttribute('data-emailFormId', "" + moreMember);
        moreMember++;
        remove.innerHTML = " X";
        emailSpan.appendChild(remove);
        remove.onclick = function () {
            let index = this.getAttribute("data-emailFormId");
            sendArrayFields.splice(index, 1);
            emailSpan.removeChild(emailClone);
            emailSpan.removeChild(selectClone);
            emailSpan.removeChild(remove);
            moreMember--;
            console.log(sendArrayFields);

        };
        emailClone.onblur = function () {
            let index = this.getAttribute('data-emailFormId');
            member = emailClone.value;
            objMember = {"email": member, "role": role};
            sendArrayFields[index] = objMember;
            console.log(sendArrayFields);
        };
        selectClone.onchange = function () {
            let index = this.getAttribute('data-emailFormId');
            let test = selectClone.value;
            if (test === "Member") {
                role = 0;
                objMember = {"email": member, "role": role};
                sendArrayFields[index] = objMember;
                console.log(sendArrayFields);
            }
            if (test === "Admin") {
                role = 1;
                objMember = {"email": member, "role": role};
                sendArrayFields[index] = objMember;
                console.log(sendArrayFields);
            }

        };
    }
}

function putArrayTogether() {
    let message = document.getElementById("messageDoubleSelected");
    let messageValid = document.getElementById("messageEmail");
    let messageRole = document.getElementById("messageRole");
    let allRight = true;
    let input = [];
    let input1 = [];
    let helpSendArray = [];
    for (let i = 0; i < sendArray.length; i++) {
        helpSendArray.push(sendArray[i]);
    }
    console.log(helpSendArray);
    //schaut ob sendArray leer ist
    if (sendArray.length < 1) {
        //fügt Member in hilfs Array
        for (let i = 0; i < sendArrayFields.length; i++) {
            input[i] = sendArrayFields[i].email;
        }
        //fügt duplicate von hilfs Array in Array
        let duplicates = input.reduce(function (acc, el, i, arr) {
            if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
            return acc;
        }, []);
        console.log(duplicates);
        //wenn duplicates leer ist wird nie die gleiche E-Mail verwedet
        if (!(duplicates.length < 1)) {
            message.innerHTML = "Zweimal gleiche E-Mail";
            allRight = false;
        } else {
            for (let i = 0; i < sendArrayFields.length; i++) {
                sendArray[i] = sendArrayFields[i];
            }
        }
        for (let i = 0; i < sendArrayFields.length; i++) {
            let valid = emailIsValid(sendArrayFields[i].email);
            if (!valid) {
                messageValid.innerHTML = "Eine Mail ist falsch!";
                allRight = false;
            }
        }
        for (let i = 0; i < sendArrayFields; i++) {
            if (sendArrayFields[i].role === (-1)) {
                messageRole.innerHTML = "Rollen auswählen";
                allRight = false;
            }

        }
    } else {
        for (let i = 0; i < sendArrayFields.length; i++) {
            helpSendArray.push(sendArrayFields[i])
        }
        for (let i = 0; i < helpSendArray.length; i++) {
            input1[i] = helpSendArray[i].email;
        }
        let duplicates = input1.reduce(function (acc, el, i, arr) {
            if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
            return acc;
        }, []);
        //wenn duplicates leer ist wird nie die gleiche E-Mail verwedet
        if (!(duplicates.length < 1)) {
            message.innerHTML = "Zweimal gleiche E-Mail";
            allRight = false;

        }

        for (let i = 0; i < sendArrayFields.length; i++) {
            let valid = emailIsValid(sendArrayFields[i].email);
            if (!valid) {
                messageValid.innerHTML = "Eine Mail ist falsch!";
                allRight = false;
            }
        }
        for (let i = 0; i < sendArrayFields; i++) {
            if (sendArrayFields[i].role === (-1)) {
                messageRole.innerHTML = "Rollen auswählen";
                allRight = false;
            }

        }
    }
    if (allRight) {
        messageRole.innerHTML = "";
        message.innerHTML = "";
    }
    return allRight;

}

function cleraForm() {
    let emailSpan = document.getElementById('email');
    let adminOrMember = document.getElementById("AdminOrMember");
    let projectName = document.getElementById("projectname");
    const previewContainer = document.getElementById("imagePreview");
    const previewFile = previewContainer.querySelector(".image-preview__file");
    const pdfIcon = document.getElementById("pdfIcon");
    const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
    pdfIcon.style.display = "none";
    previewDefaulText.style.display = "block";
    previewFile.innerHTML = "Keine Datei ausgewählt";
    previewFile.style.display = "none";
    projectName.value = "";
    emailSpan.value = "";
    adminOrMember.value = "";
    sendArray = [];
    sendArrayFields = [];
    sendFile = null;
    document.getElementById('inputFile').value = null;
    let content = document.querySelectorAll('[data-emailFormId');
    for (let i = 0; i < content.length; i++) {
        content[i].remove();
    }
    if (!select) {
        addMember();
    }

}
