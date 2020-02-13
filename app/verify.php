<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Mail Adress verifizieren</title>
    <link rel="stylesheet" type="text/css" href="../files/css/layout.css">
    <link rel="icon" href="https://cdn-design-revision.netlify.com/files/img/favicon.ico" type="image/x-icon">
</head>
<body>
<?php
require "../libs/util.php";
$verified = false;
if (!empty($_GET['token'])) {
    $token = filter_var($_GET['token'], FILTER_SANITIZE_STRING);

    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $statement = $pdo->prepare("SELECT * FROM users WHERE token = :token");
    $result = $statement->execute(array('token' => $token));
    $user = $statement->fetch();
    if (!empty($user)) {
        $timestamp = $user['token_timestamp'];
        date_default_timezone_set('Europe/Berlin');
        $currentdate = date("Y-m-d H:i:s");
        $diff = dateDifference($timestamp, $currentdate);
        if ($diff <= 7200) {
            $statement = $pdo->prepare("UPDATE users SET status = ?, token = NULL WHERE token = ?");
            $statement->execute(array("VERIFIED", $token));
            $verified = true;
        }
    }
}
if ($verified) {
    echo "<div id=\"verifyBox\" class=\"middle success\">
    <h3>E-Mailadresse erfolgreich verifiziert</h3>
    <p>" . $user['email'] . "</p>
</div>";
} else {
    echo "<div id=\"verifyBox\" class=\"middle error\">
    <h3>Etwas ist schiefgelaufen</h3>
    <p>Ungültiger oder abgelaufener Link</p>
</div>";
}
?>
</body>
</html>
