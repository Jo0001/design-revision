let createCommentBtn;
let commentArea;
let commentAreaData = {sX: -1, sY: -1, eX: -1, eY: -1, widthPdf: -1, heightPdf: -1};

function setup() {
    createCommentBtn = document.getElementById("createComment");
    commentArea = document.getElementById("commentArea");
    //Comment-Setup
	sidebarElements.push(createCommentBtn);
    createCommentBtn.addEventListener("click", function (e) {
        if (createCommentBtn.classList.contains("disSelected")) {
            //COMMENTMODE ON
            canvas.addEventListener("mousedown", startDragHandler, false);
            canvas.addEventListener("mouseup", endDragHandler, false);
            document.getElementsByTagName("html")[0].style.cursor = "crosshair";
            canvas.style.cursor = "crosshair";
            commentContainer.style.cursor = "crosshair";
            commentArea.style.cursor = "crosshair";
            selectSidebarElementById(createCommentBtn.id);
        } else {
            canvas.removeEventListener("mousedown", startDragHandler, false);
            canvas.removeEventListener("mouseup", endDragHandler, false);
            document.getElementsByTagName("html")[0].style.cursor = null;
            canvas.style.cursor = null;
            commentContainer.style.cursor = null;
            commentArea.style.cursor = null;
            deselectSidebarElementById(createCommentBtn.id);
        }
    });
	
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
                createNewComment(commentArea);
            }
        }
        resetAreaData();
    }
}

//Comment-Creation
function createNewComment(commentArea) {
    let xInPx = parseFloat(commentArea.style.left.replace("px", ""));
    let yInPx = parseFloat(commentArea.style.top.replace("px", ""));
    let wInPx = parseFloat(commentArea.style.width.replace("px", ""));
    let hInPx = parseFloat(commentArea.style.height.replace("px", ""));

    let xInCoords = (xInPx / commentAreaData.widthPdf).toPrecision(7);
    let yInCoords = (yInPx / commentAreaData.heightPdf).toPrecision(7);
    let wInCoords = (wInPx / commentAreaData.widthPdf).toPrecision(7);
    let hInCoords = (hInPx / commentAreaData.heightPdf).toPrecision(7);

    let comment = new Comment(pageNumberContainer.value, xInCoords, yInCoords, wInCoords, hInCoords,
        "Somebody", "Message....", false);
    comments.push(comment);
    //TODO upload Data to API
    console.log("Trying to push comment to database, projectID: " + projectId + " " + JSON.stringify(comment));
    let data = "updateproject=data&id=" + projectId + "&data=" + JSON.stringify(comment);
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.response);
        }
    });
    xhr.open("PUT", window.location.origin + "/design-revision/api/");
    xhr.send(data);

    let commentDiv = document.createElement("div");
    commentDiv.setAttribute("id", "comment" + comments.indexOf(comment));
    setCommentAttributes(commentDiv, comment);
    commentContainer.appendChild(commentDiv);
}

let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        setupViewport();
        setup();
    }
}, 10);