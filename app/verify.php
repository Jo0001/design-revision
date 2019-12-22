<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify E-Mail Address</title>
    <link rel="stylesheet" type="text/css" href="../files/css/layout.css">
</head>
<body>
<?php
$verified = false;
if (!empty($_GET['token'])) {
    $token = filter_var($_GET['token'], FILTER_SANITIZE_STRING);
    //TODO Database logic & check
    $verified = true;
}
if ($verified) {
    echo "<div id=\"verifyBox\" class=\"middle success\">
    <h3>E-Mailadresse erfolgreich verifiziert</h3>
    <p>email@company.tld</p>
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
