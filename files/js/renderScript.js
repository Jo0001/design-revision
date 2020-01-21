//Setup-Libraries
// Loaded via <script> tag, create shortcut to access PDF.js exports.
let pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

class TargetScaleHandlerClass {
    constructor() {
        this.isScalingATM = false;
        this.innerTargetScale = 1;
        this.scale = 0.9;
        this.handlerId = -1;
        this.round = function round(num) {
            return parseFloat(num + "").toFixed(6);
        };
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
        };
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
    constructor(page, x, y, w, h, authorId, commentText) {
        this.page = page;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.authorId = authorId;
        this.commentText = commentText;
    }
}

//Rendering-Variables
let pdf;
let pdfPage = undefined;
let pdfFileOrUrl = "../user-content/test4.pdf";
let targetScaleHandler = new TargetScaleHandlerClass();
let pdfPageNumber = 101;
let isRendering = false;
let firstTimeDisplay = true;
let preventZoomAndMovement = false;
//Comment-Variables
let canvas;
let commentArea;
let commentContainer;
let comments = [];
let commentMode = false;
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
//Progressbar-Variables
let percentLoaded;


function setup() {
    //Prevent a contextmenu on page, so people cant download the design.
    document.body.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });
    window.addEventListener('resize', displayProgressOnBar);
    commentArea = document.getElementById('commentArea');

    canvas = document.getElementById('pdf');
    canvasObserver.observe(canvas, {attributes: true});
    canvas.addEventListener("wheel", listenForMouseWheelTurn, false);
    canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
    dragElementWhenBtnIsDown(canvas, 1);

    commentContainer = document.getElementById('commentContainer');
    commentContainerObserver.observe(commentContainer, {attributes: true});
    redirectAllEvents(canvas, commentContainer);
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
    if (projectId === "") {
        projectId = "20ced965";
        console.log("Using demo Project id=20ced965, because I received no parameter projectId.")
    }
    let requestURL = window.location.origin + "/design-revision/api/?getproject&id=" + projectId;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.send();
    request.addEventListener('readystatechange', function (e) {
        if (this.readyState === 4 && this.status === 200) {
            let projectContainer = JSON.parse(this.response);
            titlecard.innerText = titlecard.innerHTML.replace("/", projectContainer.project.name);
        } else if (this.readyState === 4 && this.status === 401) {
            window.alert("keine Berechtigung");
        } else if (this.readyState === 4 && this.status === 403) {
            window.alert("Forbidden");
        } else if (this.readyState === 4 && this.status === 404) {
            window.alert("Nichts gefunden");
        }
    });

    //Json PDF aus Api hohlen
    let request2 = new XMLHttpRequest();
    requestURL = window.location.origin + "/design-revision/api/?getproject=data&id=" + projectId;
    request2.open('GET', requestURL);
    request2.send();
    request2.addEventListener('readystatechange', function (e) {
        if (this.readyState === 4 && this.status === 200) {
            let projectObject = JSON.parse(this.response);
            //pdfFileOrUrl = projectObject.link;
            loadPDFAndRender(1, pdfFileOrUrl);
        } else if (this.readyState === 4 && this.status === 401) {
            window.alert("keine Berechtigung");
        } else if (this.readyState === 4 && this.status === 403) {
            window.alert("Forbidden");
        } else if (this.readyState === 4 && this.status === 404) {
            window.alert("Nichts gefunden");
        }
    });

    function dragElementWhenBtnIsDown(element, btn) {
        let pos1 = 0, pos2 = 0, cursorXinView = 0, cursorYinView = 0;
        element.addEventListener("mousedown", function (e) {
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

    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [undefined, ""])[1]);
        return (value !== 'null') ? value : undefined;
    }

    function listenForMouseWheelTurn(e) {
        let event = window.event || e;
        event.preventDefault();
        let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            if (event.deltaY < 0) {
                targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) + 0.05;
            } else {
                targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) - 0.05;
            }
        } else {
            if (delta === 1) {
                targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) + 0.05;
            } else {
                targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) - 0.05;
            }
        }
        //console.log(delta);
    }
}

