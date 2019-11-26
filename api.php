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
        showError("Unknown value for parameter 'getuserdata=$value'");
    }

}

function showError($error)
{
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
