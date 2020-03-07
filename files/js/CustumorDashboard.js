let a = true;
let counter = 0;
let counterForId = 0;
let counterForUser = 0;
let customerid;
let projectid;
let ableNewProject = true;
let bool1 = false;
let boolstatus;
let select = true;
let doubleClickSelect = true;
let autoComplete = [];
let currentFocus;
let newKeyUp = true;
let sendArray = [];
let sendFile;
let sendArrayFields = [];
let updateOrCreate = true;
let nameLenght = false;
let moreMember = 1;
let tmpClients;
let sendUserEmail = true;
//Variables for getUser method
let nameImgSrc;
let userName;
let userEmail;
let userId;
let userCompany;
let userProjects = [];
let gotUserData = false;
//update Project id
let updateProjectId;
let arrayBefore = [];

function emailIsValid(email) {
    return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

function generate() {
    //Variablen erstellen
    let request = new XMLHttpRequest();
    let request1 = new XMLHttpRequest();
    let boolStatus1;
    let requestURL;
    let b = document.body;
    let arrayMember;
    let arrayRole;
    let gotProject = false;
    let projectsArray = [];
    let requestredy = false;
    let customerSpan = document.createElement("span");
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
    let versionen = document.createElement("a");
    versionen.style.cursor = "pointer";
    versionen.style.textDecoration = "none";
    versionen.style.color = "black";
    versionen.onmouseover = function () {
        versionen.style.color = "lightgray";
    };
    versionen.onmouseout = function () {
        versionen.style.color = "black";
    };
    let company = document.createElement("p");
    let statusDiv = document.createElement("div");
    let textStatus = document.createElement("p");
    let members = document.createElement("b");
    let role = document.createElement("b");
    let includedPorjects = document.createElement("p");
    //custumordiv generieren
    customerdiv.className = "clients";
    customerSpan.appendChild(customerdiv);
    nameimg.setAttribute("alt", "tick");
    nameimg.style.borderRadius = "200px";
    nameimg.style.padding = "40px";
    customerdiv.appendChild(nameimg);
    //statusImg genereiren
    statusImg.setAttribute("alt", "tick");
    statusImg.style.zIndex = "2";
    customerdiv.appendChild(statusImg);
    //Projektname generieren
    customerdiv.appendChild(projektname);
    //schaut ob der User schon abgefragt wurde
    if (gotUserData) {
        clientname.innerHTML = userName;
        clientemail.innerHTML = userEmail;
        company.innerHTML = userCompany;
        nameimg.setAttribute("src", nameImgSrc);

        counter++;
        requestredy = true;
        for (let i = 0; i < userProjects.length; i++) {
            projectsArray.push(userProjects[i]);
        }
        console.log("Took Saved Data");
    } else {
        //Jason user Object aus Api holen
        requestURL = window.location.origin + "/design-revision/api/user/";
        request.open('GET', requestURL, true);
        request.send();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                let userObject = JSON.parse(request.response);
                console.log("xhrRequest");
                userId = userObject.user.id;
                clientname.innerHTML = userObject.user.name;
                nameimg.setAttribute("src", window.location.origin + "/design-revision/api/user/avatar.php?name=" + userObject.user.name);
                clientemail.innerHTML = userObject.user.email;
                company.innerHTML = userObject.user.company;
                if (!(userObject.user.status === "VERIFIED")) {
                    window.location = window.location.origin + "/design-revision/login/login.html?verify=notVerified";
                }
                //Projects-array von Api holen
                let tmp = userObject.user.projects;
                if (tmp === null) {
                    customerdiv.remove();
                    clearInterval(checkForProjects);
                    ableNewProject = false;
                    setTimeout(function () {
                        window.location = window.location.origin + "/design-revision/login/login.html?projects=noProjects";
                    }, 100)

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
                    //Variablen für das Wiederverwenden der Abgefraten Daten
                    for (let i = 0; i < projectsArray.length; i++) {
                        userProjects.push(projectsArray[i]);
                    }
                    userName = clientname.innerHTML;
                    userEmail = clientemail.innerHTML;
                    userCompany = company.innerHTML;
                    nameImgSrc = window.location.origin + "/design-revision/api/user/avatar.php?name=" + userObject.user.name;

                }
                counter++;
                gotUserData = true;

            } else if (request.readyState === 4 && request.status === 403) {
                console.log("Forbidden");
            } else if (request.readyState === 4 && request.status === 401) {
                document.location = window.location.origin + "/design-revision/login/login.html";
            } else if (request.readyState === 4 && request.status === 404) {
                window.alert("Nichts gefunden");
            } else if (request.readyState === 4 && request.status === 400) {
                window.alert("Unbekannter AnfrageParameter");
            }
        };
    }
    let checkForProjects = setInterval(function () {
        if (requestredy) {
            clearInterval(checkForProjects);
            projectid = projectsArray[counterForId];
            let link = window.location.origin + "/design-revision/app/CommentDesign.html?id=" + projectid;
            projektname.href = link;
            versionen.href = window.location.origin + "/design-revision/app/VersionOverview.html?id=" + projectid;
            //customerdiv id geben
            customerdiv.setAttribute('data-id', "" + projectsArray[counterForId]);
            ableNewProject = counterForId < projectsArray.length;
            if (!ableNewProject) {
                customerdiv.remove();
            } else {
                counterForId++;
                requestURL = window.location.origin + "/design-revision/api/project/?id=" + projectid;
                request1.open('GET', requestURL, true);
                request1.send();
                request1.onreadystatechange = function () {
                    //wir bekommen ein Jason Object
                    if (request1.readyState === 4 && request1.status === 200) {
                        let projectObejct = JSON.parse(request1.response);
                        projektname.innerHTML = projectObejct.project.name;
                        let includes = true;
                        if (autoComplete.length === 0) {
                            autoComplete[0] = projectObejct.project.name;
                            includes = false;
                        }
                        for (let i = 0; i < autoComplete.length; i++) {
                            if (autoComplete[i] == projectObejct.project.name) {
                                autoComplete[i] = projectObejct.project.name;
                                includes = false
                            }
                        }
                        if (includes) {
                            autoComplete.push(projectObejct.project.name);
                        }
                        versionen.innerHTML = "Versionen: " + projectObejct.project.version;
                        textStatus.innerHTML = projectObejct.project.status;
                        // changing the Status to German words

                        switch (textStatus.innerHTML) {
                            case "WAITING_FOR_RESPONSE":
                                textStatus.innerHTML = "Warten auf Kundenrückmeldung";
                                break;
                            case "IN_PROGRESS":
                                textStatus.innerHTML = "Wird bearbeitet";
                                break;
                            case "TODO":
                                textStatus.innerHTML = "Zu bearbeiten";
                                break;
                            case "DONE":
                                textStatus.innerHTML = "Fertig/Druckfreigabe";
                                break;
                            default:
                                textStatus.innerHTML = "Unbekannter Status";
                        }
                        //Abfrage für den Status ob der Kunde gelöscht werden kann

                        if (textStatus.innerHTML === "Fertig/Druckfreigabe") {
                            statusImg.setAttribute("src", "https://cdn-design-revision.netlify.com/files/img/XBereit.png");
                            boolStatus1 = true;

                        } else {
                            statusImg.setAttribute("src", "https://cdn-design-revision.netlify.com/files/img/XWarten.png");
                            boolStatus1 = false;
                        }

                        let members1 = projectObejct.project.members;
                        let search = projectObejct.project.name;
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
                        gotProject = true;
                        b.appendChild(customerSpan);
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
    }, 1000);
    let checkForProjectsToCreateMember = setInterval(function () {
        if (requestredy && gotProject) {
            clearInterval(checkForProjectsToCreateMember);
            for (let i = 0; i < arrayMember.length; i++) {
                let request2 = new XMLHttpRequest();
                if (arrayMember[i] != userId) {
                    console.log(JSON.stringify(arrayMember) + "ID=" + projectsArray[counterForUser]);
                    request2.open('GET', window.location.origin + "/design-revision/api/user/?id=" + arrayMember[i] + "&pid=" + projectsArray[counterForUser], true);
                    request2.send();
                    request2.onreadystatechange = function () {
                        if (request2.readyState === 4 && request2.status === 200) {
                            let userObj = JSON.parse(request2.response);
                            let userDiv = document.createElement("div");
                            let userAvatar = document.createElement("IMG");
                            userDiv.appendChild(userAvatar);
                            userDiv.className = "clients";
                            customerSpan.appendChild(userDiv);
                            console.log(userObj.user.name);
                            let userName = document.createElement("p");
                            userName.innerHTML = userObj.user.name;
                            userDiv.appendChild(userName);
                            let userEmail = document.createElement("p");
                            userEmail.innerHTML = userObj.user.email;
                            userDiv.appendChild(userEmail);
                            userAvatar.setAttribute("src", window.location.origin + "/design-revision/api/user/avatar.php?name=" + userObj.user.name);
                            userAvatar.setAttribute("alt", "tick");
                            userAvatar.style.borderRadius = "200px";
                            userAvatar.style.padding = "3px";
                            userAvatar.style.transform = "scale(0.7)";
                            let userCompany = document.createElement("p");
                            userCompany.innerHTML = userObj.user.company;
                            userDiv.appendChild(userCompany);
                            userDiv.setAttribute('data-email', userObj.user.email + arrayMember[i]);
                            userDiv.setAttribute('data-memberId', arrayMember[i]);
                            userDiv.style.display = "none";

                        } else if (request2.readyState === 4 && request2.status === 403) {
                            console.log("Forbidden");
                        } else if (request2.readyState === 4 && request2.status === 401) {
                            document.location = window.location.origin + "/design-revision/login/login.html";
                        } else if (request2.readyState === 4 && request2.status === 404) {
                            window.alert("Nichts gefunden");
                        } else if (request2.readyState === 4 && request2.status === 400) {
                            window.alert("Unbekannter AnfrageParameter");
                        }
                    };
                }
            }
            counterForUser++;

        }
    }, 50);


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
    //Abfrage ob der Kunden gelöscht werden kann

    customerdiv.onclick = function () {
        boolstatus = boolStatus1;
        let content = document.querySelectorAll('[data-memberid');
        let arrayLength = content.length;
        if (select) {
            sendArray = [];
            let mail = document.getElementById('email');
            mail.required = true;
            let AdminOrMember = document.getElementById('AdminOrMember');
            AdminOrMember.required = true;
            for (let i = 0; i < arrayLength; i++) {
                content[i].style.background = "white";
                content[i].style.border = "4px solid black";
            }
            let id1 = clientname.innerHTML + projektname.innerHTML;
            customerdiv.setAttribute("id", id1);
            customerdiv.style.background = "white";
            clientDivClick(customerdiv, clientname.innerHTML, projektname.innerHTML, id1, boolStatus1, arrayMember, arrayRole);
            let btnAddMember = document.getElementById("btnAddMember");
            let projektErsellen = document.getElementById("projektErstellen");
            let projektName = document.getElementById("projectname");
            projektName.required = true;
            projektName.style.visibility = "visible";
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
        if (select) {
            //Disable search in clicked Mode
            document.getElementById('searchform').style.display="none";

            let content = document.querySelectorAll('[data-memberid');
            let helpArray = [];
            boolstatus = boolStatus1;
            let j = 0;
            for (let i = 0; i < content.length; i++) {
                if (arrayMember.includes(content[i].getAttribute("data-memberId"))) {
                    helpArray[j] = content[i].getAttribute("data-email");
                    j++;
                }
            }
            for (let i = 0; i < arrayMember.length; i++) {
                if (content.length > arrayMember[i]) {
                    let mail = helpArray[i];
                    let member = {"email": mail, "role": arrayRole[i]};
                    arrayBefore.push(member);
                    sendArray.push(member);
                }
            }
            console.log(sendArray);
            console.log(arrayBefore);
            let btnAddMember = document.getElementById("btnAddMember");
            updateProjectId = customerdiv.getAttribute('data-id');
            console.log(updateProjectId);
            let mail = document.getElementById('email');
            mail.required = false;
            let AdminOrMember = document.getElementById('AdminOrMember');
            AdminOrMember.required = false;
            let projektErsellen = document.getElementById("projektErstellen");
            let projektName = document.getElementById("projectname");

            let arrayLength = content.length;
            if (doubleClickSelect) {
                for (let i = 0; i < arrayLength; i++) {
                    content[i].style.background = "white";
                    content[i].style.border = "4px solid black";
                    content[i].style.display="none";
                }
                if (a === false) {
                    for (let i = 0; i < arrayLength; i++) {
                        let temp = content[i].lastChild;
                        if (temp.innerHTML === "Ist Admin in dem Gewählten project" || temp.innerHTML === "Ist Mitglied in dem Gewählten project") {
                            temp.style.display = "none";
                        }
                        document.getElementById('loeschen').style.display="none";
                    }
                }

                projektName.required = false;
                projektName.style.visibility = "hidden";
                projektErsellen.innerHTML = "Projekt ändern";
                customerdiv.style.background = "#FFFF99";
                btnAddMember.onclick = function () {
                    changeClientState(arrayMember, arrayRole, customerdiv.getAttribute("data-memberid"));
                    customerdiv.style.background = "#FFFF99";
                };
                updateOrCreate = false;
                doubleClickSelect = false;
                a=false;
                customerdiv.style.border="4px solid black";

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
    let div = document.getElementById(customerid);
    let id = div.getAttribute("data-id");
    sendDelet(id);
    //Daten der Cusomer löschen
    for (let i = 0; i < arrayLength; i++) {
        let help = content[i].getAttribute("data-memberid");
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
function clientDivClick(customerDiv, name1, projekt1, id1, boolStatus, members, role) {
    let loeschen = document.getElementById("loeschen");
    let content = document.querySelectorAll('[data-memberId');
    let arrayLength = content.length;
    let help;
    if (a) {
        //Display the required User
        let userDivs = customerDiv.parentElement;
        userDivs = userDivs.childNodes;
        for (let i = 1; i < userDivs.length; i++) {
            userDivs[i].style.display = "block";
        }
        //Disable search in clicked Mode
        document.getElementById('searchform').style.display="none";
        tmpClients = members;
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
            loeschen.style.display="block";
            loeschen.onclick = function () {
                customerDelate(members, content, arrayLength);
            };
            customerdiv1.style.border = "4px solid red";
        } else {
            customerdiv1.style.background = "#0cfad6";
            loeschen.style.display = "none";
        }
        a = false;

    } else {
        //Enable search in clicked Mode
        document.getElementById('searchform').style.display="block";
        let customerdiv1 = document.getElementById(customerid);
        customerdiv1.style.background = "white";
        customerdiv1.style.border = "4px solid black";
        a=true;
        if(boolstatus){
            loeschen.style.display="none";
        }
        for (let i = 0; i < arrayLength; i++) {
            help = content[i].getAttribute("data-memberId");
            if (tmpClients.includes(help)) {
                content[i].style.background = "white";
                content[i].lastChild.style.display = "none";

            }
        }
        //Hide the required Userers from the Project
        for (let i = 0; i < content.length; i++) {
            let help = content[i].lastElementChild;
            content[i].style.display = "none";
            if(help.innerHTML==="Ist Mitglied in dem Gewählten project"||help.innerHTML==="Ist Admin in dem Gewählten project"){
                help.remove();
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
    //needed to replace invalid characters
    value = value.replace(/[|&;$%@"<>()+,]/g, "");
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
        //needed to replace invalid characters
        help = help.replace(/[|&;$%@"<>()+,]/g, "");
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
    autocomplete(document.getElementById("searchform"), autoComplete)
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
                let spacing = document.createElement('div');
                spacing.style.height="400px";
                document.body.appendChild(spacing);
            }

        }, 200);


        addMemberWithEmail();
        let projectName = document.getElementById("projectname");
        projectName.addEventListener("keyup", function () {
            let feedback = document.getElementById("nameToLong");
            console.log(projectName.value.length);
            if (projectName.value.length >= 80) {
                feedback.style.color = "red";
                feedback.innerHTML = "<strong>Name zu lang!</strong>";
                nameLenght = true;
            } else {
                let str = projectName.value;
                if (str.length > 0) {
                    if (str.match(/[a-zäöü]+/) || str.match(/[[A-ZÄÖU]+/)) {
                        feedback.innerHTML = "";
                        nameLenght = false;
                    } else {
                        feedback.style.color = "red";
                        feedback.innerHTML = "<strong>Der Name muss mindestens einen Buchstaben enthalten! </strong>";
                        nameLenght = true;

                    }
                } else {
                    feedback.innerHTML = "";
                    nameLenght = false;
                }
            }
        });

        let CustumorDashForm = document.getElementById("CustumorDashForm");
        CustumorDashForm.addEventListener('submit', function (evt) {
            let replace = false;
            if (nameLenght) {
                //do nothing
            } else {

                let allRight = putArrayTogether();
                if (allRight) {
                    if (updateOrCreate) {
                        if (sendFile === undefined) {
                            const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
                            const previewFile = previewContainer.querySelector(".image-preview__file");
                            previewDefaulText.style.display = "block";
                            previewFile.style.display = "none";
                            previewDefaulText.style.color = "red";
                        } else {
                            sendNewProject();
                        }
                    } else {
                        sendUpdateProject();
                        replace = true;
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
    // i needed to use the on click method to get get ride of the current File because Firexfox does not fire change event when  cancle in data-explore
    inputFile.addEventListener('click', function () {
        pdfIcon.style.display = "none";
        previewDefaulText.style.display = "block";
        previewDefaulText.style.color = "#cccccc";
        previewFile.innerHTML = "Keine Datei ausgewählt";
        previewFile.style.display = "none";
        sendFile = undefined;
    });
    inputFile.addEventListener("change", function () {
        const file = this.files[0];
        console.log(file);
        previewFile.style.fontSize = "12px";
        if (file) {
            if (file.type === "application/pdf") {
                const date = new Date(file.lastModified);
                sendFile = file;
                pdfIcon.style.display = "block";
                previewDefaulText.style.display = "none";
                previewFile.style.display = "block";
                previewFile.style.color = "black";
                previewFile.style.fontSize = "12px";
                previewFile.innerHTML = file.name + " - " + file.size + " bytes,zuletzt Bearbeitet: " + date.toDateString();

            } else {
                previewFile.style.fontSize = "16px";
                previewFile.innerHTML = "Bitte PDF hinzufügen!";
                previewFile.style.color = "#cccccc";
                previewFile.style.display = "block";
                previewDefaulText.style.display = "none";
                pdfIcon.style.display = "none";
                sendFile = undefined;
            }
        } else {
            pdfIcon.style.display = "none";
            previewDefaulText.style.display = "block";
            previewDefaulText.style.color = "#cccccc";
            previewFile.innerHTML = "Keine Datei ausgewählt";
            previewFile.style.display = "none";
            sendFile = undefined;
        }
    }, false);
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
        const date = new Date(f.lastModified);
        let output = f.name + " - " + f.size + " bytes, zuletzt Bearbeitet: " + date.toDateString();
        pdfIcon.style.display = "block";
        previewFile.innerHTML = output;
        previewDefaulText.style.display = "none";
        previewFile.style.display = "block";
        previewFile.style.color = "black";
        previewFile.style.fontSize = "12px";
    } else {
        sendFile = undefined;
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
    let projecst = document.querySelectorAll('[data-id');
    let arrayLength = content.length;
    let addButton = document.getElementById("btnAddMember");
    let jasonmembers = [];
    let userIDs = [];

    if (select) {
        if (a === false) {
            document.getElementById("loeschen").style.display="none";
            for (let i = 0; i < arrayLength; i++) {
                let temp = content[i].lastChild;
                if (temp.innerHTML === "Ist Admin in dem Gewählten project" || temp.innerHTML === "Ist Mitglied in dem Gewählten project") {
                    temp.style.display = "none";
                }
            }
            a = true;
        }
        addButton.value = "Zu Projekt hinzufügen";
        for (let i = 0; i < projecst.length; i++) {
            projecst[i].style.display = "none";
        }
        for (let i = 0; i < arrayLength; i++) {
            if (!(userIDs.includes(content[i].getAttribute('data-memberId')))) {
                userIDs[i] = content[i].getAttribute('data-memberId');
                content[i].style.display = "block";
            content[i].style.display = "block";
            content[i].style.background = "white";
            let buttonAdmin = document.createElement("button");
            buttonAdmin.innerHTML = "Admin";
            //Button Click event
            buttonAdmin.addEventListener('click', function () {
                let parent = buttonAdmin.parentNode;
                let email = parent.getAttribute("data-email");
                let role = 1;
                let include = true;
                //sorgt für Dynamische Buttons
                buttonMember.style.display = "inline";
                buttonAdmin.style.display = "none";
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {

                    if (jasonmembers[j].email == email) {
                        jasonmembers[j].role = 1;
                        include = false;
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
                //sorgt für Dynamische Buttons
                buttonMember.style.display = "none";
                buttonAdmin.style.display = "inline";
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {

                    if (jasonmembers[j].email == email) {
                        jasonmembers[j].role = 0;
                        include = false;
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
                //sorgt für Dynamische Buttons
                buttonMember.style.display = "inline";
                buttonAdmin.style.display = "none";
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
            //sorgt für Dynamische Buttons
            buttonMember.style.display = "inline";
            buttonAdmin.style.display = "none";

            } else {
                content[i].style.display = "none";
            }
        }
    } else {
        console.log(sendArray);
        addButton.value = "Member auswählen";
        select = true;
        if(boolstatus&&!a){
        document.getElementById("loeschen").style.display="inline";
        }
        for (let i = 0; i < arrayLength; i++) {
            content[i].style.background = "white";
            if (!(userIDs.includes(content[i].getAttribute('data-memberId')))) {
                userIDs[i] = content[i].getAttribute('data-memberId');
                content[i].lastChild.remove();
                content[i].lastChild.remove();
                content[i].lastChild.remove();
            }
            content[i].style.display = "none";

        }
        for (let i = 0; i < projecst.length; i++) {
            projecst[i].style.display = "block";
            projecst[i].style.border="4px solid black"
        }
    }
}

function changeClientState(members, role, id) {
    let content = document.querySelectorAll('[data-memberId');
    let projects = document.querySelectorAll('[data-Id');
    let arrayLength = content.length;
    let addButton = document.getElementById("btnAddMember");
    let jasonmembers = [];
    let helpArray = [];
    let userIDs = [];
    if (select) {
        for (let i = 0; i < projects.length; i++) {
            projects[i].style.display = "none";
        }
        for (let i = 0; i < arrayLength; i++) {
            if (!(userIDs.includes(content[i].getAttribute('data-memberId')))) {
                let temp = content[i].lastChild;
                if (temp.innerHTML === "Ist Admin in dem Gewählten project" || temp.innerHTML === "Ist Mitglied in dem Gewählten project") {
                    temp.style.display = "none";


                }
                userIDs[i] = content[i].getAttribute('data-memberId');
                content[i].style.display = "block";
            }

        }
        //löschen nachricht verstecken
        let delet = document.getElementById("form1");
        //messageMember verstecken

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
        let j = 0;
        for (let i = 0; i < content.length; i++) {
            if (members.includes(content[i].getAttribute("data-memberId"))) {
                helpArray[j] = content[i].getAttribute("data-email");
                j++;
            }
        }

        for (let i = 0; i < members.length; i++) {
            if (content.length > members[i]) {
                let mail = helpArray[i];
                let member = {"email": mail, "role": role[i]};
                jasonmembers.push(member);
            }
        }
        addButton.value = "Zu Projekt hinzufügen";
        for (let i = 0; i < arrayLength; i++) {
            let buttonAdmin = document.createElement("button");
            let buttonMember = document.createElement("button");
            //Button Click event
            buttonAdmin.addEventListener('click', function () {
                let parent = buttonAdmin.parentNode;
                let email = parent.getAttribute("data-email");
                let role = 1;
                let include = true;
                //sorgt für Dynamische Buttons
                if (!(members.includes(parent.getAttribute('data-memberid')))) {
                    buttonMember.style.display = "inline";
                    buttonAdmin.style.display = "none";
                }
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {

                    if (jasonmembers[j].email == email) {
                        jasonmembers[j].role = 1;
                        include = false;
                    }

                }
                console.log("includes " + include);
                if (include) {
                    let member = {"email": email, "role": role};
                    jasonmembers.push(member);
                }
                jasonmembers.sort();
                console.log(jasonmembers);
                sendArray = jasonmembers;
                parent.style.background = "#FFA500";
            });
            buttonAdmin.innerHTML = "Admin";
            content[i].appendChild(buttonAdmin);
            //Butto Click event
            buttonMember.addEventListener('click', function () {
                let parent = buttonMember.parentNode;
                let email = parent.getAttribute("data-email");
                let role = "0";
                let include = true;
                //sorgt für Dynamische Buttons
                if (!(members.includes(parent.getAttribute('data-memberid')))) {
                    buttonMember.style.display = "none";
                    buttonAdmin.style.display = "inline";
                }
                //Schauen ob es den Member schon gibt un Rolle anpassen
                for (let j = 0; j < jasonmembers.length; j++) {
                    if (jasonmembers[j].email == email) {

                        jasonmembers[j].role = 0;
                        include = false;
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

                //sorgt für Dynamische Buttons und schaut ob das Mitglied schon im Projekt ist
                if (!(members.includes(parent.getAttribute('data-memberid')))) {
                    buttonMember.style.display = "inline";
                    buttonAdmin.style.display = "none";
                } else {
                    let help1 = members.indexOf(parent.getAttribute('data-memberid'));
                    if (role[help1] == 0) {
                        buttonMember.style.display = "inline";
                    }
                    if (role[help1] == 1) {
                        buttonAdmin.style.display = "inline";
                    }
                }

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
            console.log(content[i].style.backgroundColor);
            //schaut ob der Account schon im Projekt ist
            if (content[i].style.backgroundColor === "rgb(0, 255, 102)") {
                buttonMember.style.display = "inline";
                buttonAdmin.style.display = "none";
            } else if (content[i].style.backgroundColor === "rgb(255, 165, 0)") {
                buttonMember.style.display = "none";
                buttonAdmin.style.display = "inline";
            } else {
                buttonMember.style.display = "inline";
                buttonAdmin.style.display = "none";
            }
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
            content[i].lastChild.remove();
            content[i].lastChild.remove();
            content[i].lastChild.remove();
            content[i].style.display = "none";

        }
        for (let i = 0; i < projects.length; i++) {
            projects[i].style.display = "block";
        }
    }


}

function sendNewProject() {
    let data = new FormData();
    let projectname = document.getElementById("projectname").value;
    let progressBar = document.getElementById("loader");
    let percentage = document.getElementById("percentage");
    let tmpArray = JSON.stringify(sendArray);
    console.log(projectname);
    console.log(tmpArray);
    let sendURL = window.location.origin + "/design-revision/api/project/create";
    data.append("createproject", "");
    data.append("name", projectname);
    console.log(projectname);
    data.append("members", tmpArray);
    data.append("file", sendFile, sendFile.name);
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.upload.addEventListener("progress", function (event) {
        update_progress(event, data)
    });
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status === 201) {
            showmes("info", "Projekt erfolgreich erstellt");
            console.log(this.responseText);

        } else if (this.readyState === 4) {
            showmes("error", "Projekt konnte nicht erstellt werden");
        }
        //wartet
        setTimeout(function () {
            progressBar.style.display = "none";
            percentage.style.display = "none";
            //location.reload(true);
        }, 2000);
    });
    xhr.open("POST", sendURL);
    xhr.send(data);

}

function sendDelet(id) {
    let data = "id=" + id;
    console.log(id);
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status === 204) {
            showmes("info", "Projekt erfolgreich gelöscht");
            console.log(this.responseText);


        } else if (this.readyState === 4) {
            showmes("error", "Projekt konnte nicht gelöscht werden");
        }
    });

    xhr.open("DELETE", window.location.origin + "/design-revision/api/project/delete");

    xhr.send(data);

}

function sendUpdateProject() {
    let progressBar = document.getElementById("loader");
    let percentage = document.getElementById("percentage");
    let tmpArray = JSON.stringify(sendArray);
    let tmpArray1 = JSON.stringify(arrayBefore);
    console.log(sendArray);
    console.log(arrayBefore);
    let b = true;
    if (sendUserEmail) {
        $.each(JSON.parse(tmpArray), function (key, value) {
            if (!(tmpArray1.indexOf(value.email) > -1)) {
                addProjectMember(updateProjectId, value.email, value.role);
                b = false;
            }
        });

        $.each(JSON.parse(tmpArray1), function (key, value) {
            if (tmpArray.indexOf(value.email) === -1) {
                removeProjectMember(updateProjectId, value.email, value.role);
                b = false;
            }
        });
    }
    if (sendFile === undefined) {
        if (b) {
            const previewContainer = document.getElementById("imagePreview");
            const previewDefaulText = previewContainer.querySelector(".image-preview__default-text");
            const previewFile = previewContainer.querySelector(".image-preview__file");
            previewDefaulText.style.display = "block";
            previewDefaulText.style.color = "red";
            previewFile.innerHTML = "Bitte PDF hinzufügen";
            previewFile.style.display = "none";
            console.log("Hello");
            setTimeout(function () {
                if (sendFile === undefined) {
                    previewDefaulText.style.display = "block";
                    previewDefaulText.style.color = "#cccccc";
                    previewFile.innerHTML = "Keine Datei ausgewählt";
                    previewFile.style.display = "none";

                }
            }, 4000);
        }
    } else {
        //Senden der File
        let dataFile = new FormData();
        dataFile.append("id", updateProjectId);
        dataFile.append("file", sendFile, sendFile.name);
        let xhrFile = new XMLHttpRequest();
        xhrFile.withCredentials = true;
        xhrFile.upload.addEventListener("progress", function (event) {
            update_progress(event, dataFile)
        });
        xhrFile.addEventListener("readystatechange", function () {

            if (this.readyState === 4 && this.status === 200) {
                showmes("info", "Datei wurde hochgeladen");
                console.log(this.responseText);

            } else if (this.readyState === 4) {
                showmes("error", "Datei konnte nicht hochgeladen werden");
            }
            setTimeout(function () {
                progressBar.style.display = "none";
                percentage.style.display = "none";
                //location.reload(true);
            }, 2000);
        });
        xhrFile.open("PUT", window.location.origin + "/design-revision/api/project/updatefile");
        xhrFile.send(dataFile);
    }

}

function addProjectMember(projectId, memberMail, memberRole) {
    let member = {"email": memberMail, "role": memberRole};
    let tmpMember = JSON.stringify(member);
    console.log("Add:" + tmpMember);
    //used raw Data else it did not work
    let data = "id=" + projectId + "&member=" + tmpMember;
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        let message = document.getElementById('AddOrDelete');
        if (this.readyState === 4 && this.status === 200) {
            message.style.display = "block";
            message.innerHTML = "Member wurde hinzugefügt";
            message.style.color = "black";
        } else if (this.readyState === 4) {
            message.style.display = "block";
            message.innerHTML = "Member konnte nicht hinzugefügt werden";
            message.style.color = "red";
        }
        setTimeout(function () {
            message.style.display = "none";
            message.innerHTML = "";
        }, 4000);
        console.log(this.responseText);
    });

    xhr.open("PUT", window.location.origin + "/design-revision/api/project/addmember");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(data);

}

function removeProjectMember(projectId, memberMail, memberRole) {
    let member = {"email": memberMail, "role": memberRole};
    let tmpMember = JSON.stringify(member);
    console.log("Remove:" + tmpMember);
    let memberID;
    //holt mithilfe der E_Mail die Id des Members
    let content = document.querySelectorAll('[data-email');
    for (let i = 0; i < content.length; i++) {
        if (content[i].getAttribute('data-email') === memberMail) {
            memberID = content[i].getAttribute('data-memberId');
        }
    }
    console.log(memberID);
    let data = "id=" + projectId + "&member=" + memberID;
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        let message = document.getElementById('AddOrDelete');
        if (this.readyState === 4 && this.status === 200) {
            message.style.display = "block";
            message.innerHTML = "Member wurde gelöscht"
            message.style.color = "black";
        } else if (this.readyState === 4) {
            message.style.display = "block";
            message.innerHTML = "Membr konnte nicht gelöscht werden";
            message.style.color = "red";
        }
        setTimeout(function () {
            message.style.display = "none";
            message.innerHTML = "";
        }, 4000);
        console.log(this.responseText);
    });
    xhr.open("PUT", window.location.origin + "/design-revision/api/project/removemember");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.send(data);

}

function getDataSize(data) {
    let fd = data;
    let size = 0;
    for (let pair of fd.entries()) {
        if (pair[1] instanceof Blob)
            size += pair[1].size;
        else
            size += pair[1].length;
    }
    return (size);

}

function update_progress(event, data) {
    let progressBar = document.getElementById("loader");
    progressBar.style.display = "block";
    let size = getDataSize(data);
    if (event.lengthComputable) {
        //there is no better way to get the process ov the upload than by detection the size of the dataForm
        let percentage1 = document.getElementById("percentage");
        let percentage = Math.floor((event.loaded / size) * 100);
        console.log("percent " + percentage + '%');
        percentage1.style.display = "block";
        percentage1.innerHTML = percentage + " %";
    } else {
        console.log("Unable to compute progress information since the total size is unknown");
    }
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
        let remove = document.createElement("i");
        remove.setAttribute('data-emailFormId', "" + moreMember);
        moreMember++;
        remove.setAttribute('class', 'material-icons');
        remove.innerHTML = "delete_forever";
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
            message.style.color = "red";
            message.innerHTML = "Zweimal gleiche E-Mail";
            allRight = false;
        } else {
            for (let i = 0; i < sendArrayFields.length; i++) {
                sendArray[i] = sendArrayFields[i];
            }
        }
        let aNull = true;
        for (let i = 0; i < sendArray.length; i++) {
            if (sendArray[i].email === "" || sendArray[i].email === undefined) {
                aNull = false;
                sendUserEmail = false;
            }
        }
        if (aNull) {
            sendUserEmail = true;
            for (let i = 0; i < sendArrayFields.length; i++) {
                let valid = emailIsValid(sendArrayFields[i].email);
                if (!valid) {
                    messageValid.style.color = "red";
                    messageValid.innerHTML = "Eine Mail ist falsch!";
                    allRight = false;
                }
            }
            for (let i = 0; i < sendArrayFields.length; i++) {
                if (sendArrayFields[i].role == (-1)) {
                    messageRole.innerHTML = "Rollen auswählen";
                    allRight = false;
                }

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
            message.style.color = "red";
            message.innerHTML = "Zweimal gleiche E-Mail";
            allRight = false;

        }
        let aNull = true;
        for (let i = 0; i < sendArray.length; i++) {
            if (sendArray[i].email === "" || sendArray[i].email === undefined) {
                aNull = false;
                sendUserEmail = false;
            }
        }
        if (aNull) {
            sendUserEmail = true;
            for (let i = 0; i < sendArrayFields.length; i++) {
                let valid = emailIsValid(sendArrayFields[i].email);
                if (!valid) {
                    messageValid.style.color = "red";
                    messageValid.innerHTML = "Eine Mail ist falsch!";
                    allRight = false;
                }
            }
            for (let i = 0; i < sendArrayFields.length; i++) {
                if (sendArrayFields[i].role == (-1)) {
                    messageRole.style.color = "red";
                    messageRole.innerHTML = "Rollen auswählen";
                    allRight = false;
                }

            }
        }
        sendArray = helpSendArray;
    }
    //Löscht die Nachrichten an den User nach 10 Sekunden
    setTimeout(function () {
        messageValid.innerHTML = "";
        messageRole.innerHTML = "";
        message.innerHTML = "";
    }, 10000);
    if (allRight) {
        messageValid.innerHTML = "";
        messageRole.innerHTML = "";
        message.innerHTML = "";
    }

    console.log("Field:" + JSON.stringify(sendArrayFields));
    console.log("Send:" + JSON.stringify(sendArray));
    console.log(allRight);
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
    previewFile.style.color = "black";
    previewFile.innerHTML = "Keine Datei ausgewählt";
    previewFile.style.display = "none";
    projectName.value = "";
    emailSpan.value = "";
    adminOrMember.value = "";
    sendArray = [];
    sendArrayFields = [];
    sendFile = undefined;
    document.getElementById('inputFile').value = null;
    let content = document.querySelectorAll('[data-emailFormId');
    for (let i = 0; i < content.length; i++) {
        content[i].remove();
    }
    if (!select) {
        addMember();
    }

}

function autocomplete(inp, arr) {
    inp.addEventListener("input", function (e) {
        let a, b, i, val = this.value;
        //schließt die Liste
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        //erstellt ein div welches die inhalte des Array anzeigt sobald sie auf das value von dem inpuz passen
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                //buchstaben die auf das Wort passen sind fett
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                b.addEventListener("click", function (e) {
                    //füllt den inhalt des divs in den input bei mausClick
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    inp.addEventListener("keydown", function (e) {
        if (newKeyUp) {
            newKeyUp = false;
            //abfrage damit die Tasten nicht mehrmal ausgeführt werden obwohl nur ein mal gedrückt wird
            setTimeout(function () {
                newKeyUp = true;
            }, 200);
            let x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            //wenn Pfeil nach unten gedrückt wird
            if (e.keyCode === 40) {
                currentFocus++;
                addActive(x);
                //wenn Pfeil nach oben gedrückt wird
            } else if (e.keyCode === 38) {
                currentFocus--;
                addActive(x);
                //wenn Enter gedrückt wird
            } else if (e.keyCode === 13) {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        console.log(currentFocus);
        x[currentFocus].classList.add("autocomplete-active");
        console.log(x[currentFocus]);
    }

    function removeActive(x) {
        for (let i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }

    }

    function closeAllLists(elmnt) {
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}