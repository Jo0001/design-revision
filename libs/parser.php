<?php
function parseHTML($file_path, $name, $link, $project_name, $project_version)
{
    $template = file_get_contents($file_path, false);
    $template = str_replace("{name}", $name, $template);
    $template = str_replace("{link}", $link, $template);
    $template = str_replace("{project-name}", $project_name, $template);
    $template = str_replace("{project-version}", $project_version, $template);
    return $template;
}