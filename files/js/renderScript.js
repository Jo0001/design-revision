//Setup-Libraries
let pdfjsLib = require('pdfjs-dist/build/pdf');
let pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

class TargetScaleHandlerClass {
    constructor() {
        this.isScalingATM = false;
        this.innerTargetScale = 1;
        this.scale = 0.9;
        this.handlerId = -1;
        this.round = function round(num) {
            return parseFloat(num + "").toFixed(6);
        }
        this.check = function check() {
            this.isScalingATM = true;
            this.scale = this.round(this.scale);
            this.innerTargetScale = this.round(this.innerTargetScale);
            if (this.scale > this.innerTargetScale && !preventZoomAndMovement) {
                this.scale = parseFloat(this.scale + "") - 0.01;
                this.scale = this.round(this.scale);
                this.isScalingATM = true;
                renderPageFromPdf(this.scale);
            } else if (this.scale < this.innerTargetScale && !preventZoomAndMovement) {
                this.scale = parseFloat(this.scale + "") + 0.01;
                this.scale = this.round(this.scale);
                this.isScalingATM = true;
                renderPageFromPdf(this.scale);
            } else if (this.scale === this.innerTargetScale && !preventZoomAndMovement) {
                if (this.handlerId > 0) {
                    clearInterval(this.handlerId);
                    this.isScalingATM = false;
                    //console.log("Removed Listener. " + this.handlerId + " " + (this.scale === this.innerTargetScale) + " " + this.scale + " " + this.innerTargetScale);
                    this.handlerId = -1;
                    this.scale = this.round(this.scale);
                    renderPageFromPdf(this.scale);
                } else {
                    console.log("We should not get here ever.")
                }
            }
        }
        this.updateScale = function updateScale() {
            if (this.handlerId < 0) {
                this.handlerId = setInterval(this.check.bind(this, this.handlerId), 1);
                //console.log("Added Listener. " + this.handlerId);
            } else {
                //console.log("Already have a scale Updater with targetScale: " + this.innerTargetScale);
            }
        };
    }

    set targetScale(val) {
        if (val < 0.4) {
            this.innerTargetScale = 0.4;
        } else {
            this.innerTargetScale = val;
        }
        this.updateScale();
    };
}

class Comment {
    constructor() {
        this.page = -1;
        this.x = -1;
        this.y = -1;
        this.w = -1;
        this.h = -1;
    }
}

let pdfFileOrUrl = "../user-content/test4.pdf";
let pdfPageNumber = 101;
let canvas;
let commentContainer;
let commentArea;
let pdf;
let pdfPage = undefined;
let isRendering = false;
let commentMode = false;
let preventZoomAndMovement = false;

let targetScaleHandler = new TargetScaleHandlerClass();
let comments = new Array();
let commentAreaData = {sX: -1, sY: -1, eX: -1, eY: -1, widthPdf: -1, heightPdf: -1};

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

function startDragHandler(event) {
    let eventDoc, doc, body;

    event = event || window.event; // IE-ism
    event.preventDefault();
    if (event.button === 0) {
        preventZoomAndMovement = true;
        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
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
        commentAreaData.sX = event.pageX - parseInt(canvas.style.left.replace("px", ""));
        commentAreaData.sY = event.pageY - parseInt(canvas.style.top.replace("px", ""));

        commentArea.style.top = parseInt(commentAreaData.sY) + "px";
        commentArea.style.left = parseInt(commentAreaData.sX) + "px";
        commentArea.style.width = 0 + "px";
        commentArea.style.height = 0 + "px";
        commentArea.style.display = "inherit";
        commentContainer.addEventListener("mousemove", resizeCommentArea);
    }
};

