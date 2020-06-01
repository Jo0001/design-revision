let createCommentBtn;
let commentArea;
let commentAreaData = {sX: -1, sY: -1, eX: -1, eY: -1, widthPdf: -1, heightPdf: -1};
let messageArea;
let messageDialog;
let saveCommentBtn;
let discardCommentBtn;
let sendBackBtn;
let printDesign = false;

function setup() {
    createCommentBtn = document.getElementById("createComment");
    commentArea = document.getElementById("commentArea");
    messageArea = document.getElementById("commentMsg");
    messageDialog = document.getElementById("messageDialog");
    saveCommentBtn = document.getElementById("saveCommentBtn");
    discardCommentBtn = document.getElementById("discardCommentBtn");
    sendBackBtn = document.getElementById("sendBack");
    //Comment-Setup
    sidebarGroup.add(createCommentBtn);
    createCommentBtn.addEventListener("click", function (e) {
        if (createCommentBtn.classList.contains("disSelected")) {
            //COMMENTMODE ON
            canvas.addEventListener("mousedown", startDragHandler, false);
            canvas.addEventListener("mouseup", endDragHandler, false);
            document.getElementsByTagName("html")[0].style.cursor = "crosshair";
            canvas.style.cursor = "crosshair";
            commentContainer.style.cursor = "crosshair";
            commentArea.style.cursor = "crosshair";
            sidebarGroup.selectSidebarElementById(createCommentBtn.id);
        } else {
            canvas.removeEventListener("mousedown", startDragHandler, false);
            canvas.removeEventListener("mouseup", endDragHandler, false);
            document.getElementsByTagName("html")[0].style.cursor = null;
            canvas.style.cursor = null;
            commentContainer.style.cursor = null;
            commentArea.style.cursor = null;
            sidebarGroup.deselectSidebarElementById(createCommentBtn.id);
        }
    });

    saveCommentBtn.addEventListener("click", function (e) {
        if (messageArea.value !== "" && messageArea.value !== undefined) {
            let xInPx = parseFloat(commentArea.style.left.replace("px", ""));
            let yInPx = parseFloat(commentArea.style.top.replace("px", ""));
            let wInPx = parseFloat(commentArea.style.width.replace("px", ""));
            let hInPx = parseFloat(commentArea.style.height.replace("px", ""));

            let xInCoords = (xInPx / commentAreaData.widthPdf).toPrecision(7);
            let yInCoords = (yInPx / commentAreaData.heightPdf).toPrecision(7);
            let wInCoords = (wInPx / commentAreaData.widthPdf).toPrecision(7);
            let hInCoords = (hInPx / commentAreaData.heightPdf).toPrecision(7);
            let comment = new Comment(0, pageNumberContainer.value, xInCoords, yInCoords, wInCoords, hInCoords,
                user.id, messageArea.value, false, generateRandomColor(), 0, version);
            comment.cid = String(JSON.stringify(comment)).hashCode();
            console.log(comment);
            displayedTextComments.push(comment);
            displayedComments.push(comment);
            console.log("Trying to push comment to database, projectID: " + projectId + " " + JSON.stringify(comment));
            let data = "id=" + projectId + "&comment=" + JSON.stringify(comment);
            let xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4 && this.status === 204) {
                    createComment(comment);
                    createTextComment(comment);
                    pageTurned();
                    messageDialog.style.display = "none";
                    messageArea.value = "";
                    resetAreaData();
                } else if (this.readyState === 4 && this.status !== 204) {
                    window.alert(this.responseText)
                }
            });
            xhr.open("PUT", window.location.origin + "/design-revision/api/project/addcomment");
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(data);
        } else {
            window.alert("Message of Comment empty.");
        }
    });
    discardCommentBtn.addEventListener("click", function (e) {
        messageDialog.style.display = "none";
        messageArea.value = "";
        resetAreaData();
    });

    sendBackBtn.addEventListener("click", handleSendButtonClick);
}

//CommentArea-Methods
function resizeCommentArea(event) {
    event = event || window.event; // IE-ism
    event.preventDefault();
    ensureEventAttributes(event);
    //check if mouse is over canvas
    let clientWidth = (parseFloat(commentContainer.style.left.replace("px", "")) + parseFloat(commentContainer.style.width.replace("px", "")));
    let clientHeight = (parseFloat(commentContainer.style.top.replace("px", "")) + parseFloat(commentContainer.style.height.replace("px", "")));
    if (event.pageX <= (commentContainer.style.left.replace("px", "")) ||
        event.pageX >= clientWidth || event.pageY <= (commentContainer.style.top.replace("px", "")) ||
        event.pageY >= clientHeight) {
        resetAreaData();
    }
    let eventXRelativeCanvas = (event.pageX - parseFloat(commentContainer.style.left.replace("px", "")));
    let eventYRelativeCanvas = (event.pageY - parseFloat(commentContainer.style.top.replace("px", "")));
    let width = (eventXRelativeCanvas - commentAreaData.sX);
    let height = (eventYRelativeCanvas - commentAreaData.sY);
    if (commentAreaData.sX > -1 && commentAreaData.sY > -1) {
        if (commentAreaData.sX !== eventXRelativeCanvas && commentAreaData.sY !== eventYRelativeCanvas) {
            if (commentAreaData.sX < eventXRelativeCanvas) {
                //pageX is right corner
                commentArea.style.left = commentAreaData.sX + "px";
                width = (eventXRelativeCanvas - commentAreaData.sX);
            } else {
                //pageX is left corner
                commentArea.style.left = eventXRelativeCanvas + "px";
                width = (commentAreaData.sX - eventXRelativeCanvas);
            }
            if (commentAreaData.sY < eventYRelativeCanvas) {
                //pageX is top corner
                commentArea.style.top = commentAreaData.sY + "px";
                height = (eventYRelativeCanvas - commentAreaData.sY);
            } else {
                //pageX lower corner
                commentArea.style.top = eventYRelativeCanvas + "px";
                height = (commentAreaData.sY - eventYRelativeCanvas);
            }
        }
        width = width <= 0 ? -1 : width;
        height = height <= 0 ? -1 : height;
        commentArea.style.width = width + "px";
        commentArea.style.height = height + "px";
    }
}
function resetAreaData() {
    commentAreaData = {sX: -1, sY: -1, eX: -1, eY: -1, widthPdf: -1, heightPdf: -1};
    commentArea.style.top = 10 + "px";
    commentArea.style.left = 10 + "px";
    commentArea.style.width = 10 + "px";
    commentArea.style.height = 10 + "px";
    commentArea.style.display = "none";
    preventZoomAndMovement = false;
}

