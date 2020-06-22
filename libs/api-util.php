<?php
require_once("config.php");

/**
 * Shows the errors as an informative message
 * @param $error String as custom Error Message to display
 * @param $code int  HTTP Error Code
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
    if (apiDebug) {
        $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-version" => 2.8));
        handleOutput($err);
    } else {
        $err = array("error" => array("http-code" => $code, "http-message" => $http_message));
        handleOutput($err);
    }
    die;
}

/**
 * Formats the output to JSON and set also the Header to JSON
 * @param $o String | array to output as JSON encoded
 */
function handleOutput($o)
{
    header("Content-type:application/json");
    echo json_encode($o);
}

/**
 * Checks if the project exists
 * @param $id String ID of the Project (without project_)
 * @param $pdo PDO Object
 * @return bool true if project exists
 */
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

/**
 * Note: Make sure you validate the id before calling this
 * @param $id String ID of the Project (without project_)
 * @param $pdo PDO Object
 * @return mixed Last row of the project
 */
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

/**
 * Updates the projects of a user
 * @param $pid String Project-ID (with project_)
 * @param $id int User-ID
 * @param $role int Role (0 or 1)
 * @param $pdo PDO Object
 */
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

/**
 * @param $pdo  PDO Object
 * @param $id int User-ID
 * @param $pid String Project-ID (with project_)
 */
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

/**
 * @param $value String
 * @return array | int |String
 */
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

/**
 * Check if a user is a member of a project
 * @param $pid String Project-ID
 * @param $userid int User-ID
 * @return bool true if user is a member of the project
 */
function isMember($pid, $userid)
{
    $pdo = $GLOBALS['pdo'];
    $members = json_decode(getLatestProjectData($pid, $pdo)['members'], true);

    foreach ($members as $member) {
        if ($member['id'] == $userid) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a user has the admin role in a project
 * @param $lastrow
 * @param $userid int User-ID
 * @return bool true if the user is admin in the project
 */
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

/**
 * Converts a 2 dimensional array to lowercase
 * @param $value
 * @return array|string
 */
function nestedLowercase($value)
{
    if (is_array($value)) {
        return array_map('nestedLowercase', $value);
    }
    return strtolower($value);
}

/**
 * Converts an email to a user id
 * @param $email String
 * @return int User-ID
 */
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

/**
 * Converts the id to an email
 * @param $pdo
 * @param $id int
 * @return String User-Email
 */
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

/**
 * Converts the id of a user to a name
 * @param $pdo
 * @param $id int
 * @return String name
 */
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

/**
 * Informs users without an account about a new project
 * @param $email String
 * @param $projectname String
 * @param $name String
 */
function informNewbie($email, $projectname, $name)
{
    $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/signup.php?email=" . $email;
    sendMail($email, $email, "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenNew.html", $name, $link, $projectname, 1));
}

/**
 * Change the Status of a project
 * @param $pdo
 * @param $pid String
 * @param $status String
 */
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