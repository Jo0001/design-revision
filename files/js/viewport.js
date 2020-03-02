//Setup-Libraries
// Loaded via <script> tag, create shortcut to access PDF.js exports.
let pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.worker.js';

class TargetScaleHandlerClass {
    constructor() {
        this.isScalingATM = false;
        this.innerTargetScale = 1;
        this.scale = 1;
        this.handlerId = -1;
        this.handlerIdTime = -1;
        this.timeSinceResize = 0;
        this.round = function round(num) {
            return parseFloat(num + "").toFixed(6);
        };
        this.check = function check() {
            this.isScalingATM = true;
            this.scale = this.round(this.scale);
            this.innerTargetScale = this.round(this.innerTargetScale);
            if (this.scale > this.innerTargetScale && !preventZoomAndMovement) {
                this.isScalingATM = true;
                this.scale = parseFloat(this.scale + "") - 0.01;
                this.scale = this.round(this.scale);
                this.timeSinceResize = 0;
                scaleViewport(this.scale);
            } else if (this.scale < this.innerTargetScale && !preventZoomAndMovement) {
                this.isScalingATM = true;
                this.scale = parseFloat(this.scale + "") + 0.01;
                this.scale = this.round(this.scale);
                this.timeSinceResize = 0;
                scaleViewport(this.scale);
            } else if (this.scale === this.innerTargetScale && !preventZoomAndMovement) {
                if (this.handlerId > 0) {
                    clearInterval(this.handlerId);
                    this.isScalingATM = false;
                    //console.log("Removed Listener. " + this.handlerId + " " + (this.scale === this.innerTargetScale) + " " + this.scale + " " + this.innerTargetScale);
                    this.handlerId = -1;
                    this.scale = this.round(this.scale);
                    this.timeSinceResize = 0;
                    scaleViewport(this.scale);
                } else {
                    console.log("We should not get here ever.")
                }
            }
        };
        let timeout = 1;
        this.updateScale = function updateScale() {
            if (this.handlerId < 0) {
                this.handlerId = setInterval(this.check.bind(this, this.handlerId), timeout);
                //console.log("Added Listener. " + this.handlerId);
            } else {
                //console.log("Already have a scale Updater with targetScale: " + this.innerTargetScale);
            }
        };
        this.handleTime = function handleTime() {
            this.timeSinceResize += timeout;
        };
        this.handlerIdTime = setInterval(this.handleTime.bind(this, this.handlerIdTime), timeout);
    }

    isDoneScaling() {
        return this.innerTargetScale === this.scale && !this.isScalingATM;
    }

    targetScale(val) {
        if (val < minZoom && this.innerTargetScale !== val) {
            this.innerTargetScale = minZoom;
            this.timeSinceResize = 10000;
            this.updateScale();
        } else if (val > maxZoom && this.innerTargetScale !== val) {
            this.innerTargetScale = maxZoom;
            this.timeSinceResize = 10000;
            this.updateScale();
        } else if (this.innerTargetScale !== val) {
            this.innerTargetScale = this.round(val);
            this.updateScale();
        }
    };

    getTimeMsSinceLastScale() {
        return this.timeSinceResize;
    }
}

class ButtonGroup {
    constructor() {
        this.groupElements = [];
    }

    //Button-Sidebar-Group-Handling
    getSelectedSidebarElement() {
        let tmp = undefined;
        for (let index = 0; index < this.groupElements.length; index++) {
            if (!this.groupElements[index].classList.contains("disSelected")) {
                tmp = this.groupElements[index];
            }
        }
        return tmp;
    }

    add(elmt) {
        this.groupElements.push(elmt);
    }

    selectSidebarElementById(id) {
        let tmp;
        if ((tmp = this.getSelectedSidebarElement()) !== undefined) {
            tmp.click();
        }
        document.getElementById(id).classList.remove("disSelected");
        document.getElementById(id).classList.add("selected");
    }

    deselectSidebarElementById(id) {
        document.getElementById(id).classList.remove("selected");
        document.getElementById(id).classList.add("disSelected");
    }
}

class Comment {
    constructor(page, x, y, w, h, authorId, commentText, isImplemented) {
        this.page = page;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.authorId = authorId;
        this.commentText = commentText;
        this.isImplemented = isImplemented;
    }
}

