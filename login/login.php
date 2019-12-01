<?php
require "../libs/auth.php";
if (isset($_GET['logout'])) {
    logOut();
    die;
}
if(isLoggedIn()){
    header("Location: ../app/CustumorDashboard.html");
    die;
}
//TODO check if user is logged in
if (!empty($_POST['password']) && !empty($_POST['email'])) {
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);
    logIn($email, $password);
}
