<?php
$pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');

if (!empty($_POST['email'])) {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);

    $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $result = $statement->execute(array('email' => $email));
    $user = $statement->fetch();

    if ($user !== false) {
        $statement = $pdo->prepare("UPDATE users SET reset_id = ? WHERE email = ?");
        $statement->execute(array(generateHash($pdo), $email));

        echo "adding reset-id: done";
    }
}

//TODO Needs testing with more users
function generateHash($pdo)
{
    do {
        $hash = bin2hex(openssl_random_pseudo_bytes(128));
        $statement = $pdo->prepare("SELECT * FROM users WHERE reset_id = :reset_id");
        $result = $statement->execute(array('reset_id' => $hash));
        $token = $statement->fetch();
    } while ($token !== false);
    return $hash;
}