<?php
require "../libs/auth.php";
require "../libs/api-util.php";
require "../libs/sendEmail.php";

if (!empty($_POST['code']) && !empty($_GET['id'])) {
    $code = filter_var($_POST ['code'], FILTER_SANITIZE_STRING);
    $pid = filter_var($_GET ['id'], FILTER_SANITIZE_STRING);
    if (isLoggedIn()) {
        $pid = "project_" . $pid;
        $loc = "?id=" . explode("project_", $pid)[1];
        if (isValidProject($pid, $pdo)) {
            if (isMember($pid, getUser('pk_id'))) {
                $pdo = $GLOBALS['pdo'];
                $project = getLatestProjectData($pid, $pdo);
                $securitycode = $project['securitycode'];

                if ($project['status'] !== DONE) {
                    if ($code === $securitycode) {
                        try {
                            $statement = $pdo->prepare("UPDATE " . $pid . " SET `securitycode` = ?  ORDER BY version DESC LIMIT 1");
                            $statement->execute(array(null));
                        } catch (PDOException $e) {
                            showError("Something went really wrong", 500);
                        }

                        //Sendmail to all members
                        $uname = getUser('name');
                        $pname = $project['p_name'];
                        $link = $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/app/view.php?id=" . explode("project_", $pid)[1];

                        $members = json_decode($project['members'], true);
                        foreach ($members as $member) {
                            $id = $member['id'];
                            $email = IdToEmail($pdo, $id);
                            $toName = IdToName($pdo, $id);
                            sendMail($email, $toName, "'" . $pname . "' wurde erfolgreich zum Druck freigegeben", parseHTML("../libs/templates/emailDruckFreigegeben.html", $uname, $link, $pname, null));
                        }

                        changeStatus($pdo, $pid, DONE);

                        header("Location: ?done=1");

                    } else {
                        header("Location: $loc&err=code");
                    }
                } else {
                    header("Location: $loc&err=status");
                }

            } else {
                header("Location: $loc&err=member");
            }
        } else {
            header("Location: $loc&err=project");
        }
    } else {
        header("Location: ../login/?returnto=" . getCurrentURL());
        die;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Druckfreigabe bestätigen</title>
    <link rel="stylesheet" type="text/css" href="../files/css/layout.css">
    <link href="../files/css/message.css" rel="stylesheet">
    <script src="../files/js/message.js"></script>
    <link rel="icon" href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" type="image/x-icon">
</head>
<style>
    #codeinput {
        font-weight: 700;
        color: black;
        text-align: center;
        width: 100%;
        border-top: none;
        border-right: none;
        border-left: none;
        border-color: black;
        border-width: 0.1em;
        height: 40px;
        font-size: 16px;
    }

    #printbtn {
        text-align: center;
        background-color: #333;
        color: #fff;
        font-size: 20px;
        padding: 10px 20px;
        margin-top: 10px;
        border: none;
        cursor: pointer
    }
</style>
<body>
<div class="warn" id="mes"></div>
<div class="middle">
    <form method="post">

        <label for="codeinput" style="font-size: 26px">Sicherheitscode eingeben:</label><br><input type="text"
                                                                                                   placeholder="123456"
                                                                                                   id="codeinput"
                                                                                                   name="code" required>
        <br>
        <input type="submit" id="printbtn" value="Endg&uuml;ltig zum Druckfreigeben">

    </form>
</div>

<script>
    function getURLParameter(name) {
        let value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
        return (value !== 'null') ? value : false;
    }

    let stateCheck = setInterval(() => {
        if (document.readyState === 'complete') {
            clearInterval(stateCheck);
            if (getURLParameter('done') == 1) {
                document.getElementById("mes-btn").addEventListener("click", function () {
                    window.location.replace("../app/");
                });
                showmes("info", "Projekt erfolgreich zum Endgültigen Druck freigegeben");
            } else {
                document.getElementById("mes-btn").removeEventListener("click", reload);
                if (getURLParameter('err') === "status") {
                    showmes("error", "Das Projekt wurde bereits freigegeben");
                } else if (getURLParameter('err') === "code") {
                    showmes("error", "Ungültiger Sicherheitscode");
                } else if (getURLParameter('err') === "member") {
                    showmes("error", "Kein Projektmitglied");
                } else if (getURLParameter('err') === "project") {
                    showmes("error", "Ungültiges Projekt");
                }
            }
        }
    }, 200);
</script>
</body>
</html>