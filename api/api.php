<?php
require "../libs/auth.php";
//Veraltet
function check_format()
{
    if (!empty($_GET['format'])) {
        return filter_var($_GET['format'], FILTER_SANITIZE_STRING);
    }
}

function check_id()
{
    if (!empty($_GET['id'])) {
        return filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    }
}

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
} else if (!empty($_GET['getproject'])) {
    $value = filter_var($_GET['getproject'], FILTER_SANITIZE_STRING);
    $value = strtolower($value);
    if ($value == "id") {
        handleOutput("DEMO: 'getprojects' is not yet implemented :/");
    } else if ($value == "name") {
        handleOutput("DEMO: 'getprojects' is not yet implemented :/");
    } elseif ($value == "status") {
        handleOutput("DEMO: 'getprojects' is not yet implemented :/");
    } elseif ($value == "link") {
        handleOutput("DEMO: 'getprojects' is not yet implemented :/");
    } elseif ($value == "version") {
        handleOutput("DEMO: 'getprojects' is not yet implemented :/");
    } elseif ($value == "members") {
        handleOutput("DEMO: 'getprojects' is not yet implemented :/");
    } else {
        showError("Unknown value for parameter 'getproject=$value'", 400);
    }

} else if (isset($_GET['getproject'])) {
    //Demo logic:
    $id = (int)check_id();
    if (is_null($id)) {
        $id = -1;
    }
    handleOutput(array("project" => array("id" => $id, "name" => "demo", "status" => "demo", "link" => "demo", "version" => "demo", "members" => array(1, 2, 3))));
} else {
    showError("No or wrong parameters provided", 400);
}

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
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-ersion" => 1.2));
    handleOutput($err);
    die;
}

function handleOutput($o)
{
    if (check_format() == "raw") {
        header("Content-type:text/plain");
    } else {
        header("Content-type:application/json");
        $o = json_encode($o);
    }
    echo $o;
}

function getUser($value)
{
    if (isLoggedIn()) {
        $id = $_SESSION['user-id'];

        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $statement = $pdo->prepare("SELECT * FROM users WHERE pk_id = :pk_id");
        $result = $statement->execute(array('pk_id' => $id));
        $user = $statement->fetch();
        if ($value == "all") {
            return ["name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "avatar" => "../api/avatar.php?name=" . $user['name'], "projects" => [$user['projects']]];
        } else {
            return $user[$value];
        }
    }
    showError("Login to get the requested data", 401);
}

function getProject($value)
{
    $id = (int)check_id();
    if (!is_null($id)) {
        //TODO Database logic
    }

}