function startDragHandler(event) {
    event = event || window.event; // IE-ism
    event.preventDefault();
    if (event.button === 0) {
        preventZoomAndMovement = true;
        ensureEventAttributes(event);
        commentAreaData.sX = event.pageX - parseInt(canvas.style.left.replace("px", ""));
        commentAreaData.sY = event.pageY - parseInt(canvas.style.top.replace("px", ""));

        commentArea.style.top = parseInt(commentAreaData.sY) + "px";
        commentArea.style.left = parseInt(commentAreaData.sX) + "px";
        commentArea.style.width = 0 + "px";
        commentArea.style.height = 0 + "px";
        commentArea.style.display = "inherit";
        commentContainer.addEventListener("mousemove", resizeCommentArea);
    }
}

function endDragHandler(event) {
    commentContainer.removeEventListener("mousemove", resizeCommentArea);
    event = event || window.event; // IE-ism
    event.preventDefault();
    if (event.button === 0) {
        ensureEventAttributes(event);
        commentAreaData.eX = event.pageX - parseInt(canvas.style.left.replace("px", ""));
        commentAreaData.eY = event.pageY - parseInt(canvas.style.top.replace("px", ""));
        commentAreaData.widthPdf = parseFloat(canvas.getAttribute("width"));
        commentAreaData.heightPdf = parseFloat(canvas.getAttribute("height"));

        if (commentAreaData.sX !== -1 && commentAreaData.sY !== -1 &&
            commentAreaData.eX !== -1 && commentAreaData.eY !== -1) {
            if (commentAreaData.sX !== commentAreaData.eX && commentAreaData.sY !== commentAreaData.eY) {
                createComment(commentArea);
            }
        }

        commentAreaData = {sX: -1, sY: -1, eX: -1, eY: -1, widthPdf: -1, heightPdf: -1};
        commentArea.style.top = 10 + "px";
        commentArea.style.left = 10 + "px";
        commentArea.style.width = 10 + "px";
        commentArea.style.height = 10 + "px";
        commentArea.style.display = "none";
        preventZoomAndMovement = false;
    }
}

function ensureEventAttributes(event) {
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
}

function resizeCommentArea(event) {
    if (commentAreaData.sX > -1 && commentAreaData.sY > -1) {
        ensureEventAttributes(event);
        let eventXRelativeCanvas = (event.pageX - parseInt(canvas.style.left.replace("px", "")));
        let eventYRelativeCanvas = (event.pageY - parseInt(canvas.style.top.replace("px", "")));
        let width = (eventXRelativeCanvas - commentAreaData.sX);
        let height = ((event.pageY - parseInt(canvas.style.top.replace("px", ""))) - commentAreaData.sY);
        if (commentAreaData.sX > eventXRelativeCanvas &&
            commentAreaData.sX !== eventXRelativeCanvas) {
            //pageX is right corner
            commentArea.style.left = eventXRelativeCanvas + "px";
            width = (commentAreaData.sX - eventXRelativeCanvas);
        }
        if (commentAreaData.sY > eventYRelativeCanvas &&
            commentAreaData.sY !== eventYRelativeCanvas) {
            //pageX is top corner
            commentArea.style.top = eventYRelativeCanvas + "px";
            height = (commentAreaData.sY - eventYRelativeCanvas);
        }
        commentArea.style.width = width + "px";
        commentArea.style.height = height + "px";
    }
}

