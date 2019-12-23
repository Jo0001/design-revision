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
        statusImg.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAfCAIAAAB/DupQAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAJGSURBVEhLjZW9SxxRFMXnz7KQgIWFiOiOxs3u6iIqbKGFYoiIiwga8QNFCwW1UGwUFrQJImIgCYJFIiKChYVIioCkEUTwo1jPep937tx583YOh2Fn5tzfzLvvzVuvHKN//+/ML6ccMTv65Pz6Q/fC+u6xOY+RO2ZBU0FN5yzsoFeNafS3XxdcQN79fmbuCUkuOUoPocGVaTaum8SbolyyogdoyfVzY3t+G458hemnl3+Z25CbKPnpfHaEY5Ju0Ip7kEr9aGnCUdGvbm7rC0t0Ci4ej9hRS3NPZphjE2v7xKygrVyyojO3vmOSuOy+T0McI7rn4JIVHa7rmNr2MyoGFzJfODOzcejJMcbV4AUx/OQZTAamutKQ5PS4uxiZ4ppeJ6fHcWXHfv65Imaw+JLQo1ZcXqNQgIasa8thBxcKoSH5pbnpbi6k0dDhySUXNOXG8UUoKDmbHeVYou3p/uExX9ykgtrO6bXWvCKyMRmYEkqijWimQbwrhJZceKWtS+GUJb2xf1n9LQRoxZ3/2KtAVkt6anBV0g06Idfa9y0/i9ZF6RX00/PLwFypKhcbEPZPKx1TEqV7ivu1vaDKyLyxJad7WDd0DmM9qQKy3DDhOPrn9ABnhhf39FsX032qQHHJUTraGNwtbmLyLL3Gw7lAbfByiJIe5ZppJDoq+TaIKMAI+AoGSMko3cqFgnUNSbrcHzAmPNuEwnQZk1wohIYknay4JEknKy6k0ZCkW7mkqjELGqIyB5fkjtnR0M7BbzeXFBsrl18BIcnf2PEdJAEAAAAASUVORK5CYII=")
        boolStatus = true;
    } else {
        statusImg.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAfCAIAAAB/DupQAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAJHSURBVEhLjdXPS1RRFAfw91+FUCJSiyRE3LiI6JeGjuEkTkNN6OikZvlzhBaii1y5EglmU0EFQbiRYBaFi6AgXOiqIEgRxu90juedd+59d96Xy+Cbd+7nvftjrlEjJQdHv/mvYAJlfvpz/celgZfrO7t8nZJwmYemDhduraIF9JZllq59+iodqG2/r/M9Fe1Sc/UEDVdXS8P3XPE/rkvN6DGt3Sv3lotPpvAp34i+9+2XuB39K4VS5drQopRpnWnjlsYny+UyPo2+//Pwcm6NLuHi8Sgbn5jszi1IWWXjHZlN2utSjC5u+112Jb3356WM9CjgUoyOdvFOdfRxhW+r9AzH7/5880Okx5jWBy+I4WevwWJgqZsTkl1Pu4uRGZfnOrue5uoZ+7j3ncx482XR3RhX9igS04h3bwUScJEEjehfWlgPu4ilkbe7+9Khc2AZvwjGkrk6uCRlmY6nP3//3ZjYog5tt6u54jRLTrAYWBKqxDRiMpk4T4LWLtrgwxlmUqL1rvyG+bcQ08btH5tlIBit9xReaZ3pjK533vOPnmLqXL1JH5+cPlh83dLFAYTz06tjSVw9Mu7N0WdcnowcbNn1CPuGrtGwn7gwGX1goqXpfSMvpKa4WrNvfT0/x4XnMS41V8c0yl0sGxbPM9d4OJc7B7weotZdl5eRdPSU2xDRASOQbzBAqnR1r4vE+xrRuj4fMCY8m4uSui7TLpKgEa1TMy5F69SMi1ga0brXpbQs89AIdQu4lHCZn0a23nwJu5TUskbjDGnMC5TCOwaqAAAAAElFTkSuQmCC")
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