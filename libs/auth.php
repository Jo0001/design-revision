<?php
session_start();

function logIn($email, $password)
{
    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $statement->execute(array('email' => $email));
    $user = $statement->fetch();

    if ($user !== false && password_verify($password, $user['pswd'])) {
        $_SESSION['user-status'] = $user['status'];
        $_SESSION['user-log'] = "true";
        $_SESSION['user-id'] = $user['pk_id'];
        $_SESSION['user-time'] = date("d-m-Y h:i:s");
        header("Location: ../app/CustumorDashboard.html");
        die;
    } else {
        header("Location: ../login/login.html?err=1");
        die;
    }

}

function isLoggedIn()
{
    if (isset($_SESSION['user-status']) && isset($_SESSION['user-id']) && isset($_SESSION['user-log']) && isset($_SESSION['user-time']) && $_SESSION['user-log'] == "true") {
        //TODO Needs testing
        $date1 = strtotime($_SESSION["user-time"]);
        $date2 = strtotime(date("d-m-Y h:i:s"));
        $diff = abs($date2 - $date1) / 60 / 60 / 24;
        if ($diff >= 1) {
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
    header("Location: ../login/login.html?logout=true");
    die;
}