function resizeCommentArea(event) {
    if (commentAreaData.sX > -1 && commentAreaData.sY > -1) {
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
        let width = ((event.pageX - parseInt(canvas.style.left.replace("px", ""))) - commentAreaData.sX);
        let height = ((event.pageY - parseInt(canvas.style.top.replace("px", ""))) - commentAreaData.sY);
        if (commentAreaData.sX > (event.pageX - parseInt(canvas.style.left.replace("px", ""))) &&
            commentAreaData.sX !== (event.pageX - parseInt(canvas.style.left.replace("px", "")))) {
            //pageX is right cornor
            commentArea.style.left = (event.pageX - parseInt(canvas.style.left.replace("px", ""))) + "px";
            width = (commentAreaData.sX - (event.pageX - parseInt(canvas.style.left.replace("px", ""))));
        } else {
            //everything is Ok
        }
        if (commentAreaData.sY > (event.pageY - parseInt(canvas.style.top.replace("px", ""))) &&
            commentAreaData.sY !== (event.pageY - parseInt(canvas.style.top.replace("px", "")))) {
            //pageX is top cornor
            commentArea.style.top = (event.pageY - parseInt(canvas.style.top.replace("px", ""))) + "px";
            height = (commentAreaData.sY - (event.pageY - parseInt(canvas.style.top.replace("px", ""))));
        } else {
            //everything is ok
        }
        commentArea.style.width = width + "px";
        commentArea.style.height = height + "px";
    }
}

function endDragHandler(event) {
    commentContainer.removeEventListener("mousemove", resizeCommentArea);
    let eventDoc, doc, body;

    event = event || window.event; // IE-ism
    event.preventDefault();
    if (event.button === 0) {
        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
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
        commentAreaData.eX = event.pageX - parseInt(canvas.style.left.replace("px", ""));
        commentAreaData.eY = event.pageY - parseInt(canvas.style.top.replace("px", ""));
        commentAreaData.widthPdf = parseInt(canvas.getAttribute("width"));
        commentAreaData.heightPdf = parseInt(canvas.getAttribute("height"));

        if (commentAreaData.sX !== -1 && commentAreaData.sY !== -1 &&
            commentAreaData.eX !== -1 && commentAreaData.eY !== -1) {
            createComment();
        }

        commentAreaData = {sX: -1, sY: -1, eX: -1, eY: -1, widthPdf: -1, heightPdf: -1};
        commentArea.style.top = 10 + "px";
        commentArea.style.left = 10 + "px";
        commentArea.style.width = 10 + "px";
        commentArea.style.height = 10 + "px";
        commentArea.style.display = "none";
        preventZoomAndMovement = false;
    }
};

function createComment() {
    console.log("createComment();")
}

function redirectAllEvents(target, fromElement) {
    redirect("mousedown", target, fromElement);
    redirect("mouseup", target, fromElement);
    redirect("mousemove", target, fromElement);
    redirect("mousewheel", target, fromElement);
    redirect("DOMMouseScroll", target, fromElement);

    function redirect(eventType, target, fromElement) {
        fromElement.addEventListener(eventType, function (event) {
            target.dispatchEvent(new event.constructor(event.type, event));
            event.preventDefault();
            event.stopPropagation();
        });
    }
}

function setup() {
    //Prevent a contextmenu on page, so people cant download the design.
    document.body.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });
    commentArea = document.getElementById('commentArea');

    canvas = document.getElementById('pdf');
    canvasObserver.observe(canvas, {attributes: true});
    canvas.addEventListener("mousewheel", listenForMouseWheelTurn, false);
    canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
    dragElementWhenBtnIsDown(canvas, 1);

    commentContainer = document.getElementById('commentContainer');
    redirectAllEvents(canvas, commentContainer);
    commentContainerObserver.observe(commentContainer, {attributes: true});
    let titlecard = document.getElementById("titlecard");
    let createCommentBtn = document.getElementById("createComment");
    createCommentBtn.addEventListener("click", function (e) {
        commentMode = !commentMode;
        if (commentMode) {
            //COMMENTMODE ON
            createCommentBtn.innerHTML = "Kommentarmodus ausschalten";
            canvas.addEventListener("mousedown", startDragHandler, false);
            canvas.addEventListener("mouseup", endDragHandler, false);
        } else {
            createCommentBtn.innerHTML = "Kommentarmodus einschalten";
            canvas.removeEventListener("mousedown", startDragHandler, false);
            canvas.removeEventListener("mouseup", endDragHandler, false);
        }
    });

    let projectId = getURLParameter('id');
    if (projectId === undefined || projectId === false || projectId === "") {
        projectId = 2;
        window.alert("Using demo Project id=2, because I received no parameter projectId.")
    }
    let requestURL = window.location.origin + "/design-revision/api/?getproject&id=" + projectId;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.send();
    request.onreadystatechange = function (e) {
        if (request.readyState === 4 && request.status === 200) {
            let projectContainer = JSON.parse(request.response);
            titlecard.innerText = titlecard.innerHTML.replace("/", projectContainer.project.name);
        } else if (request.readyState === 4 && request.status === 401) {
            window.alert("keine Berechtigung");
        } else if (request.readyState === 4 && request.status === 403) {
            window.alert("Forbidden");
        } else if (request.readyState === 4 && request.status === 404) {
            window.alert("Nichts gefunden");
        }
    };

    //Json Kommentare aus Api hohlen
    let request2 = new XMLHttpRequest();
    requestURL = window.location.origin + "/design-revision/api/?getproject=data&id=" + projectId;
    request2.open('GET', requestURL);
    request2.send();
    request2.onreadystatechange = function (e) {
        if (request.readyState === 4 && request.status === 200) {
            let projectObject = JSON.parse(request.response);
            //pdfFileOrUrl = projectObject.link;
            loadPDFAndRender(1, pdfFileOrUrl);
        } else if (request.readyState === 4 && request.status === 401) {
            window.alert("keine Berechtigung");
        } else if (request.readyState === 4 && request.status === 403) {
            window.alert("Forbidden");
        } else if (request.readyState === 4 && request.status === 404) {
            window.alert("Nichts gefunden");
        }
    };
}

