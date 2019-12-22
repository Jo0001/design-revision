<?php
//TODO Needs testing with more users
function generateHash($pdo)
{
    do {
        $hash = bin2hex(openssl_random_pseudo_bytes(64));
        $statement = $pdo->prepare("SELECT * FROM users WHERE token = :token");
        $result = $statement->execute(array('token' => $hash));
        $token = $statement->fetch();
    } while ($token !== false);
    return $hash;
}

function parseHTML($file_path, $name, $link, $project_name, $project_version)
{
    $template = file_get_contents($file_path, false);
    $template = str_replace("{name}", $name, $template);
    $template = str_replace("{link}", $link, $template);
    $template = str_replace("{project-name}", $project_name, $template);
    $template = str_replace("{project-version}", $project_version, $template);
    return $template;
}

function dateDifference($d1, $d2)
{
    $date1 = date_create($d1);
    $date2 = date_create($d2);
    $diff = date_diff($date1, $date2);
    return $diff->format("%h");

}