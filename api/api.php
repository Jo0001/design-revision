<?php
require "../libs/auth.php";
$method = filter_var($_SERVER['REQUEST_METHOD'],FILTER_SANITIZE_STRING);

function check_id()
{
    if (!empty($_GET['id'])) {
        return filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    }
}

/*
 * GET USER
 */
if (!empty($_GET['getuser'])) {
    $value = filter_var($_GET['getuser'], FILTER_SANITIZE_STRING);
    $value = strtolower($value);
    if ($value == "name") {
        handleOutput(getUser($value));
    } elseif ($value == "email") {
        handleOutput(getUser($value));
    } elseif ($value == "company") {
        handleOutput(getUser($value));
    } elseif ($value == "status") {
        handleOutput(getUser($value));
    } elseif ($value == "avatar") {
        handleOutput("../api/avatar.php?name=" . getUser("name"));
    } elseif ($value == "projects") {
        handleOutput(getUser($value));
    } else {
        showError("Unknown value for parameter 'getuser=$value'", 400);
    }
} else if (isset($_GET['getuser'])) {
    handleOutput(array("user" => getUser("all")));
    /*
    * GET PROJECT
    */
} else if (isset($_GET['getproject'])) {
    getProject();
    /*
     * POST PROJECT
     */
} else if (!empty($_POST['createproject'])) {
    //TODO Return on success 201 Created
    handleOutput("createproject demo");
} else {
    showError("No or wrong parameters provided", 400);
}

/*
 * Handle Output & Errors
 */
function showError($error, $code)
{
    $http_message = null;
    if ($code == 400) {
        header("HTTP/1.0 400 Bad Request");
        $http_message = "Bad Request";
    } elseif ($code == 401) {
        header('WWW-Authenticate: Login to get the requested data');
        header("HTTP/1.0 401 Unauthorized ");
        $http_message = "Unauthorized";
    } elseif ($code == 403) {
        header("HTTP/1.0 403 Forbidden");
        $http_message = "Forbidden";
    } elseif ($code == 404) {
        header("HTTP/1.0 404 Not Found");
        $http_message = "Not Found";
    }
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-ersion" => 1.3));
    handleOutput($err);
    die;
}

function handleOutput($o)
{
    header("Content-type:application/json");
    echo json_encode($o);
}

/*
 * DATABASE LOGIC
 */
function getUser($value)
{
    if (isLoggedIn()) {
        $id = $_SESSION['user-id'];
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $statement = $pdo->prepare("SELECT * FROM users WHERE pk_id = :pk_id");
        $result = $statement->execute(array('pk_id' => $id));
        $user = $statement->fetch();
        if ($value == "all") {
            return ["name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "avatar" => "../api/avatar.php?name=" . $user['name'], "projects" => json_decode($user['projects'])];
        } else {
            return $user[$value];
        }
    }
    showError("Login to get the requested data", 401);
}

function getProject()
{
    $id = check_id();
    if (!is_null($id)) {
        if (isLoggedIn()) {
            $id = (int)$id;
            if (in_array($id, json_decode(getUser("projects")))) {
                $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
                $statement = $pdo->prepare("SELECT * FROM projects WHERE pd_id = :pd_id");
                $result = $statement->execute(array('pd_id' => $id));
                $project = $statement->fetch();
                if (!empty($project)) {
                    handleOutput(array("project" => array("id" => $id, "name" => $project['name'], "status" => $project['status'], "link" => "demo", "version" => ++$id, "members" => json_decode($project['members']))));
                } else {
                    showError("Found no project with id " . $id, 404);
                }
            } else {
                showError("You are not allowed to view this", 403);
            }
        } else {
            showError("Login to get the requested data", 401);
        }
    } else {
        showError("Missing id, please specify it with &id=value", 400);
    }
}
