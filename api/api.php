<?php
require "../libs/auth.php";
header("Access-Control-Allow-Origin: http://design-revision.ddns.net");
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
    //TODO  needs testing
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
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-version" => 1.5));
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
            return ["name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "avatar" => "../api/avatar.php?name=" . $user['name'][0], "projects" => json_decode($user['projects'])];
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
            $id = (int)$id;
            if (in_array($id, json_decode(getUser("projects")))) {
                $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
                $statement = $pdo->prepare("SELECT * FROM projects WHERE pd_id = :pd_id");
                $result = $statement->execute(array('pd_id' => $id));
                $project = $statement->fetch();
                if (!empty($project)) {
                    if ($value == "data") {
                        handleOutput(array("link" => "../user-content/test3.pdf", "data" => "Some kind of (JSON) data"));
                    } else {
                        handleOutput(array("project" => array("id" => $id, "name" => $project['name'], "status" => $project['status'], "link" => "demo", "version" => ++$id, "members" => json_decode($project['members']))));
                    }
                } else {
                    showError("Found no project with id " . $id, 404);
                }
            } else {
                showError("You are not allowed to view this", 403);
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
    if (isLoggedIn()) {
        $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
        $members = filter_var($_POST['members'], FILTER_SANITIZE_STRING);
        $target_dir = "../user-content/";
        $hash = bin2hex(openssl_random_pseudo_bytes(4));
        $filename = $hash . time() . $hash . ".pdf";
        $target_file = $target_dir . basename($filename);
        $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

        if ($_FILES["file"]["type"] == "application/pdf" && $fileType == "pdf" && !file_exists($target_file) && $_FILES["file"]["size"] < 500000001 && strlen($name)<81) {
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
                //Generate Table
                $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
                $result = 0;
                do {
                    $t_name = "project_" . bin2hex(openssl_random_pseudo_bytes(4));
                    try {
                        $statement = $pdo->prepare("CREATE TABLE `design_revision`.`" . $t_name . "` ( `p_name` VARCHAR(80) NOT NULL , `version` INT(10) UNSIGNED NOT NULL DEFAULT '1', `link` VARCHAR(30) NOT NULL , `members` VARCHAR(181) NOT NULL , `status` VARCHAR(20) NOT NULL , `lastedit` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , `data` VARCHAR(255) NULL , PRIMARY KEY (`version`)) ENGINE = InnoDB");
                        $result = $statement->execute();
                    } catch (PDOException $e) {
                    }
                } while (!$result);
                //Save the default data
                date_default_timezone_set('Europe/Berlin');
                $date = date("Y-m-d H:i:s");
                $statement = $pdo->prepare("INSERT INTO " . $t_name . " (p_name, link, members,status,lastedit) VALUES (?, ?, ?,?,?)");
                //TODO Check member data and inform sendMail to new members
                $statement->execute(array($name, $filename, $members, 'WAITING_FOR_RESPONSE', $date));

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
    if (isset($_PUT['updateproject'])) {
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
    $id = filter_var($_DELETE['id'], FILTER_SANITIZE_STRING);
    //TODO Check Permission and delete all files from the disk

    $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
    if (isValidProject($id, $pdo)) {
        $statement = $pdo->prepare("DROP TABLE `" . $id . "`");
        $statement->execute();

        handleOutput(isValidProject($id, $pdo) . "get delete request for " . $id);
        //header("HTTP/1.1 204 No Content ");
    } else {
        showError("Invalid Request", 400);
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
