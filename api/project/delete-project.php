<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";

$_DELETE = null;
parse_str(file_get_contents('php://input'), $_DELETE);
if (isset($_DELETE['id'])) {
    $id = "project_" . filter_var($_DELETE['id'], FILTER_SANITIZE_STRING);

    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    if (isValidProject($id, $pdo) && getUser('status') == "VERIFIED") {
        $userid = getUser("pk_id");
        if (isAdmin(getLatestProjectData($id, $pdo), $userid)) {
            $statement = $pdo->prepare("SELECT link FROM " . $id);
            $statement->execute();
            $link = $statement->fetchAll();
            $target_dir = "../user-content/";
            for ($i = 0; $i < count($link); $i++) {
                //deletes all project files
                unlink($target_dir . $link[$i][0]);
            }

            $tmpproject = getLatestProjectData($id, $pdo);
            $tmpmembers = json_decode($tmpproject['members'], true);
            $ids = array_column($tmpmembers, 'id', "");

            foreach ($ids as $tmp) {
                $statement = $pdo->prepare("SELECT projects FROM users WHERE pk_id =? ");
                $statement->execute(array($tmp));
                $projects = $statement->fetch()[0];
                $projects = json_decode($projects);
                //delete Project from user-projects array and reformat the array
                unset($projects[array_search(filter_var($_DELETE['id'], FILTER_SANITIZE_STRING), $projects)]);
                $projects = array_values($projects);
                //save the new project array to the users-projects
                $statement = $pdo->prepare("UPDATE `users` SET `projects` = ? WHERE `users`.`pk_id` = ?");
                $statement->execute(array(json_encode($projects), $tmp));
            }

            header("HTTP/1.1 204 No Content ");
        } else {
            showError("You are not allowed to delete this", 403);
        }
    } else {
        showError("Invalid Request", 400);
    }
} else {
    showError("Missing id, please specify it with &id=value", 400);
}