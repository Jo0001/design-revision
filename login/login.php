<?php
require "../libs/auth.php";
if (isset($_GET['logout'])) {
    logOut();
    die;
}
if (isLoggedIn()) {
    //header("Location: ../app/CustumorDashboard.html");
    header("Location: ../simulate/dashboard.php");
    die;
}

if (!empty($_POST['password']) && !empty($_POST['email'])) {
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    if (!empty($_POST['returnto'])) {
        $url = urldecode(filter_var($_POST['returnto'], FILTER_SANITIZE_URL));
        if (strpos($url, 'http') !== false || strpos($url, 'https') !== false) {
            $url = null;
        }
        logIn($email, $password, $url);
    }
    logIn($email, $password, null);
}
