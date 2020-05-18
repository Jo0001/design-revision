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
    <link rel="icon" href="https://cdn-design-revision.netlify.com/files/img/favicon.ico" type="image/x-icon">
</head>
<body>
<div class="middle">
    <form method="post">
        <input type="text" placeholder="123456" name="code" required>
        <br>
        <input type="submit" value="Endg&uuml;ltig zum Druckfreigeben">
    </form>
</div>
</body>
</html>
<!--
TODO Handle success & error @Frontend
err=status ->Project is already done
err=code ->Invalid/Wrong Code
err=member ->Not a project member
err=project->invalid project
-->