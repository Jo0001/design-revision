<?php
require "../libs/auth.php";
require "../libs/sendEmail.php";
if (isLoggedIn()) {
    header("Location: ../app/");
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
    //Password needs a length of 8+, normal letters,numbers, one Caps and one special char and password != email and password not longer than 60 characters
    if ($password == $password2 && filter_var($email, FILTER_VALIDATE_EMAIL) && preg_match("#.*^(?=.{8,20})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$#", $password) && (strcasecmp($password, $email) != 0) && strlen($password) < 61) {
        $pdo = $GLOBALS['pdo'];
        try {
            $statement = $pdo->prepare("SELECT * FROM users WHERE email = :email");
            $result = $statement->execute(array('email' => $email));
            $user = $statement->fetch();

            if (empty($user) || $user['status'] == "INVITE") {
                if (empty($user)) {
                    $pw_options = [
                        'cost' => 12,
                    ];
                    $pswd = password_hash($password, PASSWORD_BCRYPT, $pw_options);
                    $hash = generateHash($pdo);
                    $statement = $pdo->prepare("INSERT INTO users (name, company, email, pswd,status,token) VALUES (?,?,?,?,?,?)");
                    $result = $statement->execute(array($name, $company, $email, $pswd, "REGISTERED", $hash));
                    $user = $statement->fetch();
                } else {
                    $pw_options = [
                        'cost' => 12,
                    ];
                    $pswd = password_hash($password, PASSWORD_BCRYPT, $pw_options);
                    $hash = generateHash($pdo);
                    $statement = $pdo->prepare("UPDATE users SET name = ?, company = ?, pswd= ?, status = ?, token = ? WHERE email = ?");
                    $result = $statement->execute(array($name, $company, $pswd, "REGISTERED", $hash, $email));
                    $user = $statement->fetch();

                }
                $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/verify.php?token=" . $hash;
                $content = parseHTML("../libs/templates/emailverify.html", $name, $link, null, null);
                sendMail($email, $name, "Willkommen bei Design Revison", $content);

                logIn($email, $password, "../app/?success=signup");

            } else {
                header("Location: signup.php?err=pswd");
            }
        } catch (PDOException $e) {
            showError("Something went really wrong", 500);
        }
    } else {
        header("Location: signup.php?err=pswd");
    }
}
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
<head>
    <link rel="icon" href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" type="image/x-icon">
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>New Account</title>
    <link href="../files/css/Login.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
</head>
<body>
<div class="form">
    <form action="signup.php" id="newAccountForm" method="post">
        <h1>Erstellen sie ein Konto</h1>
        <div class="name">
            <label>
                <input id="firstName" name="firstName" placeholder="Vorname" required type="text">
            </label>
            <label>
                <input id="lastName" name="lastName" placeholder="Nachname" required type="text">
            </label></div>
        <br>
        <label>
            <input id="email" name="email"  placeholder="E-mail" required type="email">
        </label>
        <span id="statusEmail"></span><br><br>
        <label>
            <input id="firmName" name="company" placeholder="Firmenname (optional)" type="text">
        </label><br><br>
        <div class="input-container">
            <input id="password" name="password" onkeyup="char_count();" placeholder="Passwort" required
                   type="password">
            <i onclick="passwordToggle()" class="material-icons">
                visibility
            </i>
        </div>
        <div id="progressBarBorder"
             style="border: 3px solid white;border-radius: 2px;margin-top: 10px;background: white; width: 50%">
            <div id="progressBar"
                 style="height:24px;width:1%;background-color:#ff352c;border-radius: 4px;color: white;text-align: center"></div>
        </div>
        <span id="feedback"></span>
        <br><br>
        <div class="input-container">
            <input id="againPassword" name="againPassword" onkeyup="check_up3()" placeholder="Passwort wiederholt"
                   required type="password">
            <i onclick="passwordToggle2()" class="material-icons">
                visibility
            </i>
        </div>
        <span id="samePass"></span>
        <br><br>
        <input id="btnSignIn" name="btnSignIn" type="submit" value="Registrieren">
    </form>
    <p>Sie haben schon ein Konto? <a href="../login/">Anmelden</a></p>
