<?php
require "../libs/auth.php";
if (isLoggedIn()) {
    header("Location: ../app/CustumorDashboard.html");
}

if (!empty($_POST['firstName']) && !empty($_POST['lastName']) && !empty($_POST['email']) && !empty($_POST['password']) && !empty($_POST['againPassword'])) {
    $firstname = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastname = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);
    $company = null;
    if (empty($_POST['company'])) {
        $company = filter_var($_POST['company'], FILTER_SANITIZE_STRING);
    }
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $password2 = filter_var($_POST['againPassword'], FILTER_SANITIZE_STRING);
    $name = $firstname . " " . $lastname;
    //Check if passwords match and email is valid
    //Password needs a length of 8+, normal letters,numbers, one Caps and one special char and password != email
    if ($password == $password2 && filter_var($email, FILTER_VALIDATE_EMAIL) && preg_match("#.*^(?=.{8,20})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$#", $password) && $password != $email) {
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
        $result = $statement->execute(array('email' => $email));
        $user = $statement->fetch();
        if (empty($user)) {
            echo "email is free";
            //TODO Save to db and send Mail
        } else {
            header("Location: loginNewAccount.html?err=1");
        }

    } else {
        header("Location: loginNewAccount.html?err=1");
    }
}