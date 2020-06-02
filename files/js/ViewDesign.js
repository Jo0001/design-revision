function setup() {

}


function pageTurned() {
}

let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        setupViewport();
        setup();
    }
}, 10);