</div>
</body>
<script>
    let status = true;
    let newAcount = document.getElementById("newAccountForm");
    newAcount.addEventListener('submit', function (evt) {
        let call = document.getElementById("feedback");
        let feedback = document.getElementById('progressBar');
        let statusEmail = document.getElementById('statusEmail');
        //implemented same Password detection
        let pass1 =document.querySelector("#password").value;
        let pass2 = document.querySelector("#againPassword").value;
        if (!(emailIsValid(document.querySelector("#email").value)) || status||pass1 != pass2) {
            if (!(emailIsValid(document.querySelector("#email").value))) {
                statusEmail.style.color = "red";
                statusEmail.innerHTML = "<strong>Gültige E-mail eingeben</strong>";
            }
            if (status) {
                call.style.color = "black";
                feedback.style.width = "0%";
                call.innerHTML = "<strong>Das Passwort muss sicher sein</strong>";
            }
            evt.preventDefault();
        }

    });

    function emailIsValid(email) {
        return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    }

    $('#email').on('keyup', function(e) {
        //when enter is pressed the wrong email message don´t disappears
         if (!(e.key === 'Enter')) {
            let statusEmail = document.getElementById('statusEmail');
                    statusEmail.innerHTML = "";
             }
         })



    function char_count() {
        let val = document.getElementById('password').value;
        let call = document.getElementById('feedback');
        let feedback = document.getElementById('progressBar');

        if (val.length > 7) {
            if (val.match(/\d+/) && val.match(/[a-zäöü]+/) && val.match(/\W/) && val.match(/[[A-ZÄÖU]+/)) {
                call.style.color = "#428c0d";
                call.innerHTML = "<strong>Das Passwort ist sehr sicher!</strong>";
                feedback.style.background = "#428c0d";
                feedback.style.width = "100%";
                feedback.innerHTML = "100%";
                status = false;

            } else if (val.match(/\d+/) && val.match(/[a-zäöü]+/) || val.match(/\W/) && val.match(/[a-zäöü]+/)) {
                call.style.color = "#ff9410";
                call.innerHTML = "<strong>Das Passwort fast sicher!</strong>";
                feedback.style.background = "#ff9410";
                feedback.style.width = "75%";
                feedback.innerHTML = "75%";
                status = true;
            } else {
                call.style.color = "#ff9410";
                call.innerHTML = "<strong>Das Passwort ist unsicher!</strong>";
                feedback.style.background = "#ff9410";
                feedback.style.width = "50%";
                feedback.innerHTML = "50%";
            }
        } else {
            call.style.color = "#ff352c";
            call.innerHTML = "<strong>Das Passwort ist zu kurz!</strong>";
            feedback.style.background = "#ff352c";
            feedback.style.width = "25%";
            feedback.innerHTML = "25%";
            status = true;
        }
        if (val.length === 0) {
            call.innerHTML = "";
            feedback.style.background = "#ff352c";
            feedback.style.width = "0%";
            feedback.innerHTML = "0%";
            status = true;

        }
        let pass1 = document.querySelector("#password").value;
        let pass2 = document.querySelector("#againPassword").value;
        let samePass1 = document.getElementById("samePass");
        if (pass2.length > 0) {
            if (!(pass1 === pass2)) {
                samePass1.style.color = "red";
                samePass1.innerHTML = "<strong>Passwörter verschieden</strong>";
            } else {
                samePass1.innerHTML = "";
            }
        }
    }

    function check_up3() {
        let pass1 = document.querySelector("#password").value;
        let pass2 = document.querySelector("#againPassword").value;
        let samePass1 = document.getElementById("samePass");
        if (!(pass1 === pass2)) {
            samePass1.style.color = "red";
            samePass1.innerHTML = "<strong>Passwörter verschieden</strong>";
        } else {
            samePass1.innerHTML = "";
        }

    }


    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
        return (value !== 'null') ? value : false;
    }

    window.onload = function mailOrPass() {
        let mail = document.getElementById("email");
        let tmp = getURLParameter("email");
        mail.value = tmp;
        let err = getURLParameter('err');
        if (err == "pswd") {
            let feedback = document.getElementById("feedback");
            feedback.style.color = "red";
            feedback.innerHTML = "<strong>Ung&uuml;ltiges Passwort oder ung&uuml;tige E-Mail</strong>"
        }
    };

    function passwordToggle() {
        const visibilityToggle = document.querySelector('.material-icons');
        let password = document.getElementById('password');
        if (password.type === "password") {
            password.type = "text";
            visibilityToggle.innerHTML = "visibility_off";
        } else {
            password.type = "password";
            visibilityToggle.innerHTML = "visibility";
        }
    }

    function passwordToggle2() {
        const visibilityToggle = document.querySelectorAll('.material-icons');
        let password = document.getElementById('againPassword');
        if (password.type === "password") {
            password.type = "text";
            visibilityToggle[1].innerHTML = "visibility_off";
        } else {
            password.type = "password";
            visibilityToggle[1].innerHTML = "visibility";
        }
    }

</script>
</html>
