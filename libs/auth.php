<?php
require "util.php";
session_start();

function logIn($email, $password, $location)
{
    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $statement->execute(array('email' => $email));
    $user = $statement->fetch();

    if ($user !== false && password_verify($password, $user['pswd'])) {
        $_SESSION['user-status'] = $user['status'];
        $_SESSION['user-log'] = "true";
        $_SESSION['user-id'] = $user['pk_id'];
        date_default_timezone_set('Europe/Berlin');
        $_SESSION['user-time'] = date("Y-m-d H:i:s");
        if (is_null($location)) {
            $location = "../simulate/dashboard.php";
        }
        header("Location: $location");
        die;
    } else {
        header("Location: ../login/?err=1");
        die;
    }

}

function isLoggedIn()
{
    if (isset($_SESSION['user-status']) && isset($_SESSION['user-id']) && isset($_SESSION['user-log']) && isset($_SESSION['user-time']) && $_SESSION['user-log'] == "true") {
        date_default_timezone_set('Europe/Berlin');
        $currentdate = date("Y-m-d H:i:s");
        $usertime = $_SESSION['user-time'];
        $diff = dateDifference($usertime, $currentdate);
        if ($diff > 86400) {
            logout();
            return false;
        } else {
            return true;
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