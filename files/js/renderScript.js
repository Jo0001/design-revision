//Setup-Libraries
var pdfjsLib = require('pdfjs-dist/build/pdf');
var pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/*
global variables.
 */
let renderTask = "No Rendering";
pdfFileOrUrl = "../user-content/test.pdf";
pdfPageNumber = 2;

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
                renderPageFromPdf(pdfFileOrUrl, pdfPageNumber, this.scale);
            } else if (this.scale < this.innerTargetScale) {
                this.scale = parseFloat(this.scale + "") + 0.01;
                renderPageFromPdf(pdfFileOrUrl, pdfPageNumber, this.scale);
            } else if (this.scale === this.innerTargetScale) {
                if (this.handlerId > 0) {
                    clearInterval(this.handlerId);
                    //console.log("Removed Listener. " + this.handlerId + " " + (this.scale === this.innerTargetScale) + " " + this.scale + " " + this.innerTargetScale);
                    this.handlerId = -1;
                    renderPageFromPdf(pdfFileOrUrl, pdfPageNumber, this.scale);
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

var targetScaleHandler = new TargetScaleHandlerClass();

//Prevent a contextmenu on page, so people cant download the design.
document.body.addEventListener("contextmenu", function (e) {
    console.log("don't you dare download.");
    e.preventDefault();
    return false;
});

var canvas = document.getElementById('pdf');
canvas.addEventListener("mousewheel", listenForMouseWheelTurn, false);
canvas.addEventListener("DOMMouseScroll", listenForMouseWheelTurn, false);
renderPageFromPdf(pdfFileOrUrl, pdfPageNumber, 1);
dragElementWhenBtnIsDown(canvas, 1);


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
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    //console.log(delta);
    if (delta == 1) {
        targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) + 0.05;
    } else {
        targetScaleHandler.targetScale = parseFloat(targetScaleHandler.innerTargetScale) - 0.05;
    }
}

function renderPageFromPdf(pdfFileOrLink, pageNumber, scale) {
    if (renderTask == "No Rendering") {
        renderTask = "In Progress";
        var loadingTask = pdfjsLib.getDocument(pdfFileOrLink);
        loadingTask.promise.then(function (pdf) {
            //console.log('PDF loaded');
            // Fetch the first page
            pdf.getPage(pageNumber).then(function (page) {
                var viewport = page.getViewport({scale: scale});

                // Prepare canvas using PDF page dimensions
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    renderTask = "No Rendering";
                });
            });
        }, function (reason) {
            // PDF loading error
            console.error(reason);
        });
    } else {
        //console.log("Trying a render call without the previous one being done.")
    }
}