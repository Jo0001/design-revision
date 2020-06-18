<?php
require "libs/sendEmail.php";
$done = true;
//Set values for php.ini
ini_set('file_uploads', true);
ini_set('memory_limit', '515M');
ini_set('display_errors', 0);

if (sendMail(emailFromaddress, emailFromname, "Design Revision Setup test", "Mail sending is working fine :)")) {
    echo "Testemail wurde erfolgreich gesendet &#10003;<br>";
} else {
    echo "Fehler beim Versenden der Testmail. Bitte Zugangsdaten überprüfen<br>";
    $done = false;
}

$pdo = new PDO(dbDsn, dbUsername, dbPassword);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
try {
    $statement = $pdo->prepare("DROP TABLE IF EXISTS `users`;");
    $statement->execute();
    $statement = $pdo->prepare("CREATE TABLE `users` (
  `pk_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `company` varchar(50) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `pswd` varchar(60) NOT NULL,
  `projects` varchar(2000) DEFAULT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'invite',
  `token` varchar(128) DEFAULT NULL,
  `token_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
    if ($statement->execute() == 1) {
        echo "Datenbankverbindung erfolgreich hergestellt und User-Tabelle erstellt &#10003;";
    }
} catch (PDOException $e) {
    echo "Fehler beim Erstellen der User-Tabelle: <br>";
    echo $e->getMessage();
    $done = false;
}
echo "<br><br>";
if ($done) {
    echo "Alles erfolgreich eingerichtet. Bitte lösche diese Datei!";
} else {
    echo "Es gab mindestens 1 Fehler bei der Einrichtung. Bitte alles Fehler beheben. Genaueres siehe oben";
}

if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') {
    echo "<br>Hinweis: Es wurde eine https Verbindung erkannt. Es wird empfohlen die automatische Weiterleitung direkt über den Server Einzustellen (normalerweise Standart).
<br> Falls dies nicht möglich ist müssen die Zeilen 9-11 in der .htaccess Datei aktiviert werden (#vor den Zeilen entferen)";
}

