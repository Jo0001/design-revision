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
            //TODO CHeck if is member!!
            $project = getLatestProjectData($id, $pdo);
            if (isMember($id, getUser('pk_id'))) {
                $page = explode("?", basename(filter_var($_SERVER['REQUEST_URI']), FILTER_SANITIZE_URL))[0];
                if ($page == "data") {
                    handleOutput(array("link" => $project['link'], "data" => $project['data']));
                } else if ($page == "history") {
                    $statement = $pdo->prepare("SELECT link, lastedit FROM " . $id);
                    $statement->execute();
                    $history = array();
                    foreach ($statement->fetchAll() as $tmp) {
                        array_push($history, array("link" => $tmp['link'], "lastedit" => $tmp['lastedit']));
                    }
                    handleOutput($history);
                } else {
                    handleOutput(array("project" => array("name" => $project['p_name'], "status" => $project['status'], "version" => (int)$project['version'], "lastedit" => $project['lastedit'], "members" => json_decode($project['members']))));
                }
            } else {
                showError("Not a member", 403);
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

function showHistory()
{

}