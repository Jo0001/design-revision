<?php
$pdo = $GLOBALS['pdo'];//TODO UNUSED??

/*
 * Handle Output & Errors
 */
function showError($error, $code)
{
    $http_message = null;
    if ($code == 400) {
        header("HTTP/1.1 400 Bad Request");
        $http_message = "Bad Request";
    } elseif ($code == 401) {
        header('WWW-Authenticate: Login to get the requested data');
        header("HTTP/1.1 401 Unauthorized ");
        $http_message = "Unauthorized";
    } elseif ($code == 403) {
        header("HTTP/1.1 403 Forbidden");
        $http_message = "Forbidden";
    } elseif ($code == 404) {
        header("HTTP/1.1 404 Not Found");
        $http_message = "Not Found";
    } elseif ($code == 409) {
        header("HTTP/1.1 409 Conflict");
        $http_message = "Conflict";
    } elseif ($code == 500) {
        header("HTTP/1.1 500 Internal Server Error");
        $http_message = "Internal Server Error";
    }
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-version" => 2.8, "documentation" => "https://documenter.getpostman.com/view/9645782/SWLZgW2n"));
    handleOutput($err);
    die;
}

function handleOutput($o)
{
    header("Content-type:application/json");
    echo json_encode($o);
}

function isValidProject($id, $pdo)
{
    try {
        $statement = $pdo->prepare("SHOW TABLES IN design_revision LIKE 'project_%' ");
        $statement->execute();
        $row = $statement->fetchAll();
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
    $tables = array();
    for ($i = 0; $i < count($row); $i++) {
        //Store all table names in an array
        array_push($tables, $row[$i][0]);
    }
    if (in_array($id, $tables)) {
        return true;
    } else {
        return false;
    }
}

//Make sure you validate the id before calling this method
function getLatestProjectData($id, $pdo)
{
    try {
        $statement = $pdo->prepare("SELECT * FROM " . $id . " ORDER BY version DESC LIMIT 1 ");
        $statement->execute();
        return $statement->fetch();
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}


//$pid => project_id
function updateProjectMember($pid, $id, $role, $pdo)
{
    try {
        $statement = $pdo->prepare("SELECT members FROM " . $pid . " ORDER BY version DESC LIMIT 1 ");
        $statement->execute();
        $members = $statement->fetch()['members'];

        $members = json_decode($members);
        $member = array("id" => (int)$id, "role" => $role);
        array_push($members, $member);
        $statement = $pdo->prepare("UPDATE " . $pid . " SET members = ?  ORDER BY version DESC LIMIT 1 ");
        $statement->execute(array(json_encode($members)));
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}

//$id => Userid, $pid => project_id
function updateUserProjects($pdo, $id, $pid)
{
    try {
        //fetch all projectdata of the user
        $statement = $pdo->prepare("SELECT projects FROM `users` WHERE pk_id = ? ");
        $statement->execute(array($id));
        $tmpprojects = json_decode($statement->fetch()[0]);

        //and save the new project to the user
        if (!is_null($tmpprojects)) {
            array_push($tmpprojects, $pid);
        } else {
            $tmpprojects = array($pid);
        }
        $statement = $pdo->prepare("UPDATE `users` SET `projects` = ? WHERE `users`.`pk_id` = ?");
        $statement->execute(array(json_encode($tmpprojects), $id));
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}

//Returns the user data.
function getUser($value)
{
    if (isLoggedIn()) {
        $id = $_SESSION['user-id'];
        $pdo = $GLOBALS['pdo'];
        try {
            $statement = $pdo->prepare("SELECT * FROM users WHERE pk_id = :pk_id");
            $result = $statement->execute(array('pk_id' => $id));
            $user = $statement->fetch();

            if ($value == "all") {
                return ["id" => (int)$user['pk_id'], "name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "projects" => json_decode($user['projects'])];
            } else {
                return $user[$value];
            }
        } catch (PDOException $e) {
            showError("Something went really wrong", 500);
        }
    }
    showError("Login to get the requested data", 401);
}

function isMember($pid, $userid)
{
    $pdo = $GLOBALS['pdo'];
    $members = json_decode(getLatestProjectData($pid, $pdo)['members'], true);

    foreach ($members as $member) {
        if ($member['id'] == $userid) {
            return true;
        }
    }
    return false;//TODO NEEDS TESTING
}

function isAdmin($lastrow, $userid)
{
    $members = json_decode($lastrow['members'], true);
    foreach ($members as $member) {
        if ($member['id'] == $userid && $member['role'] == 1) {
            return true;
            break;
        } else {
            return false;
        }
    }
}

//Converts a 2 dimensional array to lowercase
function nestedLowercase($value)
{
    if (is_array($value)) {
        return array_map('nestedLowercase', $value);
    }
    return strtolower($value);
}

function emailToId($email)
{
    $pdo = $GLOBALS['pdo'];
    try {
        $statement = $pdo->prepare("SELECT pk_id FROM `users` WHERE email = ?");
        $statement->execute(array($email));
        $tmpid = $statement->fetch();
        return $tmpid[0];
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}

function IdToEmail($pdo, $id)
{
    try {
        $statement = $pdo->prepare("SELECT email from users where pk_id = ?");
        $statement->execute(array($id));
        return $statement->fetch()[0];
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}

function IdToName($pdo, $id)
{
    try {
        $statement = $pdo->prepare("SELECT name from users where pk_id = ?");
        $statement->execute(array($id));
        return $statement->fetch()[0];
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}

function informNewbie($email, $projectname, $name)
{
    $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/loginNewAccount.html?email=" . $email;
    sendMail($email, $email, "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenNew.html", $name, $link, $projectname, 1));
}

function changeStatus($pdo, $pid, $status)
{
    try {
        $statement = $pdo->prepare("UPDATE " . $pid . " SET status = ?, lastedit = CURRENT_TIMESTAMP ORDER BY version DESC LIMIT 1 ");
        $result = $statement->execute(array($status));
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}

//constants
//user:
define("INVITE", "INVITE");
define("REGISTERED", "REGISTERED");
define("VERIFIED", "VERIFIED");
//projects
define("WAITING_FOR_RESPONSE", "WAITING_FOR_RESPONSE");
define("TODO", "TODO");
define("IN_PROGRESS", "IN_PROGRESS");
define("DONE", "DONE");