<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";

function check_id()
{
    if (!empty($_GET['id'])) {
        return filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    }
}


$id = check_id();
if (!is_null($id)) {
    if (isLoggedIn()) {
        $id = "project_" . $id;
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        if (isValidProject($id, $pdo)) {
            $project = getLatestProjectData($id, $pdo);
            if (explode("?", basename($_SERVER['REQUEST_URI']))[0] == "data") {
                handleOutput(array("link" => $project['link'], "data" => $project['data']));
            } else {
                handleOutput(array("project" => array("name" => $project['p_name'], "status" => $project['status'], "version" => (int)$project['version'], "lastedit" => $project['lastedit'], "members" => json_decode($project['members']))));
            }
        } else {
            showError("Invalid Request", 400);
        }
    } else {
        showError("Login to get the requested data", 401);
    }
} else {
    showError("Missing id, please specify it with ?id=value", 400);
}
