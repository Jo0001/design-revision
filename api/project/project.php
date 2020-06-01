<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";

function check_id()
{
    if (!empty($_GET['id'])) {
        return filter_var($_GET['id'], FILTER_SANITIZE_STRING);
    }
}

$id = check_id();
if (!is_null($id)) {
    if (isLoggedIn()) {
        $id = "project_" . $id;
        $pdo = $GLOBALS['pdo'];
        if (isValidProject($id, $pdo)) {
            $project = getLatestProjectData($id, $pdo);
            if (isMember($id, getUser('pk_id'))) {
                $page = explode("?", basename(filter_var($_SERVER['REQUEST_URI']), FILTER_SANITIZE_URL))[0];
                try {
                    if ($page == "data") {
                        $statement = $pdo->prepare("SELECT data FROM " . $id);
                        $statement->execute();
                        $rawdata = $statement->fetchAll();
                        $output = array();
                        //Check what we should give out
                        if (!empty($_GET['type'])) {
                            $type = filter_var($_GET['type'], FILTER_SANITIZE_STRING);
                            if ($type === "solved") {
                                foreach ($rawdata as $tmp) {
                                    $data = json_decode($tmp['data'], true);
                                    foreach ($data as $tmp2) {
                                        if ($tmp2['isImplemented'] === true) {
                                            array_push($output, $tmp2);
                                        }
                                    }
                                }

                            } elseif ($type === "unsolved") {
                                foreach ($rawdata as $tmp) {
                                    $data = json_decode($tmp['data'], true);
                                    foreach ($data as $tmp2) {
                                        if ($tmp2['isImplemented'] === false) {
                                            array_push($output, $tmp2);
                                        }
                                    }
                                }

                            } else {
                                showError("Unknown type", 400);
                            }

                        } else {
                            foreach ($rawdata as $tmp) {
                                if (!is_null($tmp[0])) {
                                    foreach (json_decode($tmp[0]) as $tmp2) {
                                        array_push($output, $tmp2);
                                    }
                                } else {
                                    $output = array();
                                }
                            }
                        }
                        handleOutput(array("link" => $project['link'], "data" => $output));
                    } else if ($page == "history") {
                        $statement = $pdo->prepare("SELECT version, link, lastedit FROM " . $id);
                        $statement->execute();
                        $history = array();
                        foreach ($statement->fetchAll() as $tmp) {
                            array_push($history, array("link" => $tmp['link'], "lastedit" => $tmp['lastedit'], "version" => (int)$tmp['version']));
                        }
                        handleOutput($history);
                    } else {
                        handleOutput(array("project" => array("name" => $project['p_name'], "status" => $project['status'], "version" => (int)$project['version'], "lastedit" => $project['lastedit'], "members" => json_decode($project['members']))));
                    }
                } catch (PDOException $e) {
                    showError("Something went really wrong", 500);
                }
            } else {
                showError("Not a member", 403);
            }
        } else {
            showError("Invalid Request", 400);
        }
    } else {
        showError("Login to get the requested data", 401);
    }
} else {
    showError("Missing id, please specify it with ?id=value", 400);
}