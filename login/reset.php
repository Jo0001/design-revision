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

        if (dateDifference($timestamp, $user['token_timestamp']) > 120) {


            $statement = $pdo->prepare("UPDATE users SET token = ?, token_timestamp=? WHERE email = ?");
            $hash = generateHash($pdo);
            $statement->execute(array($hash, $timestamp, $email));

            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://".filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING)."/design-revision/simulate/setpassword.php?token=" . $hash;

            sendMail($email, $user['name'], "=?utf-8?q?Setzen_Sie_Ihr_Kennwort_zur=C3=BCck?= ", parseHTML("../libs/templates/resetPassword.html", $user['name'], $link, null, null));

            die("<!DOCTYPE html>
<html lang=\"de\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Kennwort vergessen</title>
    <link rel=\"stylesheet\" type=\"text/css\" href=\"../files/css/layout.css\">
    <link rel=\"icon\" href=\"https://cdn-design-revision.netlify.com/files/img/favicon.ico\" type=\"image/x-icon\">
</head>
<body>
<div id=\"verifyBox\" class=\"middle success\">
    <h3>Bitte schauen Sie in Ihr Postfach</h3>
    <p>Wenn Sie die E-Mal nicht in Ihrem Posteingang finden,<br> überprüfen Sie bitte auch Ihren Spam-Ordner.</p>
</div>
</body>
</html>");
        } else {
            die("<!DOCTYPE html>
<html lang=\"de\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Kennwort vergessen</title>
    <link rel=\"stylesheet\" type=\"text/css\" href=\"../files/css/layout.css\">
    <link rel=\"icon\" href=\"../files/img/favicon.ico\" type=\"image/x-icon\">
</head>
<body>
<div id=\"verifyBox\" class=\"middle error\">
    <h3>Bitte schauen Sie in Ihr Postfach</h3>
    <p>Wir haben Ihnen bereits eine E-Mail geschickt. <br>Wenn Sie die E-Mal nicht in Ihrem Posteingang finden,<br> überprüfen Sie bitte auch Ihren Spam-Ordner.</p>
</div>
</body>
</html>");
        }
    }
}