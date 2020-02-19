<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
require "../../libs/sendEmail.php";

$page = explode("?", basename(filter_var($_SERVER['REQUEST_URI']), FILTER_SANITIZE_URL))[0];

$_PUT = null;
parse_str(file_get_contents('php://input'), $_PUT);

if ($page === "addmember") {
    addmember();
} elseif ($page === "removemember") {
    removemember();
} elseif ($page === "updatecomments" || $page === "addcomments") {
    //TODO Change to addcomments
    addComments();
} elseif ($page === "solvecomment") {
    solveComment();
} elseif ($page === "updatestatus") {
    updateStatus();
} elseif ($page === "updatefile") {
    updateFile();
} else {
    showError("Bad Request", 400);
}

function addComments()
{

    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['comment'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $pid = "project_" . $pid;

        //Check if user is logged in and a projectmember
        if (isLoggedIn() && isValidProject($pid, $pdo) && isMember($pid, getUser('pk_id'))) {

            $data = filter_var($GLOBALS['_PUT']['comment'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
            //Check if JSON is valid
            if (!isJson($data)) {
                showError("No JSON Data", 400);
            }

            $statement = $pdo->prepare("SELECT data FROM " . $pid . " ORDER BY version DESC LIMIT 1 ");
            $statement->execute();
            $tmpdata = $statement->fetch()[0];

            //Check if entry of db is empty/null
            $newdata = array(json_decode($data, true));
            if (!is_null($tmpdata)) {
                $olddata = json_decode($tmpdata, true);
                $result = array_merge($olddata, $newdata);
            } else {
                $result = $newdata;
            }
            $statement = $pdo->prepare("UPDATE " . $pid . " SET data = ?  ORDER BY version DESC LIMIT 1 ");
            $statement->execute(array(json_encode($result)));
            header("HTTP/1.1 204 No Content");

        } else {
            showError("Not logged in/ project member", 401);
        }
    } else {
        showError("Invalid Request", 400);
    }
}

function addmember()
{
    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['member'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $member = filter_var($GLOBALS['_PUT'] ['member'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

        $pid = "project_" . $pid;
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');

        if (isLoggedIn()) {

            if (isValidProject($pid, $pdo) && isJson($member)) {
                if (isAdmin(getLatestProjectData($pid, $pdo), getUser('pk_id'))) {

                    $statement = $pdo->prepare("SELECT email FROM `users` ");
                    $statement->execute();
                    $tmpmails = $statement->fetchAll();
                    //Create a one dimensional array with all emails from the db
                    $useremails = array();
                    foreach ($tmpmails as $tmp) {
                        array_push($useremails, $tmp['email']);
                    }

                    //convert json post to php array format
                    $member = json_decode($member, true);

                    //Remove double entries from the array//TODO Really needed??
                    $member = array_unique($member, SORT_REGULAR);

                    $role = $member['role'];

                    $projectname = getLatestProjectData($pid, $pdo)['p_name'];


                    //Converts everything to lowercase
                    $member = array_map('nestedLowercase', $member);

                    //check if user has already an account
                    if (in_array($member['email'], $useremails)) {
                        $id = emailToId($member['email']);

                        if (isMember($pid, $id)) {
                            showError("Is already a member", 400);
                        }

                        updateUserProjects($pdo, $id, $pid);

                        //Save the new user as member to the project
                        updateProjectMember($pid, $id, $role, $pdo);

                        $statement = $pdo->prepare("SELECT * FROM `users` WHERE pk_id = ?");
                        $statement->execute(array($id));
                        $results = $statement->fetch();
                        $name = $results['name'];
                        $status = $results['status'];
                        //Inform user per email about the new project
                        if ($status == "INVITE") {
                            informNewbie($member['email'], $projectname);
                        } else {
                            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/simulate/edit.php?id=" . $pid;
                            sendMail($member['email'], $name, "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenAcc.html", $name, $link, $projectname, 1));
                        }

                    } else {
                        $pid = explode("project_", $pid)[1];
                        $statement = $pdo->prepare("INSERT INTO `users` (`pk_id`, `name`, `company`, `email`, `pswd`, `projects`, `status`, `token`, `token_timestamp`) VALUES (NULL, '', NULL, ?, '', ?, 'INVITE', NULL, CURRENT_TIMESTAMP)");
                        $statement->execute(array($member['email'], json_encode(array($pid))));

                        //Save the new user as member to the project
                        updateProjectMember($pid, (int)$pdo->lastInsertId(), $role, $pdo);

                        informNewbie($member['email'], $projectname);
                    }

                    handleOutput("Successful added member ");

                } else {
                    showError("Not member/ not an admin", 403);
                }
            } else {
                showError("Invalid Request", 400);
            }
        } else {
            showError("Login to perform that action", 401);
        }

    } else {
        showError("Missing id/member data", 400);
    }
}

function removemember()
{
    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['member'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $member = filter_var($GLOBALS['_PUT'] ['member'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
    } else {
        showError("Missing id/member data", 400);
    }
    handleOutput("Just a demo without real logic");
}

function updateStatus()
{
    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['status'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $status = filter_var($GLOBALS['_PUT'] ['status'], FILTER_SANITIZE_STRING);
        handleOutput("Just a demo without logic");
    } else {
        showError("Missing project id/status", 400);
    }

}

function updateFile()
{
    if (isset($GLOBALS['_PUT'] ['id'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        handleOutput("Just a demo without logic");
    } else {
        showError("Missing project id", 400);
    }
}

function solveComment()
{
    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['comment'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $cid = filter_var($GLOBALS['_PUT'] ['comment'], FILTER_SANITIZE_STRING);
        handleOutput("Just a demo without logic");
    } else {
        showError("Missing project/comment id", 400);
    }

}