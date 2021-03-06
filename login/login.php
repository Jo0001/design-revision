<?php
require "../libs/auth.php";
if (isset($_GET['logout']) ) {
    handleCSRF(filter_var($_GET['csrf'], FILTER_SANITIZE_STRING));
    logOut();
    die;
}
if (isLoggedIn()) {
    header("Location: ../app/");
    die;
}

if (!empty($_POST['password']) && !empty($_POST['email'])) {
    handleCSRF(filter_var($_POST['csrf'], FILTER_SANITIZE_STRING));
    $password = filter_var($_POST['password'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    if (!empty($_POST['returnto'])) {
        $url = urldecode(filter_var($_POST['returnto'], FILTER_SANITIZE_URL));
        if (strpos($url, 'http') !== false || strpos($url, 'https') !== false) {
            $url = null;
        }
        logIn($email, $password, $url);
    }
    logIn($email, $password, null);
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <link href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" rel="icon" type="image/x-icon">
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Login</title>
    <link href="../files/css/Login.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
</head>
<body>
<div class="alert">
    <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
    <strong><span>Sie haben sich erfolglreich Ausgelogt</span></strong>
</div>

<div class="form">
    <h1>Login</h1>
    <form action="login.php" id="login" method="post">
        <label>E-Mail:<br>
            <input id="email" name="email" placeholder="E-mail" required type="email"
                   value="lukas-biermann@fahr-zur-hoelle.org">
        </label><span id="statusEmail"></span><br><br>
        <label>Passwort: </label><br>
        <div class="input-container">
            <input id="password" name="password" placeholder="Passwort" required type="password"
                   value="Test#2019">

            <i class="material-icons" onclick="passwordToggle()">
                visibility
            </i>
        </div>
        <input type="hidden" name="returnto" id="returnto"/>
        <p>Passwort vergessen? <a href="reset.php">Zurücksetzen</a></p>
        <input type="hidden" name="csrf" value="<?php echo getCSRF() ?>">
        <input id="btnLogin"  type="submit" value="Anmelden">
    </form>
    <p>Sie haben noch kein Konto? <a href="signup.php">Erstellen sie sich jetzt eins</a></p>

</div>

<script>
    let resetPass = document.getElementById("login");
    let statusEmail = document.getElementById('statusEmail');
    resetPass.addEventListener('submit', function (evt) {
        if (!(emailIsValid(document.querySelector("#email").value))) {
            statusEmail.style.color = "red";
            statusEmail.innerHTML = "<strong>Gültige E-mail eingeben</strong>";
            evt.preventDefault();
        }
    });
    window.onload = function mailOrPass() {
        //Abfrage für Mobile Seite
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) umleiten()
        })(navigator.userAgent || navigator.vendor || window.opera);

        function umleiten() {
            window.alert("Sie werden auf die Mobile Seite umgeleitet");
            window.location = window.location.origin + "/design-revision/login/mobileSeite.html";
        }

        let err = getURLParameter('err');
        if (err === "1") {
            let feedback = document.getElementById("statusEmail");
            feedback.style.color = "red";
            feedback.innerHTML = "<strong>E-Mail oder Passwort falsch</strong>"
        }
        let success = getURLParameter('success');
        if (success === "logout"&&getCookie('verify')!=="notVerified"&&getCookie('projects')!=="noProjects") {
            let alert= document.querySelector('.alert');
            alert.style.display="block";
            let message=alert.getElementsByTagName("span");
            message[1].innerHTML="Sie haben sich erfolglreich Ausgelogt";
        }
        let verify=getURLParameter('verify');
        if(verify==='notVerified'||getCookie('verify')==="notVerified"){
            let alert= document.querySelector('.alert');
            alert.style.display="block";
            let message=alert.getElementsByTagName("span");
            message[1].innerHTML="Sie m&uuml;ssen ihre E-Mail verifiziern";
            delete_cookie('verify');
        }
        let projects=getURLParameter('projects');
        if(projects==='noProjects'||getCookie('projects')==="noProjects"){
            let alert= document.querySelector('.alert');
            alert.style.display="block";
            let message=alert.getElementsByTagName("span");
            message[1].innerHTML="Sie m&uuml;ssen warten bis sie einem Projekt zugewießen wurden";
            delete_cookie('projects')
        }
    };

    function emailIsValid(email) {
        return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    }

    $('#email').on('keyup', function(e) {
    //when enter is pressed the wrong email message don´t disappears
     if (!(e.key === 'Enter')) {
        statusEmail.innerHTML = "";
         }
     })


    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
        return (value !== 'null') ? value : false;
    }

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
    //cookie functions
  function getCookie(name) {
      let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
  }

    function delete_cookie( name ) {
    document.cookie = name+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    function saveLocation() {
        let location = encodeURIComponent(getURLParameter("returnto"));
        let readyStateCheckInterval = setInterval(function () {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                if (location) {
                    document.getElementById("returnto").value = location;
                }
            }
        }, 10);
    }

    saveLocation();
</script>
</body>
</html>
