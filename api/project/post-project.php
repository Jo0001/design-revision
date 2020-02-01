<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
require "../../libs/sendEmail.php";

if (!empty($_POST['name']) && !empty($_POST['members'])) {
    if (isLoggedIn() && getUser('status') == "VERIFIED") {
        $projectname = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
        $members = filter_var($_POST['members'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
        $target_dir = "../../user-content/";
        $hash = bin2hex(openssl_random_pseudo_bytes(4));
        $filename = $hash . time() . $hash . ".pdf";
        $target_file = $target_dir . basename($filename);
        $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

        if ($_FILES["file"]["type"] == "application/pdf" && $fileType == "pdf" && !file_exists($target_file) && $_FILES["file"]["size"] < 500000001 && strlen($projectname) < 81) {

            if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
                //Generate Table
                $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
                $result = 0;
                do {
                    $t_name = "project_" . bin2hex(openssl_random_pseudo_bytes(4));
                    try {
                        $statement = $pdo->prepare("CREATE TABLE `design_revision`.`" . $t_name . "` ( `p_name` VARCHAR(80) NOT NULL , `version` INT(10) UNSIGNED NOT NULL DEFAULT '1', `link` VARCHAR(30) NOT NULL , `members` VARCHAR(221) NOT NULL , `status` VARCHAR(20) NOT NULL , `lastedit` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , `data` VARCHAR(20000) NULL , PRIMARY KEY (`version`)) ENGINE = InnoDB");
                        $result = $statement->execute();
                    } catch (PDOException $e) {
                    }
                } while (!$result);
                //Save the default data
                date_default_timezone_set('Europe/Berlin');
                $date = date("Y-m-d H:i:s");

                $statement = $pdo->prepare("SELECT email FROM `users` ");
                $statement->execute();
                $tmpmails = $statement->fetchAll();
                //Create a one dimensional array with all emails from the db
                $useremails = array();
                foreach ($tmpmails as $tmp) {
                    array_push($useremails, $tmp['email']);
                }
                //convert json post to php array format
                $members = json_decode($members, true);

                //Remove double entries from the array
                $members = array_unique($members, SORT_REGULAR);

                $memberids = array();

                $pid = explode("project_", $t_name)[1];

                // $projectname = $name;

                //add current user (as admin)
                $userid = getUser('pk_id');
                array_push($memberids, array("id" => (int)$userid, "role" => 1));
                updateUserProjects($pdo, $userid, $pid);

                //Converts everything to lowercase
                $members = array_map('nestedLowercase', $members);

                foreach ($useremails as $tmp) {
                    //check if user has an account
                    if (in_array($tmp, array_column($members, 'email'))) {
                        $id = emailToId($tmp);
                        //get array with all roles and emails as index and select the one equal to the current email and save it
                        $role = array_column($members, 'role', 'email')[$tmp];
                        array_push($memberids, array("id" => (int)$id, "role" => $role));

                        updateUserProjects($pdo, $id, $pid);

                        $statement = $pdo->prepare("SELECT * FROM `users` WHERE pk_id = ?");
                        $statement->execute(array($id));
                        $results = $statement->fetch();
                        $name = $results['name'];
                        $status = $results['status'];
                        //Inform user per email about the new project
                        if ($status == "INVITE") {
                            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/loginNewAccount.html?email=" . $tmp;
                            sendMail($tmp, $tmp, "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenNew.html", null, $link, $projectname, 1));
                        } else {
                            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/simulate/edit.php?id=" . $pid;
                            sendMail($tmp, $name, "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenAcc.html", $name, $link, $projectname, 1));
                        }
                    }
                }
                //save all email addresses of the members as one dimensional array
                $emails = array();
                foreach ($members as $tmp) {
                    array_push($emails, $tmp['email']);
                }

                $result = array_diff($emails, $useremails);
                if (!empty($result)) {
                    foreach ($result as $tmp) {
                        $statement = $pdo->prepare("INSERT INTO `users` (`pk_id`, `name`, `company`, `email`, `pswd`, `projects`, `status`, `token`, `token_timestamp`) VALUES (NULL, '', NULL, ?, '', ?, 'INVITE', NULL, CURRENT_TIMESTAMP)");
                        $statement->execute(array($tmp, json_encode(array($pid))));
                        $role = array_column($members, 'role', 'email')[$tmp];
                        array_push($memberids, array("id" => (int)$pdo->lastInsertId(), "role" => $role));

                        $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/loginNewAccount.html?email=" . $tmp;
                        sendMail($tmp, $tmp, "Einladung zu \"" . $projectname . "\"", parseHTML("../libs/templates/emailFreigebenNew.html", null, $link, $projectname, 1));
                    }
                }

                $statement = $pdo->prepare("INSERT INTO " . $t_name . " (p_name, link, members,status,lastedit) VALUES (?, ?, ?,?,?)");
                $statement->execute(array($name, $filename, json_encode($memberids), 'WAITING_FOR_RESPONSE', $date));

                header("HTTP/1.1 201 Created ");
                //Just for development
                handleOutput("Successful uploaded file");
            } else {
                showError("Something went seriously wrong", 500);
            }
        } else {
            showError("Invalid Request", 400);
        }
    } else showError("Login to perform that action", 401);
} else {
    showError("Bad Request", 400);
}