<?php
function generateHash($pdo)
{
    try {
        do {
            $hash = bin2hex(openssl_random_pseudo_bytes(64));
            $statement = $pdo->prepare("SELECT * FROM users WHERE token = :token");
            $result = $statement->execute(array('token' => $hash));
            $token = $statement->fetch();
        } while ($token !== false);
        return $hash;
    } catch (PDOException $e) {
        showError("Something went really wrong", 500);
    }
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

/**
 * @return int ->time-difference in seconds
 */
function dateDifference($d1, $d2)
{
    $date1 = strtotime($d1);
    $date2 = strtotime($d2);
    return abs($date2 - $date1);
}