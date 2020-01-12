let a = true;
let counter = 0;
let customerid;
let bool1 = false;
let boolStatus;
let select = true;
let doubleClickSelect = true;
let sendArray = [];
let sendFile;
let updateOrCreate = true;
let nameLenght=false;


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
    statusImg.style.zIndex = "2";
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

    //zum test != sonst ===
    if (textStatus.innerHTML != "Fertig/Druckfreigabe") {
        statusImg.setAttribute("src", "../files/img/XBereit.png");
        boolStatus = true;
    } else {
        statusImg.setAttribute("src", "../files/img/XWarten.png");
        boolStatus = false;
    }
    //Abfrage ob der Kunden gelöscht werden kann

    customerdiv.onclick = function () {
        if (select) {
            let id1 = clientname.innerHTML + projektname.innerHTML;
            customerdiv.setAttribute("id", id1);
            customerdiv.style.background="white";
            clientDivClick(clientname.innerHTML, projektname.innerHTML, id1, boolStatus, arrayMember, arrayRole);
            let btnAddMember = document.getElementById("btnAddMember");
            let projektErsellen = document.getElementById("projektErstellen");
            let projektName = document.getElementById("projectname");
            projektName.required = true;
            projektName.style.display = "block";
            projektErsellen.innerHTML = "Erstellen Projekt ";
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
        let content = document.querySelectorAll('[data-id');
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
                if(boolStatus) {
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
                    changeClientState(arrayMember, arrayRole);
                    customerdiv.style.background = "#FFFF99";
                };
                updateOrCreate = false;
                doubleClickSelect = false;
                a=false;
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
            divForm.lastChild.style.display="none";
        }
        let customerdiv1 = document.getElementById(customerid);
        customerdiv1.style.background = "white";
        customerdiv1.style.border = "4px solid black";
        a = true;
        for (let i = 0; i < arrayLength; i++) {
            help = content[i].getAttribute("data-id");
            if (members.includes(help)) {
                content[i].style.background = "white";
                content[i].lastChild.style.display="none";

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
            let projectName = document.getElementById("projectname");
            projectName.addEventListener("keyup",function () {
            let feedback= document.getElementById("nameToLong");
            console.log(projectName.value.length);
            if(projectName.value.length>=80){
                feedback.style.color = "red";
                feedback.style.paddingLeft="100px";
                feedback.innerHTML = "<strong>Name zu lang!</strong>"
                nameLenght=true;
            }else {
                feedback.innerHTML="";
                nameLenght=false;
            }
        });

        let CustumorDashForm = document.getElementById("CustumorDashForm");
        CustumorDashForm.addEventListener('submit', function (evt) {
            if (sendFile === undefined || sendArray[0] === undefined) {
                console.log(Error);
            } else {
                if (updateOrCreate) {
                    sendNewProject();
                } else {
                    sendUpdateProject()
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
    previewFile.onclick = function () {
        pdfIcon.style.display = "none";
        previewDefaulText.style.display = "block";
        previewFile.style.display = "none";
    };
    pdfIcon.onclick = function () {
        pdfIcon.style.display = "none";
        previewDefaulText.style.display = "block";
        previewFile.style.display = "none";
    };
    const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
    previewContainer.addEventListener('dragover', handleDragOver, false);
    previewContainer.addEventListener('drop', dateiauswahl, false);

    inputFile.addEventListener("change", function () {
        const file = this.files[0];
        sendFile = file;
        console.log(file);
        if (file) {
            pdfIcon.style.display = "block";
            previewDefaulText.style.display = "none";
            previewFile.style.display = "block";
            previewFile.style.color = "black";
            previewFile.style.fontSize = "12px";
            previewFile.innerHTML = file.name + " (" + file.type + ")- " + file.size + " bytes,zuletzt Bearbeitet " + file.lastModifiedDate;
        } else {
            pdfIcon.style.display = "none";
            previewDefaulText.style.display = "block";
            previewFile.style.display = "none";
        }
    });
}, 10);

//Drag and Drop
function dateiauswahl(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    let file = evt.dataTransfer.files;
    let f = file[0];
    sendFile = f;
    let output = f.name + " (" + f.type + ")- " + f.size + " bytes,zuletzt Bearbeitet " + f.lastModifiedDate;
    const previewContainer = document.getElementById("imagePreview");
    const previewFile = previewContainer.querySelector(".image-preview__file");
    const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
    const pdfIcon = document.getElementById("pdfIcon");
    pdfIcon.style.display = "block";
    previewFile.innerHTML = output;
    previewDefaulText.style.display = "none";
    previewFile.style.display = "block";
    previewFile.style.color = "black";
    previewFile.style.fontSize = "12px";
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

function addMember() {
    let content = document.querySelectorAll('[data-id');
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
                let id = parent.getAttribute("data-id");
                let role = 1;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[i].id === id) {
                            jasonmembers[i].role = 1;
                            include = false;
                        }
                    }
                }
                if (include) {
                    let member = {"id": id, "role": role};
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
                let id = parent.getAttribute("data-id");
                let role = 0;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[i].id === id) {
                            jasonmembers[i].role = 0;
                            include = false;
                        }
                    }
                }

                if (include) {
                    let member = {"id": id, "role": role};
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
                let id = parent.getAttribute("data-id");
                for (let k in jasonmembers) {
                    if (jasonmembers.hasOwnProperty(k)) {
                        if (jasonmembers[k].id == id) {
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

function changeClientState(members, role) {
    let content = document.querySelectorAll('[data-id');
    let arrayLength = content.length;
    let addButton = document.getElementById("btnAddMember");
    let jasonmembers = [];
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
            if(boolStatus)
            delet.lastChild.style.display = "none";
            a = true;
        }
        for (let i = 0; i < arrayLength; i++) {
            let help = content[i].getAttribute("data-id");
            if (members.includes(help)) {
                let help1 = members.indexOf(help);
                if (role[help1] == 0) {
                    content[i].style.background = "#00FF66";
                    console.log("Yes");
                }
                if (role[help1] == 1) {
                    content[i].style.background = "#FFA500";
                    console.log("2*Yes")
                }
            }
        }
        for (let i = 0; i < members.length; i++) {
            let member = {"id": members[i], "role": role[i]};
            jasonmembers.push(member);
            console.log(jasonmembers);
        }
        addButton.value = "Zu Projekt hinzufügen";
        for (let i = 0; i < arrayLength; i++) {
            let buttonAdmin = document.createElement("button");
            buttonAdmin.innerHTML = "Admin";
            //Button Click event
            buttonAdmin.addEventListener('click', function () {
                let parent = buttonAdmin.parentNode;
                let id = parent.getAttribute("data-id");
                let role = 1;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[i].id === id) {
                            jasonmembers[i].role = 1;
                            include = false;
                        }
                    }
                }
                if (include) {
                    let member = {"id": id, "role": role};
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
                let id = parent.getAttribute("data-id");
                let role = 0;
                let include = true;
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[i]) {
                        if (jasonmembers[i].id === id) {
                            jasonmembers[i].role = 0;
                            include = false;
                        }
                    }
                }

                if (include) {
                    let member = {"id": id, "role": role};
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
                let id = parent.getAttribute("data-id");
                for (let k in jasonmembers) {
                    if (jasonmembers.hasOwnProperty(k)) {
                        if (jasonmembers[k].id == id) {
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
            select = false;
        }
    } else {
        console.log(sendArray);
        addButton.value = "Member auswählen";
        select = true;
        for (let i = 0; i < arrayLength; i++) {
            content[i].style.background = "white";
            content[i].style.border="4px solid black";
            content[i].lastChild.remove();
            content[i].lastChild.remove();
            content[i].lastChild.remove();
        }
    }


}

function sendNewProject() {
    let data = new FormData();
    let projectname = document.getElementById("projectname").value;
    data.append("createproject", "");
    data.append("name", projectname);
    data.append("members", sendArray);
    data.append("file", sendFile);

    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });
    xhr.open("POST", "http://localhost/design-revision/api/");
    xhr.send(data);

}

function sendDelet(id) {
    let data = new FormData();
    data.append("id", id);

    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("DELETE", "http://localhost/design-revision/api/");

    xhr.send(data);

}

function sendUpdateProject() {
    let data = new FormData();
    //Daten in Api sollten auf Member Array und File geändert werden
    data.append("updateproject", "addmember");
    data.append("id", "value");
    data.append("role", "value");

    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("PUT", "http://localhost/design-revision/api/");

    xhr.send(data);

}
