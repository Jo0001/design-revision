//Setup-Libraries
var pdfjsLib = require('pdfjs-dist/build/pdf');
var pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

//Prevent a contextmenu on page, so people cant download the design.
document.body.addEventListener("contextmenu", function (e) {
    console.log("don't you dare download.")
    e.preventDefault();
    return false;
});

var canvas = document.getElementById('pdf');
renderPageFromPdf("test.pdf", 2);
dragElementWhenBtnIsDown(canvas, 1);


function dragElementWhenBtnIsDown(elmnt, btn) {
    var pos1 = 0, pos2 = 0, cursorXinView = 0, cursorYinView = 0;
    elmnt.addEventListener("mousedown", function (e) {
        if (e.button == btn) {
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
        if (e.button == btn) {
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", stopDragging);
        }
    }
}

function renderPageFromPdf(pdfFileOrLink, pageNumber) {
    var loadingTask = pdfjsLib.getDocument(pdfFileOrLink);
    loadingTask.promise.then(function (pdf) {
        console.log('PDF loaded');

        // Fetch the first page
        pdf.getPage(pageNumber).then(function (page) {
            console.log('Page loaded');

            var scale = 1;
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
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                console.log('Page rendered');
            });
        });
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}