//Settings
let user;
let requestURL;
//Rendering-Variables
let canvas;
let pdf;
let pdfPage = undefined;
let pdfFileOrUrl = "../user-content/test4.pdf";
let targetScaleHandler = new TargetScaleHandlerClass();
let pageNumberContainer;
let isRendering = false;
let firstTimeDisplay = true;
let context;
let preventZoomAndMovement = false;
let viewport;
//Comment-Variables
let projectId;
let commentContainer;
let comments = [];
let canvasObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutationRecord) {
        let attribute = canvas.getAttribute(mutationRecord.attributeName);
        if (mutationRecord.attributeName === "style") {
            commentContainer.setAttribute(mutationRecord.attributeName,
                attribute.replace("z-index: -5; ", "z-index: -4; "));
        }
    });
});
let commentContainerObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutationRecord) {
        resizeComments();
    });
});
//Progressbar-Variables
let percentLoaded = 1;
//Page-Turn-Logic
let decPage;
let incPage;
//Toolbar-Variables
let sidebarGroup = new ButtonGroup();
let moveBtn;
let zoomBtn;
//Zoom-Variables
const minZoom = parseFloat(0.4 + "");
const maxZoom = parseFloat(4.0 + "");
let currentZoom;
let zoomData = {sX: -1, sY: -1};

