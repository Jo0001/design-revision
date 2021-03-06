<?php
require "../libs/auth.php";
require "../libs/sendEmail.php";

if (!empty($_GET['token']) && !empty($_POST['password']) && !empty($_POST['againPassword'])) {
    $token = filter_var($_GET['token'], FILTER_SANITIZE_STRING);
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $password2 = filter_var($_POST['againPassword'], FILTER_SANITIZE_STRING);

    $pdo = $GLOBALS['pdo'];
    try {
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

            logIn($email, $password, "../app/?success=pswd");
        } else {
            header("Location: signup.php?err=pswd");
        }
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
<head>
    <link href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" rel="icon" type="image/x-icon">
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Reset Password</title>
    <link href="../files/css/Login.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet">
</head>
<body>
<div class="form">
    <h1>Geben sie ihr neues Passwort ein</h1>
    <form action="" id="resetPass" method="post">
        <label>Passwort: </label><br>
        <div class="input-container">
            <input id="password" name="password" onkeyup="char_count1();" placeholder="Passwort" required

                   type="password">
            <i class="material-icons" onclick="passwordToggle()">
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
        <label>Passwort wiederholt</label><br>
        <div class="input-container">
            <input id="againPassword" name="againPassword" onkeyup="char_count2()" placeholder="Passwort wiederholt"
                   required type="password">
            <i class="material-icons" onclick="passwordToggle2()">
                visibility
            </i>
        </div>
        <span id="samePass"></span>
        <br><br>
        <input id="btnLogin" name="btnLogin" type="submit" value="Login">

    </form>
</div>
</body>
<script>
    let status = true;
    let resetpass = document.getElementById("resetPass");
    resetpass.addEventListener('submit', function (evt) {
        let pass1 =document.querySelector("#password").value;
        let pass2 = document.querySelector("#againPassword").value;
        let call = document.getElementById("feedback");
        let feedback = document.getElementById('progressBar');
        if (status||pass1 != pass2) {
        if (status) {
            call.style.color = "black";
            feedback.style.width = "0%";
            call.innerHTML = "<strong>Das Passwort muss sicher sein</strong>";
            }
            evt.preventDefault();

        }

    });

    function char_count2() {
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

    function char_count1() {

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

    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
        return (value !== 'null') ? value : false;
    }

    window.onload = function mailOrPass() {
        let success = getURLParameter("success");
        if (success === "pswd") {
            let feedback = document.getElementById("samePass");
            feedback.style.color = "green";
            feedback.innerHTML = "<strong>Passwort erfolgreich ge&auml;ndert</strong>"
        }
        let err = getURLParameter('err');
        if (err == "pswd") {
                    let feedback = document.getElementById("feedback");
                    feedback.style.color = "red";
                    feedback.innerHTML = "<strong>Ung&uuml;ltiges Passwort</strong>"
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
