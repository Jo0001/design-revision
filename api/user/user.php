<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
if (!empty($_GET['id']) && !empty($_GET['pid'])) {
    $id = filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    $pid = "project_" . filter_var($_GET['pid'], FILTER_SANITIZE_STRING);
    if (isLoggedIn()) {
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        if (isValidProject($pid, $pdo)) {
            if (isMember($pid, getUser('pk_id')) && isMember($pid, (int)$id)) {
                handleOutput(array("user"=>array("name"=>getUser('name'),"company"=>getUser('company'),"email"=>getUser('email'))));
            } else {
                showError("Not a member", 403);
            }
        } else {
            showError("Invalid Project", 400);
        }
    } else {
        showError("Login to see this data", 401);
    }

} else {
    //Output for current user
    handleOutput(array("user" => getUser("all")));
}
