<?php
$pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');


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
    } elseif ($code == 500) {
        header("HTTP/1.1 500 Internal Server Error");
        $http_message = "Internal Server Error";
    }
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-version" => 2.0));
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
    $statement = $pdo->prepare("SHOW TABLES IN design_revision LIKE 'project_%' ");
    $statement->execute();
    $row = $statement->fetchAll();
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
    $statement = $pdo->prepare("SELECT * FROM " . $id . " ORDER BY version DESC LIMIT 1 ");
    $statement->execute();
    return $statement->fetch();
}


//$pid => project_id
function updateProjectMember($pid, $id, $role, $pdo)
{
    $statement = $pdo->prepare("SELECT members FROM " . $pid . " ORDER BY version DESC LIMIT 1 ");
    $statement->execute();
    $members = $statement->fetch()['members'];

    $members = json_decode($members);
    $member = array("id" => (int)$id, "role" => $role);
    array_push($members, $member);
    $statement = $pdo->prepare("UPDATE " . $pid . " SET members = ?  ORDER BY version DESC LIMIT 1 ");
    $statement->execute(array(json_encode($members)));
}

//$id => Userid, $pid => project_id
function updateUserProjects($pdo, $id, $pid)
{
    $pid = explode("project_", $pid)[1];
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

}

//Returns the user data.
function getUser($value)
{
    if (isLoggedIn()) {
        $id = $_SESSION['user-id'];
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $statement = $pdo->prepare("SELECT * FROM users WHERE pk_id = :pk_id");
        $result = $statement->execute(array('pk_id' => $id));
        $user = $statement->fetch();
        if ($value == "all") {
            return ["id" => (int)$user['pk_id'], "name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "avatar" => "../api/user/avatar.php?name=" . $user['name'][0], "projects" => json_decode($user['projects'])];
        } else {
            return $user[$value];
        }
    }
    showError("Login to get the requested data", 401);
}

function isMember($pid, $userid)
{
    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $members = json_decode(getLatestProjectData($pid, $pdo)['members'], true);

    foreach ($members as $member) {
        if ($member['id'] == $userid) {
            return true;
        }
    }

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
    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $statement = $pdo->prepare("SELECT pk_id FROM `users` WHERE email = ?");
    $statement->execute(array($email));
    $tmpid = $statement->fetch();
    return $tmpid[0];
}

function isJson($string)
{
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function informNewbie($email, $projectname)
{
    $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/loginNewAccount.html?email=" . $email;
    sendMail($email, $email, "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenNew.html", null, $link, $projectname, 1));
}