function setupViewport() {
    //Prevent a contextmenu on page, so people cant download the design.
    document.body.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });

    //Get dom elements
    pageNumberContainer = document.getElementById("currentPage");
    decPage = document.getElementById("decPage");
    incPage = document.getElementById("incPage");
    canvas = document.getElementById('pdf');
    let titleCard = document.getElementById("titleCard");

    //Turn-Page-Logic
    pageNumberContainer.addEventListener("click", function () {
        pageNumberContainer.value = "";
    });
    pageNumberContainer.addEventListener("input", function () {
        loadPdfPage(targetScaleHandler.scale);
    });
    decPage.addEventListener("click", function () {
        pageNumberContainer.value = parseInt(pageNumberContainer.value) - 1;
        loadPdfPage(targetScaleHandler.scale);
    });
    incPage.addEventListener("click", function () {
        pageNumberContainer.value = parseInt(pageNumberContainer.value) + 1;
        loadPdfPage(targetScaleHandler.scale);
    });

    //Canvas-Setup
    canvasObserver.observe(canvas, {attributes: true});
    canvas.addEventListener("wheel", listenForMouseWheelTurn, false);
    canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
    let middleMove = dragElementWhenBtnIsDown(canvas, 1);
    context = canvas.getContext('2d');

    //Comment-Setup
    commentContainer = document.getElementById('commentContainer');
    commentContainerObserver.observe(commentContainer, {attributes: true});
    redirectAllEvents(canvas, commentContainer);

    //Save logged in UserId
    let request3 = new XMLHttpRequest();
    requestURL = window.location.origin + "/design-revision/api/user/";
    request3.open('GET', requestURL);
    request3.addEventListener('readystatechange', function (e) {
        handleServerResponse(request3, function (response) {
            console.log(response.user.email);
            user = response.user;
            try {
                loaded();
            } catch (e) {

            }
        });
    });
    request3.send();

    //Move-Button-Setup
    moveBtn = document.getElementById("movePdf");
    sidebarGroup.add(moveBtn);
    let handlerId;
    moveBtn.addEventListener("click", function (e) {
        if (moveBtn.classList.contains("disSelected")) {
            sidebarGroup.selectSidebarElementById(moveBtn.id);
            handlerId = dragElementWhenBtnIsDown(canvas, 0);
            canvas.style.cursor = "all-scroll";
        } else {
            sidebarGroup.deselectSidebarElementById(moveBtn.id);
            canvas.style.cursor = null;
            canvas.removeEventListener("mousedown", handlerId);
        }
    });
    //Zoom-Button-Setup
    zoomBtn = document.getElementById("zoomPdf");
    sidebarGroup.add(zoomBtn);
    zoomBtn.addEventListener("click", function (e) {
        if (zoomBtn.classList.contains("disSelected")) {
            sidebarGroup.selectSidebarElementById(zoomBtn.id);
            canvas.addEventListener("mousedown", startPointZoom);
            canvas.removeEventListener("wheel", listenForMouseWheelTurn, false);
            canvas.removeEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
            canvas.removeEventListener("mousedown", middleMove);
        } else {
            sidebarGroup.deselectSidebarElementById(zoomBtn.id);
            canvas.removeEventListener("mousedown", startPointZoom);
            canvas.addEventListener("wheel", listenForMouseWheelTurn, false);
            canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
            middleMove = dragElementWhenBtnIsDown(canvas, 1)
        }
    });

    //Demo-Data
    projectId = getURLParameter('id');
    if (projectId === "") {
        projectId = "20ced965";
        console.log("Using demo Project id=20ced965, because I received no parameter projectId.")
    }

    //Request Project-Data from API
    requestURL = window.location.origin + "/design-revision/api/project/?id=" + projectId;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.addEventListener('readystatechange', function (e) {
        handleServerResponse(request, function (response) {
            titleCard.innerText = titleCard.innerHTML.replace("/", response.project.name);
        });
    });
    request.send();

    //Json PDF aus Api hohlen
    let request2 = new XMLHttpRequest();
    requestURL = window.location.origin + "/design-revision/api/project/data?id=" + projectId;
    request2.open('GET', requestURL);
    request2.addEventListener('readystatechange', function (e) {
        handleServerResponse(request2, function (response) {
            pdfFileOrUrl = "../api/project/pdf.php?file=" + response.link;
            loadPDFAndRender(1, pdfFileOrUrl);
        });
    });
    request2.send();

    //Viewport-Movement
    function dragElementWhenBtnIsDown(element, btn) {
        let pos1 = 0, pos2 = 0, cursorXinView = 0, cursorYinView = 0;
        let han = function handle(e) {
            if (e.button === btn) {
                e.preventDefault();
                // get the mouse cursor position at startup:
                cursorXinView = e.clientX;
                cursorYinView = e.clientY;
                // stop moving when mouse button is released:
                document.addEventListener("mouseup", stopDragging);
                // call a function whenever the cursor moves:
                document.addEventListener("mousemove", drag);
            }
        };
        element.addEventListener("mousedown", han);
        return han;

        function drag(e) {
            e.preventDefault();
            if (!preventZoomAndMovement) {
                // calculate the new cursor position:
                pos1 = cursorXinView - e.clientX;
                pos2 = cursorYinView - e.clientY;
                cursorXinView = e.clientX;
                cursorYinView = e.clientY;
                // set the element's new position:
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }
        }

        function stopDragging(e) {
            if (e.button === btn) {
                document.removeEventListener("mousemove", drag);
                document.removeEventListener("mouseup", stopDragging);
            }
        }
    }

    function listenForMouseWheelTurn(e) {
        let event = window.event || e;
        event.preventDefault();
        let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            if (event.deltaY <= 0) {
                targetScaleHandler.targetScale(parseFloat(targetScaleHandler.innerTargetScale) + 0.05);
            } else {
                targetScaleHandler.targetScale(parseFloat(targetScaleHandler.innerTargetScale) - 0.05);
            }
        } else {
            if (delta === 1) {
                targetScaleHandler.targetScale(parseFloat(targetScaleHandler.innerTargetScale) + 0.05);
            } else {
                targetScaleHandler.targetScale(parseFloat(targetScaleHandler.innerTargetScale) - 0.05);
            }
        }
        //console.log(delta);
    }

    //Viewport-Zoom
    function startPointZoom(e) {
        ensureEventAttributes(e);
        zoomData.sX = e.clientX;
        zoomData.sY = e.clientY;
        currentZoom = parseFloat(targetScaleHandler.innerTargetScale);
        document.addEventListener("mousemove", zoom);
        document.addEventListener("mouseup", clearListeners);
    }

    function zoom(e) {
        ensureEventAttributes(e);
        let deltaX = zoomData.sX - e.clientX;
        let deltaY = zoomData.sY - e.clientY;
        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        distance = parseInt(distance + "");
        distance = distance <= 10 ? 0 : distance;
        let fullZoomAtPx = document.body.clientWidth * 0.2;
        let scaleFactor = (distance / fullZoomAtPx).toPrecision(7);
        scaleFactor = scaleFactor >= 1 ? 1 : scaleFactor;
        scaleFactor = scaleFactor <= 0 ? 0 : scaleFactor;
        let deltaZoom;
        let zoomVal;
        if (deltaX > 0) {
            //scale bigger
            deltaZoom = (maxZoom - currentZoom).toPrecision(2);
            // console.log(deltaZoom);
            zoomVal = (currentZoom + (deltaZoom * scaleFactor)).toPrecision(2);
            // console.log("bg: " + parseFloat(zoomVal).toPrecision(2));
        } else if (deltaX < 0) {
            //scale smaller
            deltaZoom = (currentZoom - minZoom).toPrecision(2);
            // console.log(deltaZoom);
            zoomVal = (currentZoom - (deltaZoom * scaleFactor)).toPrecision(2);
            // console.log("sm: " + parseFloat(zoomVal).toPrecision(2));
        } else {
            zoomVal = currentZoom;
        }
        let numSteps = parseInt(zoomVal / 0.05 + "");
        targetScaleHandler.targetScale((numSteps * 0.05).toPrecision(2));
    }

    function clearListeners(e) {
        document.removeEventListener("mousemove", zoom);
        document.removeEventListener("mouseup", clearListeners);
    }

    function redirectAllEvents(target, fromElement) {
        redirect("wheel", target, fromElement);
        redirect("DOMMouseScroll", target, fromElement);
        redirect("mousedown", target, fromElement);
        redirect("mouseup", target, fromElement);
        redirect("mousemove", target, fromElement);

        function redirect(eventType, target, fromElement) {
            fromElement.addEventListener(eventType, function (event) {
                target.dispatchEvent(new event.constructor(event.type, event));
                event.preventDefault();
                event.stopPropagation();
            });
        }
    }

    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [undefined, ""])[1]);
        return (value !== 'null') ? value : undefined;
    }
}

