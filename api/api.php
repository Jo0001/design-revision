<?php
require "../libs/auth.php";

function check_format()
{
    if (!empty($_GET['format'])) {
        $value = filter_var($_GET['format'], FILTER_SANITIZE_STRING);
        if ($value == "json") {
            return "json";
        }
    }
    return;
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
    } elseif ($value == "avatar") {
        handleOutput("DEMO: Avatar is not yet implemented :/");
    } elseif ($value == "projects") {
        handleOutput(getUser($value));
    } else {
        showError("Unknown value for parameter 'getuser=$value'", 400);
    }

} else {
    showError("No or wrong parameters provided", 400);
}
if (!empty($_GET['getproject'])) {
    $value = filter_var($_GET['getproject'], FILTER_SANITIZE_STRING);
    $value = strtolower($value);
    if ($value == "name") {
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

} else {
    showError("No or wrong parameters provided", 400);
}

function showError($error, $code)
{
    if ($code == 400) {
        header("HTTP/1.0 400 Bad Request");
    } elseif ($code == 401) {
        header('WWW-Authenticate: Login to get the requested data');
        header("HTTP/1.0 401 Unauthorized ");
    } elseif ($code == 403) {
        header("HTTP/1.0 403 Forbidden");
    } elseif ($code == 404) {
        header("HTTP/1.0 404 Not Found");
    }

    $error = "ERROR: " . $error;
    handleOutput($error);
}

function handleOutput($o)
{
    if (check_format() == "json") {
        header("Content-type:application/json");
        $o = json_encode($o);
    } else {
        header("Content-type:text/plain");
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
        return $user[$value];

    }
    showError("Unauthorized", 401);
}
