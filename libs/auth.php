<?php
require "util.php";
require_once "config.php";
session_start();

$pdo = null;
try {
    $pdo = new PDO(dbDsn, dbUsername, dbPassword);

} catch (PDOException $e) {
    header("HTTP/1.1 500 Internal Server Error");
    die;
}

function logIn($email, $password, $location)
{
    try {
        $statement = $GLOBALS['pdo']->prepare("SELECT * FROM users WHERE email = :email");
        $result = $statement->execute(array('email' => $email));
        $user = $statement->fetch();

        if ($user !== false && password_verify($password, $user['pswd'])) {
          //  $_SESSION['user-status'] = $user['status']; //TODO Not used??
            $_SESSION['user-log'] = "true";
            $_SESSION['user-id'] = $user['pk_id'];
            date_default_timezone_set('Europe/Berlin');
            $_SESSION['user-time'] = date("Y-m-d H:i:s");

            $_SESSION['sec-hash'] = hash("ripemd160",$_SESSION['user-log'] . $_SESSION['user-id'] . $_SESSION['user-time']);

            if (is_null($location)) {
                $location = "../app/";
            }
            header("Location: $location");
            die;
        } else {
            header("Location: ../login/?err=1");
            die;
        }
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }

}

function isLoggedIn()
{
    if ( isset($_SESSION['user-id']) && isset($_SESSION['user-log']) && isset($_SESSION['user-time']) && $_SESSION['user-log'] === "true") {
        date_default_timezone_set('Europe/Berlin');
        $currentdate = date("Y-m-d H:i:s");
        $usertime = $_SESSION['user-time'];
        $diff = dateDifference($usertime, $currentdate);

        if ($diff < 86400 && $_SESSION['sec-hash'] === hash("ripemd160",$_SESSION['user-log'] . $_SESSION['user-id'] . $_SESSION['user-time'])) {
            return true;
        } else {
            logout();
            return false;
        }
    }
}

function logOut()
{
    session_unset();
    session_destroy();
    header("Location: ../login/?success=logout");
    die;
}

function getCurrentURL()
{
    return urlencode(filter_var($_SERVER['REQUEST_URI'], FILTER_SANITIZE_URL));
}