//API-Request-Stuff
function handleServerResponse(request, successCallback) {
    if (request.readyState === 4 && request.status === 200) {
        successCallback(JSON.parse(request.response));
    } else if (request.readyState === 4 && request.status === 401) {
        window.alert("keine Berechtigung");
    } else if (request.readyState === 4 && request.status === 403) {
        window.alert("Forbidden");
    } else if (request.readyState === 4 && request.status === 404) {
        window.alert("Nichts gefunden");
    }
}

//Error-Correction
function ensureEventAttributes(event) {
    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    let eventDoc;
    let doc;
    let body;
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
    }
}


//Comment-Management
function clearComments() {
    for (let index = 0; index < comments.length; index++) {
        let commentDiv = document.getElementById("comment" + index);
        commentDiv.remove();
    }
    comments = [];
    //Json Comments aus Api hohlen
    let request3 = new XMLHttpRequest();
    let requestURL = window.location.origin + "/design-revision/api/project/data?id=" + projectId;
    request3.open('GET', requestURL);
    request3.send();
    request3.addEventListener('readystatechange', function (e) {
        handleServerResponse(request3, function (response) {
            let allPdfComments = response.data;
            for (let index = 0; index < allPdfComments.length; index++) {
                let comment = allPdfComments[index];
                if (parseInt(comment.page) === parseInt(pageNumberContainer.value)) {
                    // console.log(comment);
                    comments.push(comment);
                    createComment(comment);
                }
            }
        });
    });
}

function createComment(comment) {
    let commentDiv = document.createElement("div");
    commentDiv.setAttribute("id", "comment" + comments.indexOf(comment));
    setCommentAttributes(commentDiv, comment);
    commentContainer.appendChild(commentDiv);
}

function setCommentAttributes(commentDiv, comment) {
    commentDiv.style.position = "absolute";
    commentDiv.style.left = (parseFloat(comment.x) * commentContainer.style.width.replace("px", "")) + "px";
    commentDiv.style.top = (parseFloat(comment.y) * commentContainer.style.height.replace("px", "")) + "px";
    commentDiv.style.width = (parseFloat(comment.w) * commentContainer.style.width.replace("px", "")) + "px";
    commentDiv.style.height = (parseFloat(comment.h) * commentContainer.style.height.replace("px", "")) + "px";
    commentDiv.style.backgroundColor = "rgba(61, 61, 61, 0.75)";
    commentDiv.style.outlineStyle = "outset";
    commentDiv.style.outlineColor = "rgba(250, 0, 0, 0.75)";
}

