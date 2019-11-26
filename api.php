<?php

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

function showError($e)
{
    $e = "Error: " . $e;
    echo $e;
}

function showDemo()
{
    echo "Nice job you send a correct value for the parameter 'getuserdata'";
}
