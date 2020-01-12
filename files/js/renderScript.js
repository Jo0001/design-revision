//Setup-Libraries
let pdfjsLib = require('pdfjs-dist/build/pdf');
let pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

class TargetScaleHandlerClass {
    constructor() {
        this.innerTargetScale = 1;
        this.scale = 0.9;
        this.handlerId = -1;
        this.round = function round(num) {
            return parseFloat(num + "").toFixed(6);
        }
        this.check = function check() {
            this.scale = this.round(this.scale);
            this.innerTargetScale = this.round(this.innerTargetScale);
            if (this.scale > this.innerTargetScale) {
                this.scale = parseFloat(this.scale + "") - 0.01;
                this.scale = this.round(this.scale);
                renderPageFromPdf(this.scale);
            } else if (this.scale < this.innerTargetScale) {
                this.scale = parseFloat(this.scale + "") + 0.01;
                this.scale = this.round(this.scale);
                renderPageFromPdf(this.scale);
            } else if (this.scale === this.innerTargetScale) {
                if (this.handlerId > 0) {
                    clearInterval(this.handlerId);
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

let pdfFileOrUrl = "../user-content/test4.pdf";
let pdfPageNumber = 101;
let canvas;
let pdfPage = undefined;
let isRendering = false;

let request = new XMLHttpRequest();
let targetScaleHandler = new TargetScaleHandlerClass();

function setup() {
    //Prevent a contextmenu on page, so people cant download the design.
    document.body.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });

    canvas = document.getElementById('pdf');
    canvas.addEventListener("mousewheel", listenForMouseWheelTurn, false);
    canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
    dragElementWhenBtnIsDown(canvas, 1);

    let projectId = getURLParameter('id');
    if (projectId == undefined) {
        projectId = 2;
        window.alert("Using demo Project, because I received no parameter projectId.")
    }
    //Json user Object aus Api hohlen
    let requestURL = "/design-revision/api/?getproject=data&id=" + projectId;
    request.open('GET', requestURL);
    request.send();
    request.onreadystatechange = function (e) {
        if (request.readyState === 4 && request.status === 200) {
            let projectObject = JSON.parse(request.response);
            //pdfFileOrUrl = projectObject.link;
            window.alert(pdfFileOrUrl);
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

function getURLParameter(name) {
    let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
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
        // calculate the new cursor position:
        pos1 = cursorXinView - e.clientX;
        pos2 = cursorYinView - e.clientY;
        cursorXinView = e.clientX;
        cursorYinView = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
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
    loadingTask.promise.then(function (localPdf) {
        //console.log('PDF loaded');
        let pdf = localPdf;
        loadPdfPage(pdf, scale);
    }, function (reason) {
        // PDF loading error
        console.error(reason);
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