function resizeComments() {
    for (let index = 0; index < comments.length; index++) {
        let commentDiv = document.getElementById("comment" + index);
        let comment = comments[index];
        setCommentAttributes(commentDiv, comment);
    }
}


//Pre-Render
function displayProgressOnBar() {
    let loadingBar = document.getElementById("loading");
    loadingBar.style.width = percentLoaded + "%";
    if (percentLoaded >= 100) {
        percentLoaded = undefined;
    }
}

function loadPDFAndRender(scale, pdfFileOrUrl) {
    let loadingTask = pdfjsLib.getDocument(pdfFileOrUrl);
    console.log("Started loading pdf: " + loadingTask);
    let updateBar = setInterval(function () {
        if (percentLoaded === undefined) {
            clearInterval(updateBar);
        }
        displayProgressOnBar();
    }, 10);
    loadingTask.onProgress = function (progress) {
        percentLoaded = (progress.loaded / progress.total) * 100;
    };
    loadingTask.promise.then(function (localPdf) {
        pdf = localPdf;
        document.getElementById("lastPage").value = pdf.numPages;
        loadPdfPage(scale);
    }, function (reason) {
        // PDF loading error
        window.alert(reason);
    });
}

function loadPdfPage(scale) {
    if (pageNumberContainer.value !== undefined) {
        let num = parseInt(pageNumberContainer.value);
        num = num >= 1 ? num : 1;
        num = num <= pdf.numPages ? num : pdf.numPages;
        pageNumberContainer.value = num;
        clearComments();//to get comments
        pdf.getPage(parseInt(pageNumberContainer.value)).then(function (localPage) {
            pdfPage = localPage;
            renderIfReady(scale);
        });
    }
}


//Render
function scaleViewport(scale) {
    // console.log("Scale: " + scale);
    let canvasW = parseInt((pdfPage.getViewport({scale: 1}).width * scale).toPrecision(7) + "");
    let canvasH = parseInt((pdfPage.getViewport({scale: 1}).height * scale).toPrecision(7) + "");
    canvas.style.height = canvasH + "px";
    canvas.style.width = canvasW + "px";
    if (targetScaleHandler.isDoneScaling() && !targetScaleHandler.isScalingATM) {
        renderIfReady(scale);
    }
}

async function renderIfReady(scale) {
    if (!isRendering && targetScaleHandler.getTimeMsSinceLastScale() > 100) {
        isRendering = true;
        renderPageFromPdf(scale);

        function renderPageFromPdf(scale) {
            viewport = pdfPage.getViewport({scale});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.height = canvas.height + "px";
            canvas.style.width = canvas.width + "px";
            pdfjsLib.disableWorker = false;
            let renderTask = pdfPage.render({
                canvasContext: context,
                viewport: viewport
            });
            renderTask.promise.then(function () {
                isRendering = false;
                if (firstTimeDisplay) {
                    firstTimeDisplay = false;
                    canvas.style.left = ((document.body.clientWidth - canvas.width) / 2) + "px";
                    canvas.style.top = "100px";
                }
            });
            /* SVG-Rendering-Code but not all Graphic
            Sates have been implemented in the library + convas needs to be div
            let viewport = pdfPage.getViewport({scale: scale});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.height = viewport.height + 'px';
            canvas.style.width = viewport.width + 'px';
            //Make sure Div is clean
            while (canvas.firstChild) {
                canvas.removeChild(canvas.firstChild);
            }
            pdfPage.getOperatorList()
                .then(function (opList) {
                    let svgGfx = new pdfjsLib.SVGGraphics(pdfPage.commonObjs, pdfPage.objs);
                    return svgGfx.getSVG(opList, viewport);
                })
                .then(function (svg) {
                    canvas.appendChild(svg);
                })
                .then(function () {
                    isRendering = false;
                        if (firstTimeDisplay) {
                            firstTimeDisplay = false;
                            canvas.style.left = ((document.body.clientWidth - canvas.width) / 2) + "px";
                            canvas.style.top = "100px";
                        }
                });*/
        }
    } else {
        // console.log(targetScaleHandler.getTimeMsSinceLastScale());
        if (!isRendering) {
            await sleep(20).then(function () {
                renderIfReady(targetScaleHandler.scale);
            });
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
    }
}