<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
require "../../libs/sendEmail.php";
require "../../libs/filter.php";

$page = explode("?", basename(filter_var($_SERVER['REQUEST_URI']), FILTER_SANITIZE_URL))[0];

$_PUT = null;
parse_str(file_get_contents('php://input'), $_PUT);

if ($page === "addmember") {
    addmember();
} elseif ($page === "removemember") {
    removemember();
} elseif ($page === "addcomment") {
    addComment();
} elseif ($page === "solvecomment") {
    solveComment();
} elseif ($page === "updatestatus") {
    updateStatus();
} else {
    showError("Bad Request", 400);
}

function addComment()
{

    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['comment'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $pdo = $GLOBALS['pdo'];
        $pid = "project_" . $pid;

        //Check if user is logged in and a projectmember
        if (isLoggedIn() && isValidProject($pid, $pdo) && isMember($pid, getUser('pk_id'))) {

            $data = filter_var($GLOBALS['_PUT']['comment'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
            //Check if JSON is valid
            if (!filterComment($data)) {
                showError("No (valid) JSON Data", 400);
            }
            try {
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
            } catch (PDOException $e) {
                showError("Something went really wrong", 500);
            }
            header("HTTP/1.1 204 No Content");

        } else {
            showError("Not logged in/ project member", 401);
        }
    } else {
        showError("Invalid Request", 400);
    }
}

function addmember()
{
    if (!empty($GLOBALS['_PUT'] ['id']) && !empty($GLOBALS['_PUT'] ['member'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $member = filter_var($GLOBALS['_PUT'] ['member'], FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

        if (!filterMember($member)) {
            showError("No (valid) JSON Data", 400);
        }

        $pid = "project_" . $pid;
        $pdo = $GLOBALS['pdo'];

        if (isLoggedIn()) {

            if (isValidProject($pid, $pdo) && isJson($member)) {
                if (isAdmin(getLatestProjectData($pid, $pdo), getUser('pk_id'))) {
                    try {

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

                        //Remove double entries from the array
                        $member = array_unique($member, SORT_REGULAR);

                        $role = (int)$member['role'];

                        $projectname = getLatestProjectData($pid, $pdo)['p_name'];


                        //Converts everything to lowercase
                        $member = array_map('nestedLowercase', $member);

                        $name = getUser('name');

                        //check if user has already an account
                        if (in_array($member['email'], $useremails)) {
                            $id = emailToId($member['email']);

                            if (isMember($pid, $id)) {
                                showError("Is already a member", 400);
                            }

                            $pid = explode("project_", $pid)[1];
                            updateUserProjects($pdo, $id, $pid);

                            //Save the new user as member to the project
                            updateProjectMember("project_" . $pid, $id, $role, $pdo);

                            $statement = $pdo->prepare("SELECT * FROM `users` WHERE pk_id = ?");
                            $statement->execute(array($id));
                            $results = $statement->fetch();
                            $status = $results['status'];
                            //Inform user per email about the new project
                            if ($status == INVITE) {
                                informNewbie($member['email'], $projectname, $name);
                            } else {
                                $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/app/edit.php?id=" . $pid;
                                sendMail($member['email'], IdToName($pdo, $id), "Einladung zu \"" . $projectname . "\"", parseHTML("../../libs/templates/emailFreigebenAcc.html", $name, $link, $projectname, 1));
                            }

                        } else {

                            $pid = explode("project_", $pid)[1];
                            $statement = $pdo->prepare("INSERT INTO `users` (`pk_id`, `name`, `company`, `email`, `pswd`, `projects`, `status`, `token`, `token_timestamp`) VALUES (NULL, '', NULL, ?, '', ?, 'INVITE', NULL, CURRENT_TIMESTAMP)");
                            $statement->execute(array($member['email'], json_encode(array($pid))));

                            //Save the new user as member to the project
                            $newID = (int)$pdo->lastInsertId();
                            updateProjectMember("project_" . $pid, $newID, $role, $pdo);

                            informNewbie($member['email'], $projectname, $name);

                        }
                    } catch (PDOException $e) {
                        showError("Something went really wrong", 500);
                    }
                    header("HTTP/1.1 204 No Content");

                } else {
                    showError("Not member/ not an admin", 403);
                }
            } else {
                showError("Invalid Request", 400);
            }
        } else {
            showError("Login to perform that action", 401);
        }

    } else {
        showError("Missing id/member data", 400);
    }
}

function removemember()
{
    if (!empty($GLOBALS['_PUT'] ['id']) && !empty($GLOBALS['_PUT'] ['member'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $member = (int)filter_var($GLOBALS['_PUT'] ['member'], FILTER_SANITIZE_NUMBER_INT);
        if (isLoggedIn()) {
            $pid = "project_" . $pid;
            $pdo = $GLOBALS['pdo'];
            if (isValidProject($pid, $pdo)) {
                if (isAdmin(getLatestProjectData($pid, $pdo), getUser('pk_id'))) {
                    if (isMember($pid, $member)) {
                        //Delete userid from project memberslist and save to db
                        $members = json_decode(getLatestProjectData($pid, $pdo)['members'], true);
                        foreach ($members as $tmp => $temp) {
                            if ($temp['id'] === $member) {
                                unset($members[$tmp]);
                                break;
                            }
                        }
                        //Convert Object back to array und reindex
                        $members = (array)$members;
                        $members = array_values($members);
                        try {
                            $statement = $pdo->prepare("UPDATE " . $pid . " SET members = ?  ORDER BY version DESC LIMIT 1 ");
                            $statement->execute(array(json_encode($members)));

                            //Delete project-id from user
                            $statement = $pdo->prepare("SELECT projects from users WHERE pk_id = ?");
                            $statement->execute(array($member));
                            $userprojects = json_decode($statement->fetch()['projects']);
                            $pid = explode("project_", $pid)[1];
                            unset($userprojects[array_search($pid, $userprojects, true)]);
                            $userprojects = array_values($userprojects);
                            $statement = $pdo->prepare("UPDATE users SET projects = ? WHERE pk_id = ?");
                            $statement->execute(array(json_encode($userprojects), $member));
                        } catch (PDOException $e) {
                            showError("Something went really wrong", 500);
                        }

                        header("HTTP/1.1 204 No Content");
                    } else {
                        showError("Not a member", 400);
                    }
                } else {
                    showError("Forbidden", 403);
                }
            } else {
                showError("Invalid Request", 400);
            }
        } else {
            showError("Login to perform this action", 401);
        }
    } else {
        showError("Missing id/member id", 400);
    }
}

function updateStatus()
{
    if (!empty($GLOBALS['_PUT'] ['id']) && !empty($GLOBALS['_PUT'] ['status'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $status = filter_var($GLOBALS['_PUT'] ['status'], FILTER_SANITIZE_STRING);

        $pid = "project_" . $pid;
        $pdo = $GLOBALS['pdo'];
        if (isLoggedIn()) {
            if (isValidProject($pid, $pdo)) {
                $projectdata = getLatestProjectData($pid, $pdo);
                $currentStatus = $projectdata['status'];
                if (isMember($pid, getUser('pk_id'))) {
                    if ($status === TODO) {
                        //Inform agency
                        if ($currentStatus === WAITING_FOR_RESPONSE) {
                            changeStatus($pdo, $pid, TODO);
                            $members = json_decode($projectdata['members'], true);
                            $projectname = getLatestProjectData($pid, $pdo)[0];
                            $user = getUser('name');
                            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/app/edit.php?id=" . explode("project_", $pid)[1];
                            $version = getLatestProjectData($pid, $pdo)[1];

                            foreach ($members as $member) {
                                if ($member['role'] == 1) {
                                    sendMail(IdToEmail($pdo, $member['id']), IdToName($pdo, $member['id']), $user . "hat Änderungswünsche in '" . $projectname . "' gespeichert", parseHTML("../../libs/templates/emailNeueAenderungen.html", $user, $link, $projectname, $version));
                                }
                            }
                            header("HTTP/1.1 204 No Content");
                        } else {
                            showError("something went wrong", 409);
                        }

                    } else if ($status === IN_PROGRESS) {
                        //Just show as work in progress
                        if ($currentStatus === TODO) {
                            changeStatus($pdo, $pid, IN_PROGRESS);
                            header("HTTP/1.1 204 No Content");
                        } else {
                            showError("something went wrong", 409);
                        }


                    } else if ($status === DONE) {
                        if ($currentStatus === WAITING_FOR_RESPONSE) {
                            //Send confirm Mail
                            $link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_STRING) . "/design-revision/app/printverify.php?id=" . explode("project_", $pid)[1];
                            $securitycode = null;
                            for ($i = 0; $i < 6; $i++) {
                                $securitycode .= mt_rand(0, 9);
                            }
                            try {
                                $statement = $pdo->prepare("UPDATE " . $pid . " SET `securitycode` = ?  ORDER BY version DESC LIMIT 1");
                                $statement->execute(array($securitycode));
                            } catch (PDOException $e) {
                                showError("Something went really wrong", 500);
                            }
                            $projectname = getLatestProjectData($pid, $pdo)[0];
                            sendMail(getUser('email'), getUser('name'), "Druckfreigabebestätigung von \"" . $projectname . "\"", parseHTML("../../libs/templates/printverify.html", null, $link, $projectname, $securitycode));
                            header("HTTP/1.1 204 No Content");
                        } else {
                            showError("Something went wrong", 409);
                        }

                    } else {
                        showError("Unknown status. See the docs for help", 400);
                    }
                } else {
                    showError("Not a member", 403);
                }
            } else {
                showError("Invalid Project/status", 400);
            }
        } else {
            showError("Login to perform this action", 401);
        }
    } else {
        showError("Missing project id/status", 400);
    }
}

function solveComment()
{
    if (isset($GLOBALS['_PUT'] ['id']) && isset($GLOBALS['_PUT'] ['cid'])) {
        $pid = filter_var($GLOBALS['_PUT'] ['id'], FILTER_SANITIZE_STRING);
        $cid = filter_var($GLOBALS['_PUT'] ['cid'], FILTER_SANITIZE_NUMBER_INT);
        if (isLoggedIn()) {
            $pid = "project_" . $pid;
            $pdo = $GLOBALS['pdo'];
            if (isValidProject($pid, $pdo)) {
                if (isMember($pid, getUser('pk_id'))) {

                    $versions = getLatestProjectData($pid, $pdo)['version'];
                    try {
                        //Loop through every row
                        for ($i = 1; $i <= $versions; $i++) {

                            //Get whole array from that row
                            $statement = $pdo->prepare("SELECT data from " . $pid . " WHERE version = ? ");
                            $statement->execute(array($i));
                            $rawdata = json_decode($statement->fetch()['data'], true);

                            $j = 0;
                            //Loop through every array from that row
                            foreach ($rawdata as $tmp) {
                                //Check if id matches and change isImplemented to true
                                if ($tmp['cid'] == $cid) {
                                    //Check if comment isnt already solved
                                    if (!$tmp['isImplemented']) {

                                        $tmp['isImplemented'] = true;

                                        //Save edited array back to whole row array and save it back to the database and update lastedit timestamp
                                        $rawdata[$j] = $tmp;
                                        $statement = $pdo->prepare("UPDATE $pid SET data = ?,lastedit = CURRENT_TIMESTAMP  WHERE version = ?");
                                        $statement->execute(array(json_encode($rawdata), $i));

                                        header("HTTP/1.1 204 No Content");
                                        die();
                                    } else {
                                        showError("Already solved", 400);
                                    }
                                }
                                $j++;
                            }

                        }
                    } catch (PDOException $e) {
                        showError("Something went really wrong", 500);
                    }
                    //If we reach this line the comment was not found
                    showError("Not found", 404);

                } else {
                    showError("Not a member", 403);
                }
            } else {
                showError("Invalid request", 400);
            }
        } else {
            showError("Login to perform this action", 401);
        }
    } else {
        showError("Missing project/comment id", 400);
    }

}