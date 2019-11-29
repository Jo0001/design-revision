<?php
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
    if ($value == "logged-in") {
        showDemo();
    } elseif ($value == "name") {
        showDemo();
    } elseif ($value == "email") {
        showDemo();
    } elseif ($value == "company") {
        showDemo();
    } elseif ($value == "avatar") {
        showDemo();
    } elseif ($value == "projects") {
        showDemo();
    } else {
        showError("Unknown value for parameter 'getuser=$value'", 400);
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

function showDemo()
{
    handleOutput("DEMO: Nice job the 'getuser' request was successful");
}