function resizeComments() {
    console.log("resizeComments();")
}

function getURLParameter(name) {
    let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : undefined;
}

function dragElementWhenBtnIsDown(elmnt, btn) {
    let pos1 = 0, pos2 = 0, cursorXinView = 0, cursorYinView = 0;
    elmnt.addEventListener("mousedown", function (e) {
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
    });

    function drag(e) {
        e.preventDefault();
        if (!preventZoomAndMovement) {
            // calculate the new cursor position:
            pos1 = cursorXinView - e.clientX;
            pos2 = cursorYinView - e.clientY;
            cursorXinView = e.clientX;
            cursorYinView = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
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
    var e = window.event || e;
    e.preventDefault()
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    //console.log(delta);
    if (delta == 1) {
        targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) + 0.05;
    } else {
        targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) - 0.05;
    }
}

function loadPDFAndRender(scale, pdfFileOrUrl) {
    let loadingTask = pdfjsLib.getDocument(pdfFileOrUrl);
    let loadingBar = document.getElementById("loading");
    loadingTask.onProgress = function (progress) {
        let percentLoaded = Math.round(progress.loaded / progress.total);
        percentLoaded = percentLoaded > 0.01 ? percentLoaded : 0.01;
        percentLoaded = percentLoaded <= 1 ? percentLoaded : 1;
        loadingBar.style.width = percentLoaded * (document.documentElement.clientWidth - 20) + "px";
    };
    loadingTask.promise.then(function (localPdf) {
        pdf = localPdf;
        loadPdfPage(pdf, scale);
    }, function (reason) {
        // PDF loading error
        window.alert(reason);
    });
}

function loadPdfPage(pdf, scale) {
    pdf.getPage(pdfPageNumber).then(function (localPage) {
        pdfPage = localPage;
        renderPageFromPdf(scale);
    });
}

function renderPageFromPdf(scale) {
    if (!isRendering) {
        isRendering = true;
        let viewport = pdfPage.getViewport({scale: scale});
        // Prepare canvas using PDF page dimensions
        let context = canvas.getContext('2d');
        canvas.style.height = viewport.height + "px";
        canvas.style.width = viewport.width + "px";
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // Render PDF page into canvas context
        let renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        let renderTask = pdfPage.render(renderContext);
        renderTask.promise.then(function () {
            isRendering = false;
        });
        /* SVG-Rendering-Code but not all Graphic
        Sates have been implemented in the library + convas needs to be div
        let viewport = page.getViewport({scale: scale});
        canvas.style.height = viewport.height + 'px';
        canvas.style.width = viewport.width + 'px';
        //Make sure Div is clean
        while (canvas.firstChild) {
            canvas.removeChild(canvas.firstChild);
        }
        page.getOperatorList()
            .then(function (opList) {
                let svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, viewport);
            })
            .then(function (svg) {
                canvas.appendChild(svg);
            });
         */
    }
}

let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        setup();
    }
}, 10);