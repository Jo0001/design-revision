<?php
require "../libs/auth.php";
require "../libs/sendEmail.php";

if (!empty($_GET['token']) && !empty($_POST['password']) && !empty($_POST['againPassword'])) {
    $token = filter_var($_GET['token'], FILTER_SANITIZE_STRING);
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $password2 = filter_var($_POST['againPassword'], FILTER_SANITIZE_STRING);

    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $statement = $pdo->prepare("SELECT * FROM users WHERE token = :token");
    $result = $statement->execute(array('token' => $token));
    $user = $statement->fetch();

    $email = $user['email'];

    $timestamp = $user['token_timestamp'];
    date_default_timezone_set('Europe/Berlin');
    $currentdate = date("Y-m-d H:i:s");
    $diff = dateDifference($timestamp, $currentdate);

    if (!empty($user) && $password == $password2 && preg_match("#.*^(?=.{8,20})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$#", $password) && (strcasecmp($password, $email) != 0) && $diff <= 7200) {
        $pw_options = [
            'cost' => 12,
        ];
        $pswd = password_hash($password, PASSWORD_BCRYPT, $pw_options);
        $statement = $pdo->prepare("UPDATE users SET pswd = ?, token = NULL WHERE token = ?");
        $statement->execute(array($pswd, $token));
        $content = parseHTML("../libs/templates/successPasswordReset.html", null, null, null, null);
        sendMail($email, $user['name'], " =?utf-8?q?Sie_haben_Ihr_Design_Revision-Kennwort_erfolgreich_zur=C3=BCckgesetzt?=", $content);

        logIn($email, $password, "../simulate/dashboard.php?success=pswd");
    } else {
        header("Location: loginNewAccount.html?err=pswd");
    }
}
print parseHTML("../login/loginNewPassword.html", null, null, null, null);