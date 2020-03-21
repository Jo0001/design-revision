<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
if (!empty($_GET['id']) && !empty($_GET['pid'])) {
    $id = filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    $pid = "project_" . filter_var($_GET['pid'], FILTER_SANITIZE_STRING);
    if (isLoggedIn()) {
        $pdo = $GLOBALS['pdo'];
        if (isValidProject($pid, $pdo)) {
            if (isMember($pid, getUser('pk_id')) && isMember($pid, (int)$id)) {
                $statement = $pdo->prepare("SELECT * FROM users WHERE pk_id = :pk_id");
                $result = $statement->execute(array('pk_id' => $id));
                $user = $statement->fetch();
                handleOutput(array("user" => array("name" => $user['name'], "company" => $user['company'], "email" => $user['email'])));
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
