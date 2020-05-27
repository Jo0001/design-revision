<?php
require "../libs/sendEmail.php";
require "../libs/auth.php";
if (!empty($_POST['email'])) {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_STRING);
    $pdo = $GLOBALS['pdo'];
    try {
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

                $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/setpassword.php?token=" . $hash;

                sendMail($email, $user['name'], "=?utf-8?q?Setzen_Sie_Ihr_Kennwort_zur=C3=BCck?= ", parseHTML("../libs/templates/resetPassword.html", $user['name'], $link, null, null));

                emailSent();
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
        } else {
            emailSent();
        }
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
}
function emailSent()
{
    die("<!DOCTYPE html>
<html lang=\"de\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Kennwort vergessen</title>
    <link rel=\"stylesheet\" type=\"text/css\" href=\"../files/css/layout.css\">
    <link rel=\"icon\" href=\"https://cdn-design-revision.netlify.app/files/img/favicon.ico\" type=\"image/x-icon\">
</head>
<body>
<div id=\"verifyBox\" class=\"middle success\">
    <h3>Bitte schauen Sie in Ihr Postfach</h3>
    <p>Wenn Sie die E-Mal nicht in Ihrem Posteingang finden,<br> überprüfen Sie bitte auch Ihren Spam-Ordner.</p>
</div>
</body>
</html>");
}

?>
<!DOCTYPE html>
<html lang="de">
<head>
    <link rel="icon" href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" type="image/x-icon">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title> Reset Password </title>
    <link href="../files/css/Login.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
</head>
<body>
<div class="form">
    <h1> Setzen sie ihr Design Revision Passwort zur&uumlck </h1>
    <form action="reset.php" id="forgottenpass" method="post">
        <label>E-Mail:
            <input id="email" name="email" placeholder="E-mail" required
                   type="email" value="lukas-biermann@fahr-zur-hoelle.org">
        </label><span id="statusEmail"></span><br><br>
        <input id="resetpass" name="resetpass" type="submit" value="Passwort zur&#x00FC;cksetzen">
    </form>
</div>
</body>

<script>
    let resetPass = document.getElementById("forgottenpass");
    let statusEmail = document.getElementById('statusEmail');
    resetPass.addEventListener('submit', function (evt) {
        if (!(emailIsValid(document.querySelector("#email").value))) {
            statusEmail.style.color = "red";
            statusEmail.innerHTML = "<strong>G&uuml;ltige E-mail eingeben</strong>";
            evt.preventDefault();
        }

    });

    function emailIsValid(email) {
        return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    }


    $('#email').on('keyup', function (e) {
        //when enter is pressed the wrong email message don´t disappears
        if (!(e.key === 'Enter')) {
            let statusEmail = document.getElementById('statusEmail');
            statusEmail.innerHTML = "";
        }
    })

    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
        return (value !== 'null') ? value : false;
    }

    window.onload = function mailOrPass() {
        let err = getURLParameter('err');
        if (err === "login") {
            let feedback = document.getElementById("statusEmail");
            feedback.style.color = "red";
            feedback.innerHTML = "<strong>E-Mail nicht vorhanden</strong>"
        }
    };
</script>
</html>
