<?php
$pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
require "../libs/sendEmail.php";
require  "../libs/util.php";
if (!empty($_POST['email'])) {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);

    $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $statement->execute(array('email' => $email));
    $user = $statement->fetch();

    if ($user !== false) {
        if($user['status']== "verified") {
            $statement = $pdo->prepare("UPDATE users SET token = ? WHERE email = ?");
            $hash = generateHash($pdo);
            $statement->execute(array($hash, $email));

            $link="http://localhost/design-revision/login/loginNewPassword.html?token=".$hash;

            sendMail($email,$user['name'],"Reset your Password",parseHTML("../libs/templates/resetPassword.html",$user['name'],$link,null,null));
           die(" done");
        }
    }
}

