<?php
require "../libs/auth.php";
require "../libs/sendEmail.php";

$method = filter_var($_SERVER['REQUEST_METHOD'], FILTER_SANITIZE_STRING);

function check_id()
{
    if (!empty($_GET['id'])) {
        return filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    }
}

/*
 * GET USER
 */
if (isset($_GET['getuser'])) {
    handleOutput(array("user" => getUser("all")));
    /*
    * GET PROJECT
    */
} else if (isset($_GET['getproject'])) {
    $value = filter_var($_GET['getproject'], FILTER_SANITIZE_STRING);
    $value = strtolower($value);
    if ($value == "data") {
        getProject("data");
    } else {
        getProject("");
    }
    /*
     * POST PROJECT
     */
} else if (isset($_POST['createproject']) && !empty($_POST['name']) && !empty($_POST['members'])) {
    createProject();
    /*
     * UPDATE PROJECT
     */
} else if ($method == "PUT") {
    updateProject();
    /*
     * DELETE PROJECT
     */
} else if ($method == "DELETE") {
    deleteProject();
} else {
    showError("No / wrong parameters provided or wrong request method", 400);
}

/*
 * Handle Output & Errors
 */
function showError($error, $code)
{
    $http_message = null;
    if ($code == 400) {
        header("HTTP/1.1 400 Bad Request");
        $http_message = "Bad Request";
    } elseif ($code == 401) {
        header('WWW-Authenticate: Login to get the requested data');
        header("HTTP/1.1 401 Unauthorized ");
        $http_message = "Unauthorized";
    } elseif ($code == 403) {
        header("HTTP/1.1 403 Forbidden");
        $http_message = "Forbidden";
    } elseif ($code == 404) {
        header("HTTP/1.1 404 Not Found");
        $http_message = "Not Found";
    } elseif ($code == 500) {
        header("HTTP/1.1 500 Internal Server Error");
        $http_message = "Internal Server Error";
    }
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-version" => 1.8));
    handleOutput($err);
    die;
}

function handleOutput($o)
{
    header("Content-type:application/json");
    echo json_encode($o);
}

/*
 * DATABASE LOGIC
 */