function createComment(commentArea) {
    let xInPx = parseFloat(commentArea.style.left.replace("px", ""));
    let yInPx = parseFloat(commentArea.style.top.replace("px", ""));
    let wInPx = parseFloat(commentArea.style.width.replace("px", ""));
    let hInPx = parseFloat(commentArea.style.height.replace("px", ""));

    let xInCoords = (xInPx / commentAreaData.widthPdf).toPrecision(7);
    let yInCoords = (yInPx / commentAreaData.heightPdf).toPrecision(7);
    let wInCoords = (wInPx / commentAreaData.widthPdf).toPrecision(7);
    let hInCoords = (hInPx / commentAreaData.heightPdf).toPrecision(7);

    let commment = new Comment(pdfPageNumber, xInCoords, yInCoords, wInCoords, hInCoords,
        "Somebody", "Message....");
    comments.push(commment);
    //TODO upload Data to API

    let commentDiv = document.createElement("div");
    commentDiv.setAttribute("id", "comment" + comments.indexOf(commment));
    commentDiv.style.position = "absolute";
    commentDiv.style.left = (commment.x * canvas.getAttribute("width")) + "px";
    commentDiv.style.top = (commment.y * canvas.getAttribute("height")) + "px";
    commentDiv.style.width = (commment.w * canvas.getAttribute("width")) + "px";
    commentDiv.style.height = (commment.h * canvas.getAttribute("height")) + "px";
    commentDiv.style.backgroundColor = "rgba(61, 61, 61, 0.75)";
    commentDiv.style.borderRadius = "3px";
    commentDiv.style.outlineStyle = "outset";
    commentDiv.style.outlineColor = "rgb(250, 0, 0)";
    commentContainer.appendChild(commentDiv);
}

function resizeComments() {
    for (let index = 0; index < comments.length; index++) {
        let commentDiv = document.getElementById("comment" + index);
        let commment = comments[index];
        commentDiv.style.position = "absolute";
        commentDiv.style.left = (commment.x * canvas.getAttribute("width")) + "px";
        commentDiv.style.top = (commment.y * canvas.getAttribute("height")) + "px";
        commentDiv.style.width = (commment.w * canvas.getAttribute("width")) + "px";
        commentDiv.style.height = (commment.h * canvas.getAttribute("height")) + "px";
        commentDiv.style.backgroundColor = "rgba(61, 61, 61, 0.75)";
        commentDiv.style.borderRadius = "3px";
        commentDiv.style.outlineStyle = "outset";
        commentDiv.style.outlineColor = "rgba(250, 0, 0, 0.75)";
    }
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

function displayProgressOnBar() {
    let loadingBar = document.getElementById("loading");
    let lowBar = document.getElementById("lowbar");
    let marginRight = (loadingBar.style.right.replace("px", "") - lowBar.style.right.replace("px", ""));
    let marginLeft = (loadingBar.style.left.replace("px", "") - lowBar.style.left.replace("px", ""));
    loadingBar.style.width = percentLoaded * (lowBar.clientWidth - marginRight - marginLeft) + "px";
}

function loadPDFAndRender(scale, pdfFileOrUrl) {
    let loadingTask = pdfjsLib.getDocument(pdfFileOrUrl);
    console.log("Started loading pdf: " + loadingTask);
    loadingTask.onProgress = function (progress) {
        percentLoaded = Math.round(progress.loaded / progress.total);
        percentLoaded = percentLoaded > 0.01 ? percentLoaded : 0.01;
        percentLoaded = percentLoaded <= 0.99 ? percentLoaded : 1;
        displayProgressOnBar();
    };
    loadingTask.promise.then(function (localPdf) {
        pdf = localPdf;
        loadPdfPage(scale);
    }, function (reason) {
        // PDF loading error
        window.alert(reason);
    });
}

function loadPdfPage(scale) {
    pdf.getPage(pdfPageNumber).then(function (localPage) {
        pdfPage = localPage;
        renderPageFromPdf(scale);
    });
}

function renderPageFromPdf(scale) {
    if (!isRendering) {
        isRendering = true;
        let context = canvas.getContext('2d');
        let viewport = pdfPage.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
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
        canvas.style.height = canvas.height + "px";
        canvas.style.width = canvas.width + "px";
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
}

let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        setup();
    }
}, 10);