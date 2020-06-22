let currentlyWorkingBtn;
function setup() {
    currentlyWorkingBtn = document.getElementById("currentlyWorking");

    currentlyWorkingBtn.addEventListener("click", function (e) {
        let status = "IN_PROGRESS";
        let requestStatusChange = new XMLHttpRequest();
        requestStatusChange.withCredentials = true;
        let data = "id=" + projectId + "&status=" + status;
        requestURL = window.location.origin + "/design-revision/api/project/updatestatus";
        document.getElementById("mes-btn").removeEventListener("click", reload);
        requestStatusChange.onreadystatechange = function () {
            if (requestStatusChange.readyState === 4 && requestStatusChange.status === 204) {
                showmes("info", "Sie werden auf das Dashborad weitergeleitet um dort den neuen Designvorschlag hochzuladen");
                sleep(5000).then(function () {
                    window.location = window.origin + "/design-revision/app/";
                });
            } else if (requestStatusChange.readyState === 4 && requestStatusChange.status === 409) {
                showmes("error", "Sie können wegen dem aktuellen Projekt-Status keine Änderungen am Design machen");
            }
        };
        requestStatusChange.open('PUT', requestURL);
        requestStatusChange.send(data);
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

function loaded() {
    if (project != null && user != null) {
        let projectMembers = project.members;
        for (let i = 0; i < projectMembers.length; i++) {
            if (projectMembers[i].id === user.id) {
                if (parseInt(projectMembers[i].role) === 1) {
                    if (project.status === "TODO") {
                        currentlyWorkingBtn.style.display = null;
                        currentlyWorkingBtn.style.left = ((document.body.clientWidth - currentlyWorkingBtn.clientWidth) / 2) + "px";
                    }
                }
            }
        }
    }
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