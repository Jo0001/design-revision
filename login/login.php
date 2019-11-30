<?php
session_start();
$pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
//TODO check if user is logged in
if (!empty($_POST['password']) && !empty($_POST['email'])) {
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);

    $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $statement->execute(array('email' => $email));
    $user = $statement->fetch();

    if ($user !== false && password_verify($password, $user['pswd'])) {
        $_SESSION['user-log-status'] = $user['status'];
        $_SESSION['user-id'] = $user['pk_id'];
        //TODO redirect to Dashboard
        die('Login successful');
    } else {
        header("Location: ../login/login.html?err=1");
        die;
    }

}
