<?php
require "../libs/auth.php";
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
//veraltet
if (!empty($_GET['getuser'])) {
    showError("Outdated -use getuser instead", 400);
} else if (isset($_GET['getuser'])) {
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
    //TODO DATABASE LOGIC!!
    $target_dir = "../user-content/";
    $hash = bin2hex(openssl_random_pseudo_bytes(4));
    $filename = $hash . time() . $hash . ".pdf";
    $target_file = $target_dir . basename($filename);

    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
    //TODO Check file size (in Bytes)
    if ($_FILES["file"]["type"] == "application/pdf" && $imageFileType == "pdf" && !file_exists($target_file) && $_FILES["file"]["size"] < 524288000) {
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
            header("HTTP/1.1 201 Created ");
            handleOutput("Successful uploaded file");
        } else {
            showError("Something went seriously wrong", 500);
        }
    } else {
        showError("Invalid Request", 400);
    }


} else if ($method == "PUT") {
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

            $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
            //TODO Check file size (in Bytes)
            if ($_FILES["file"]["type"] == "application/pdf" && $imageFileType == "pdf" && !file_exists($target_file) && $_FILES["file"]["size"] < 524288000) {
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

    /*
     * DELETE PROJECT
     */
} else if ($method == "DELETE") {
    $_DELETE = null;
    parse_str(file_get_contents('php://input'), $_DELETE);
    $id = $_DELETE['id'];
    //TODO Check Permission and add db logic
    handleOutput("get delete request");
    //header("HTTP/1.1 204 No Content ");
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
    $err = array("error" => array("message" => $error, "http-code" => $code, "http-message" => $http_message, "method" => $_SERVER['REQUEST_METHOD'], "query-string" => $_SERVER['QUERY_STRING'], "api-ersion" => 1.3));
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
            return ["name" => $user['name'], "email" => $user['email'], "company" => $user['company'], "status" => $user['status'], "avatar" => "../api/avatar.php?name=" . $user['name'], "projects" => json_decode($user['projects'])];
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
                        handleOutput(array("link" => "../user-content/test.pdf", "data" => "Some kind of data kp"));
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
