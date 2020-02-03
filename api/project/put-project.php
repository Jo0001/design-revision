<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
require "../../libs/sendEmail.php";

$page = explode("?", basename(filter_var($_SERVER['REQUEST_URI']), FILTER_SANITIZE_URL))[0];

$_PUT = null;
parse_str(file_get_contents('php://input'), $_PUT);

if ($page == "addmember") {
    addmember();

} elseif ($page == "removemember") {
    removemember();
} elseif ($page == "updatecomments") {
    updateProjectData();
} else {
    showError("Bad Request", 400);
}

function updateProjectData()
{

    if (isset($_PUT['id']) && isset($_PUT['comment'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');
        $pid = "project_" . $pid;

        //Check if user is logged in and a projectmember
        if (isLoggedIn() && isValidProject($pid, $pdo) && isMember($pid, getUser('pk_id'))) {

            $data = filter_var($GLOBALS['_PUT']['comment'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
            //Check if JSON is valid
            if (!isJson($data)) {
                showError("No JSON Data", 400);
            }

            $statement = $pdo->prepare("SELECT data FROM " . $pid . " ORDER BY version DESC LIMIT 1 ");
            $statement->execute();
            $tmpdata = $statement->fetch()[0];

            //Check if entry of db is empty/null
            $newdata = array(json_decode($data, true));
            if (!is_null($tmpdata)) {
                $olddata = json_decode($tmpdata, true);
                $result = array_merge($olddata, $newdata);
            } else {
                $result = $newdata;
            }
            $statement = $pdo->prepare("UPDATE " . $pid . " SET data = ?  ORDER BY version DESC LIMIT 1 ");
            $statement->execute(array(json_encode($result)));

        } else {
            showError("Not logged in/ project member", 401);
        }
    } else {
        showError("Invalid Request", 400);
    }
}

function addmember()
{
    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['member'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $member = filter_var($GLOBALS['_PUT'] ['member'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

        $pid = "project_" . $pid;
        $pdo = new PDO('mysql:host=localhost;dbname=design_revision', 'dsnRev', '4_DiDsrev2019');

        if (isValidProject($pid, $pdo) &&isJson($member)) {

            $statement = $pdo->prepare("SELECT email FROM `users` ");
            $statement->execute();
            $tmpmails = $statement->fetchAll();
            //Create a one dimensional array with all emails from the db
            $useremails = array();
            foreach ($tmpmails as $tmp) {
                array_push($useremails, $tmp['email']);
            }

            //convert json post to php array format
            $member = json_decode($member, true);

            //Remove double entries from the array//TODO Really needed??
            $member = array_unique($member, SORT_REGULAR);

            $memberids = array();

            $pid = explode("project_", $pid)[1];

            //Converts everything to lowercase
            $member = array_map('nestedLowercase', $member);


            $projectname = "testname-change-later";//TODO

            $done = false;
            foreach ($useremails as $tmp) {
                //check if user has an account
                if ($member['email'] == $tmp) {
                    echo "Found";
                    $id = emailToId($tmp);

                    //get array with all roles and emails as index and select the one equal to the current email and save it
                    $role = $member['role'];
                    array_push($memberids, array("id" => (int)$id, "role" => $role));

                    updateUserProjects($pdo, $id, $pid);//TODO CHeck

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
                    $done = true;
                    break;
                }
            }

            handleOutput($member['email']);
            if (!$done) {
                $statement = $pdo->prepare("INSERT INTO `users` (`pk_id`, `name`, `company`, `email`, `pswd`, `projects`, `status`, `token`, `token_timestamp`) VALUES (NULL, '', NULL, ?, '', ?, 'INVITE', NULL, CURRENT_TIMESTAMP)");
                $statement->execute(array($member['email'], json_encode(array($pid))));
                $role = $member['role'];
                array_push($memberids, array("id" => (int)$pdo->lastInsertId(), "role" => $role));

                $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/login/loginNewAccount.html?email=" . $member['email'];
                sendMail($member['email'], $member['email'], "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenNew.html", null, $link, $projectname, 1));

            }


        } else {
            showError("Invalid Request", 400);
        }

    } else {
        showError("Missing id/member data", 400);
    }
}

function removemember()
{
    handleOutput("Just a demo without ANY logic");
}