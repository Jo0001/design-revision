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
        if (val < 0.4 && this.innerTargetScale !== val) {
            this.innerTargetScale = 0.4;
            this.timeSinceResize = 10000;
            this.updateScale();
        } else if (val > 4.5 && this.innerTargetScale !== val) {
            this.innerTargetScale = 4.5;
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

//Rendering-Variables
let canvas;
let pdf;
let pdfPage = undefined;
let pdfFileOrUrl = "../user-content/test4.pdf";
let targetScaleHandler = new TargetScaleHandlerClass();
let pdfPageNumber;
let isRendering = false;
let firstTimeDisplay = true;
let context;
let preventZoomAndMovement = false;
let viewport;
//Comment-Variables
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
let percentLoaded;
//Page-Turn-Logic
let decPage;
let incPage;

function setupViewport() {
    //Prevent a contextmenu on page, so people cant download the design.
    document.body.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });
    //Rescale Loading bar so we cant get over 100%
    window.addEventListener('resize', displayProgressOnBar);
    //Get dom elements
    pdfPageNumber = document.getElementById("currentPage");
    decPage = document.getElementById("decPage");
    incPage = document.getElementById("incPage");
    canvas = document.getElementById('pdf');
    let titleCard = document.getElementById("titleCard");

    //Turn-Page-Logic
    pdfPageNumber.addEventListener("click", function () {
        pdfPageNumber.value = "";
    });
    pdfPageNumber.addEventListener("input", function () {
        clearComments();
        loadPdfPage(targetScaleHandler.scale);
    });
    decPage.addEventListener("click", function () {
        pdfPageNumber.value = parseInt(pdfPageNumber.value) - 1;
        clearComments();
        loadPdfPage(targetScaleHandler.scale);
    });
    incPage.addEventListener("click", function () {
        pdfPageNumber.value = parseInt(pdfPageNumber.value) + 1;
        clearComments();
        loadPdfPage(targetScaleHandler.scale);
    });

    //Canvas-Setup
    canvasObserver.observe(canvas, {attributes: true});
    canvas.addEventListener("wheel", listenForMouseWheelTurn, false);
    canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
    dragElementWhenBtnIsDown(canvas, 1);
    context = canvas.getContext('2d');

    //Comment-Setup
    commentContainer = document.getElementById('commentContainer');
    commentContainerObserver.observe(commentContainer, {attributes: true});
    redirectAllEvents(canvas, commentContainer);

    //Demo-Data
    let projectId = getURLParameter('id');
    if (projectId === "") {
        projectId = "20ced965";
        console.log("Using demo Project id=20ced965, because I received no parameter projectId.")
    }

    //Request Project-Data from API
    let requestURL = window.location.origin + "/design-revision/api/?getproject&id=" + projectId;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.send();
    request.addEventListener('readystatechange', function (e) {
        handleServerResponse(request, function (response) {
            titleCard.innerText = titleCard.innerHTML.replace("/", response.project.name);
        });
    });

    //Json PDF aus Api hohlen
    let request2 = new XMLHttpRequest();
    requestURL = window.location.origin + "/design-revision/api/?getproject=data&id=" + projectId;
    request2.open('GET', requestURL);
    request2.send();
    request2.addEventListener('readystatechange', function (e) {
        handleServerResponse(request2, function (response) {
            pdfFileOrUrl = "../user-content/" + response.link;
            loadPDFAndRender(1, pdfFileOrUrl);
        });
    });

    //Viewport-Movement
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

    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [undefined, ""])[1]);
        return (value !== 'null') ? value : undefined;
    }
}


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


function clearComments() {
    for (let index = 0; index < comments.length; index++) {
        let commentDiv = document.getElementById("comment" + index);
        commentDiv.remove();
    }
    comments = [];
    //TODO Request Comments for page from api
}

function setCommentAttributes(commentDiv, comment) {
    commentDiv.style.position = "absolute";
    commentDiv.style.left = (comment.x * commentContainer.style.width.replace("px", "")) + "px";
    commentDiv.style.top = (comment.y * commentContainer.style.height.replace("px", "")) + "px";
    commentDiv.style.width = (comment.w * commentContainer.style.width.replace("px", "")) + "px";
    commentDiv.style.height = (comment.h * commentContainer.style.height.replace("px", "")) + "px";
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


function displayProgressOnBar() {
    let loadingBar = document.getElementById("loading");
    let lowBar = document.getElementById("loadingBar");
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
        document.getElementById("lastPage").value = pdf.numPages;
        loadPdfPage(scale);
    }, function (reason) {
        // PDF loading error
        window.alert(reason);
    });
}

function loadPdfPage(scale) {
    if (pdfPageNumber.value !== undefined) {
        let num = parseInt(pdfPageNumber.value);
        num = num >= 1 ? num : 1;
        num = num <= pdf.numPages ? num : pdf.numPages;
        pdfPageNumber.value = num;
        pdf.getPage(parseInt(pdfPageNumber.value)).then(function (localPage) {
            pdfPage = localPage;
            renderIfReady(scale);
        });
    }
}


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