function getUser($value)
{
    if (isLoggedIn()) {
        $id = $_SESSION['user-id'];
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $statement = $pdo->prepare("SELECT * FROM users WHERE pk_id = :pk_id");
        $result = $statement->execute(array('pk_id' => $id));
        $user = $statement->fetch();
        if ($value == "all") {
            return ["id" => (int)$user['pk_id'], "name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "avatar" => "../api/avatar.php?name=" . $user['name'][0], "projects" => json_decode($user['projects'])];
        } else {
            return $user[$value];
        }
    }
    showError("Login to get the requested data", 401);
}

function getProject($value)
{
    $id = check_id();
    if (!is_null($id)) {
        if (isLoggedIn()) {
            $id = "project_" . $id;
            $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
            if (isValidProject($id, $pdo)) {
                $project = getLatestProjectData($id, $pdo);
                if ($value == "data") {
                    handleOutput(array("link" => $project['link'], "data" => $project['data']));
                } else {
                    handleOutput(array("project" => array("name" => $project['p_name'], "status" => $project['status'], "link" => $project['link'], "version" => (int)$project['version'], "lastedit" => $project['lastedit'], "members" => json_decode($project['members']))));
                }
            } else {
                showError("Invalid Request", 400);
            }
        } else {
            showError("Login to get the requested data", 401);
        }
    } else {
        showError("Missing id, please specify it with &id=value", 400);
    }
}

function createProject()
{
    if (isLoggedIn() && getUser('status') == "VERIFIED") {
        $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
        $members = filter_var($_POST['members'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
        $target_dir = "../user-content/";
        $hash = bin2hex(openssl_random_pseudo_bytes(4));
        $filename = $hash . time() . $hash . ".pdf";
        $target_file = $target_dir . basename($filename);
        $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

        if ($_FILES["file"]["type"] == "application/pdf" && $fileType == "pdf" && !file_exists($target_file) && $_FILES["file"]["size"] < 500000001 && strlen($name) < 81) {

            if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
                //Generate Table
                $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
                $result = 0;
                do {
                    $t_name = "project_" . bin2hex(openssl_random_pseudo_bytes(4));
                    try {
                        $statement = $pdo->prepare("CREATE TABLE `design_revision`.`" . $t_name . "` ( `p_name` VARCHAR(80) NOT NULL , `version` INT(10) UNSIGNED NOT NULL DEFAULT '1', `link` VARCHAR(30) NOT NULL , `members` VARCHAR(221) NOT NULL , `status` VARCHAR(20) NOT NULL , `lastedit` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , `data` VARCHAR(255) NULL , PRIMARY KEY (`version`)) ENGINE = InnoDB");
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

                //Remove all double entrys from the array
                $members = array_unique($members);

                $memberids = array();

                $pid = explode("project_", $t_name)[1];

                $projectname = $name;

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

                        $statement = $pdo->prepare("SELECT name FROM `users` WHERE pk_id = ?");
                        $statement->execute(array($id));
                        //Inform user per email about the new project
                        $name = $statement->fetch()[0];
                        $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/simulate/edit.php?id=" . $pid;
                        sendMail($tmp, $name, "Einladung zu \"" . $projectname . "\"", parseHTML("../libs/templates/emailFreigebenAcc.html", $name, $link, $projectname, 1));
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
}

function updateProject()
{
    $_PUT = null;
    parse_str(file_get_contents('php://input'), $_PUT);
    if (isset($_PUT['updateproject']) && getUser('status') == "VERIFIED") {

        if ($_PUT['updateproject'] == "addmember" && !empty(($_PUT['id'])) && !empty(($_PUT['role']))) {
            handleOutput("Success");
            //TODO error http code
        } elseif ($_PUT['updateproject'] == "removemember" && !empty(($_PUT['id']))) {
            handleOutput("Success");
        } elseif ($_PUT['updateproject'] == "data" && !empty(($_PUT['id'])) && !empty(($_PUT['data']))) {
            handleOutput("Success");
        } elseif ($_PUT['updateproject'] == "status" && !empty(($_PUT['id'])) && !empty(($_PUT['status']))) {
            handleOutput("Success");
        } elseif ($_PUT['updateproject'] == "file" && !empty(($_PUT['id']))) {

            $target_dir = "../user-content/";
            $hash = bin2hex(openssl_random_pseudo_bytes(4));
            $filename = $hash . time() . $hash . ".pdf";
            $target_file = $target_dir . basename($filename);
            $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

            if ($_FILES["file"]["type"] == "application/pdf" && $fileType == "pdf" && !file_exists($target_file) && $_FILES["file"]["size"] < 500000001) {
                if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
                    header("HTTP/1.1 201 Created ");
                    handleOutput("Successful uploaded file");
                } else {
                    showError("Something went seriously wrong", 500);
                }
            } else {
                showError("Invalid Request", 400);
            }
        }
    }
}

function deleteProject()
{
    $_DELETE = null;
    parse_str(file_get_contents('php://input'), $_DELETE);
    if (isset($_DELETE['id'])) {
        $id = "project_" . filter_var($_DELETE['id'], FILTER_SANITIZE_STRING);

        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        if (isValidProject($id, $pdo) && getUser('status') == "VERIFIED") {
            $userid = getUser("pk_id");
            if (isAdmin(getLatestProjectData($id, $pdo), $userid)) {
                $statement = $pdo->prepare("SELECT link FROM " . $id);
                $statement->execute();
                $link = $statement->fetchAll();
                $target_dir = "../user-content/";
                for ($i = 0; $i < count($link); $i++) {
                    //deletes all project files
                    unlink($target_dir . $link[$i][0]);
                }

                $tmpproject = getLatestProjectData($id, $pdo);
                $tmpmembers = json_decode($tmpproject['members'], true);
                $ids = array_column($tmpmembers, 'id', "");

                foreach ($ids as $tmp) {
                    $statement = $pdo->prepare("SELECT projects FROM users WHERE pk_id =? ");
                    $statement->execute(array($tmp));
                    $projects = $statement->fetch()[0];
                    $projects = json_decode($projects);
                    //delete Project from user-projects array and reformat the array
                    unset($projects[array_search(filter_var($_DELETE['id'], FILTER_SANITIZE_STRING), $projects)]);
                    $projects = array_values($projects);
                    //save the new project array to the users-projects
                    $statement = $pdo->prepare("UPDATE `users` SET `projects` = ? WHERE `users`.`pk_id` = ?");
                    $statement->execute(array(json_encode($projects), $tmp));
                }

                header("HTTP/1.1 204 No Content ");
            } else {
                showError("You are not allowed to delete this", 403);
            }
        } else {
            showError("Invalid Request", 400);
        }
    } else {
        showError("Missing id, please specify it with &id=value", 400);
    }
}

function isValidProject($id, $pdo)
{
    $statement = $pdo->prepare("SHOW TABLES IN design_revision LIKE 'project_%' ");
    $statement->execute();
    $row = $statement->fetchAll();
    $tables = array();
    for ($i = 0; $i < count($row); $i++) {
        //Store all table names in an array
        array_push($tables, $row[$i][0]);
    }
    if (in_array($id, $tables)) {
        return true;
    } else {
        return false;
    }
}

//Make sure you validate the id before calling this method
function getLatestProjectData($id, $pdo)
{
    $statement = $pdo->prepare("SELECT * FROM " . $id . " ORDER BY version DESC LIMIT 1 ");
    $statement->execute();
    return $statement->fetch();
}

function isAdmin($lastrow, $userid)
{
    $members = json_decode($lastrow['members'], true);
    foreach ($members as $member) {
        if ($member['id'] == $userid && $member['role'] == 1) {
            return true;
            break;
        } else {
            return false;
        }
    }
}

function emailToId($email)
{
    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    $statement = $pdo->prepare("SELECT pk_id FROM `users` WHERE email = ?");
    $statement->execute(array($email));
    $tmpid = $statement->fetch();
    return $tmpid[0];
}

//Converts a 2 dimensional array to lowercase
function nestedLowercase($value)
{
    if (is_array($value)) {
        return array_map('nestedLowercase', $value);
    }
    return strtolower($value);
}

//$id => Userid, $pid => project id
function updateUserProjects($pdo, $id, $pid)
{
    //fetch all projectdata of the user
    $statement = $pdo->prepare("SELECT projects FROM `users` WHERE pk_id = ? ");
    $statement->execute(array($id));
    $tmpprojects = json_decode($statement->fetch()[0]);

    //and save the new project to the user
    array_push($tmpprojects, $pid);
    $statement = $pdo->prepare("UPDATE `users` SET `projects` = ? WHERE `users`.`pk_id` = ?");
    $statement->execute(array(json_encode($tmpprojects), $id));

}