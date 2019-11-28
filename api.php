<?php
function check_format()
{
    if (!empty($_POST['format'])) {
        $value = filter_var($_POST['format'], FILTER_SANITIZE_STRING);
        if ($value == "json") {
            return "json";
        }
    }
    return;
}

if (!empty($_POST['getuserdata'])) {
    $value = filter_var($_POST['getuserdata'], FILTER_SANITIZE_STRING);
    if ($value == "logged-in") {
        showDemo();
    } elseif ($value == "name") {
        showDemo();
    } elseif ($value == "email") {
        showDemo();
    } elseif ($value == "company") {
        showDemo();
    } elseif ($value == "projects") {
        showDemo();
    } else {
        showError("Unknown value for parameter 'getuserdata=$value'", 400);
    }

} else {
    showError("No parameters provided", 400);
}

function showError($error, $code)
{
    if ($code == 404) {
        header("HTTP/1.0 404 Not Found");
    } elseif ($code == 401) {
        header('WWW-Authenticate: Login to get the requested data');
        header("HTTP/1.0 401 Unauthorized ");
    } else {
        header("HTTP/1.0 400 Bad Request");
    }

    $error = "Error: " . $error;
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
    handleOutput("Nice job the 'getuserdata' request was successful");
}
