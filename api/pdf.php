<?php
require "../libs/auth.php";
if(isLoggedIn()&& !empty($_GET['file'])) {
    //TODO Check if user is projectmember
    $file =  "../user-content/".filter_var($_GET['file'], FILTER_SANITIZE_STRING);

    if (file_exists($file)) {
        header('Content-type: application/pdf');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . filesize($file));
        header('Accept-Ranges: bytes');
        @readfile($file);
    } else {
        header("HTTP/1.1 404 Not Found");
        die;
    }
}else {
    header('WWW-Authenticate: Login to get the requested data');
    header("HTTP/1.1 401 Unauthorized ");
    die;
}