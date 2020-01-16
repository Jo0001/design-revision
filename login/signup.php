<?php
require "../libs/auth.php";
require "../libs/sendEmail.php";
if (isLoggedIn()) {
    header("Location: ../simulate/dashboard.php");
}

if (!empty($_POST['firstName']) && !empty($_POST['lastName']) && !empty($_POST['email']) && !empty($_POST['password']) && !empty($_POST['againPassword'])) {
    $firstname = filter_var($_POST['firstName'], FILTER_SANITIZE_STRING);
    $lastname = filter_var($_POST['lastName'], FILTER_SANITIZE_STRING);
    $email = strtolower(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL));
    $company = null;
    if (!empty($_POST['company'])) {
        $company = filter_var($_POST['company'], FILTER_SANITIZE_STRING);
    }
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $password2 = filter_var($_POST['againPassword'], FILTER_SANITIZE_STRING);
    $name = $firstname . " " . $lastname;
    //Check if passwords match and email is valid
    //Password needs a length of 8+, normal letters,numbers, one Caps and one special char and password != email
    if ($password == $password2 && filter_var($email, FILTER_VALIDATE_EMAIL) && preg_match("#.*^(?=.{8,20})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$#", $password) && (strcasecmp($password, $email) != 0)) {
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
        $result = $statement->execute(array('email' => $email));
        $user = $statement->fetch();
        if (empty($user)) {
            $pw_options = [
                'cost' => 12,
            ];
            $pswd = password_hash($password, PASSWORD_BCRYPT, $pw_options);
            $hash = generateHash($pdo);
            $statement = $pdo->prepare("INSERT INTO users (name, company, email, pswd,status,token) VALUES (?,?,?,?,?,?)");
            $result = $statement->execute(array($name, $company, $email, $pswd, "REGISTERED", $hash));
            $user = $statement->fetch();
            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://".filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING)."/design-revision/app/verify.php?token=" . $hash;
            $content = parseHTML("../libs/templates/emailverify.html", $name, $link, null, null);
            sendMail($email, $name, "Willkommen bei Design Revison", $content);

            logIn($email, $password,"../simulate/dashboard.php?success=signup");
        } else {
            header("Location: loginNewAccount.html?err=pswd");
        }
    } else {
        header("Location: loginNewAccount.html?err=pswd");
    }
}