//CommentArea-Handler
function startDragHandler(event) {
    event = event || window.event; // IE-ism
    event.preventDefault();
    if (event.button === 0) {
        preventZoomAndMovement = true;
        ensureEventAttributes(event);
        commentAreaData.sX = event.pageX - parseInt(commentContainer.style.left.replace("px", ""));
        commentAreaData.sY = event.pageY - parseInt(commentContainer.style.top.replace("px", ""));

        commentArea.style.top = parseInt(commentAreaData.sY) + "px";
        commentArea.style.left = parseInt(commentAreaData.sX) + "px";
        commentArea.style.width = 1 + "px";
        commentArea.style.height = 1 + "px";
        commentArea.style.display = "inherit";
        document.addEventListener("mousemove", resizeCommentArea);
    }
}
function endDragHandler(event) {
    document.removeEventListener("mousemove", resizeCommentArea);
    event = event || window.event; // IE-ism
    event.preventDefault();
    if (event.button === 0) {
        ensureEventAttributes(event);
        commentAreaData.eX = event.pageX - parseFloat(commentContainer.style.left.replace("px", ""));
        commentAreaData.eY = event.pageY - parseFloat(commentContainer.style.top.replace("px", ""));
        commentAreaData.widthPdf = parseFloat(commentContainer.style.width.replace("px", ""));
        commentAreaData.heightPdf = parseFloat(commentContainer.style.height.replace("px", ""));

        if (commentAreaData.sX !== -1 && commentAreaData.sY !== -1 &&
            commentAreaData.eX !== -1 && commentAreaData.eY !== -1) {
            if (commentAreaData.sX !== commentAreaData.eX && commentAreaData.sY !== commentAreaData.eY) {
                openCommentDialog(commentArea);
            }
        }
    }
}

//Loaded-Callback
function loaded() {
    document.getElementById("emailDisplay").innerHTML = user.email;
}

async function pageTurned() {
    if (parseInt(pageNumberContainer.value) === pdf.numPages) {
        sendBackBtn.style.display = null;
        getComments(function (commentVersionsArray, commentArray) {
            if (numberInArray(commentVersionsArray, version) && !commentImplemented(commentArray)) {
                //Comment that has been added this version!
                sendBackBtn.innerText = "An die Agentur zurückschicken";
                centerOnScreen(sendBackBtn);
                printDesign = false;
                console.log("There are Comments that have been added this version! CurrentVersion: " + version)
            } else {
                printDesign = true;
                sendBackBtn.innerText = "Zum Druckauftrag freigeben";
                centerOnScreen(sendBackBtn);
            }
        });
    } else {
        sendBackBtn.style.display = "none";
    }

    function centerOnScreen(element) {
        element.style.left = ((document.body.clientWidth - element.offsetWidth) / 2) / document.body.clientWidth * 100 + "%";
    }

    function commentImplemented(a) {
        for (let i = 0; i < a.length; i++) {
            if (!a[i].isImplemented) {
                return false;
            }
        }
        return true;
    }

    function numberInArray(a, num) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] === num) {
                return true;
            }
        }
        return false;
    }
}

//Return PDF-Logic
function getComments(f) {
    let commentVersionArray = [];
    let commentArray = [];
    let requestURL = window.location.origin + "/design-revision/api/project/data?id=" + projectId;
    let request3 = new XMLHttpRequest();
    let gotAllData = false;
    request3.open('GET', requestURL);
    request3.addEventListener('readystatechange', function (e) {
        handleServerResponse(request3, function (response) {
            try {
                let allPdfComments = response.data;
                for (let index = 0; index < allPdfComments.length; index++) {
                    commentVersionArray[index] = allPdfComments[index].version;
                    commentArray[index] = allPdfComments[index];
                }
            } catch (e) {
                console.log(e);
            }
            gotAllData = true;
            f(commentVersionArray, commentArray);
        });
    });
    request3.send();
}

function handleSendButtonClick(e) {
    let status;
    console.log("Btn click!");
    if (printDesign) {
        status = "DONE";
    } else {
        status = "TODO";
    }

    let requestStatusChange = new XMLHttpRequest();
    requestStatusChange.withCredentials = true;
    let data = "id=" + projectId + "&status=" + status;
    requestURL = window.location.origin + "/design-revision/api/project/updatestatus";
    requestStatusChange.open('PUT', requestURL);
    requestStatusChange.send(data);
    // window.location = window.origin + "/design-revision/";
}

//Comment-Creation
function openCommentDialog() {
    messageDialog.style.top = ((window.screen.height - messageDialog.style.height.replace("px", "") - 120) / 2) + "px";
    messageDialog.style.display = null;
}

function generateRandomColor() {
    let letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        setupViewport();
        setup();
    }
}, 10);