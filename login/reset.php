<?php
$pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
require "../libs/sendEmail.php";
require "../libs/util.php";
if (!empty($_POST['email'])) {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);

    $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $statement->execute(array('email' => $email));
    $user = $statement->fetch();

    if ($user) {
        date_default_timezone_set('Europe/Berlin');
        $timestamp = date("Y-m-d H:i:s");
        $statement = $pdo->prepare("UPDATE users SET token = ?, token_timestamp=? WHERE email = ?");
        $hash = generateHash($pdo);
        $statement->execute(array($hash, $timestamp, $email));

        $link = "http://localhost/design-revision/simulate/setpassword.php?token=" . $hash;

        sendMail($email, $user['name'], "=?utf-8?q?Setzen_Sie_Ihr_Kennwort_zur=C3=BCck?= ", parseHTML("../libs/templates/resetPassword.html", $user['name'], $link, null, null));
        die(" done");

    }
}

