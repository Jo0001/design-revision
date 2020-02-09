<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";
if (isLoggedIn()) {
    if (!empty($_GET['file']) && substr(filter_var($_GET['file'], FILTER_SANITIZE_STRING), -4) == ".pdf") {
        $file = "../../user-content/" . filter_var($_GET['file'], FILTER_SANITIZE_STRING);
        //TODO Check if user is projectmember
        if (file_exists($file)) {
            $handle = @fopen($file, "rb");
            header("Content-type: application/pdf");
            header("Content-Length: " . filesize($file));
            header('Content-Transfer-Encoding: binary');
            readfile_chunked($file);
            die;
        } else {
            showError("Found no pdf-file", 404);
        }
    } else {
        showError("Missing file name", 400);
    }

} else {
    showError("Login to get the requested data", 401);
}

// Read a file and display its content chunk by chunk
function readfile_chunked($filename, $retbytes = TRUE)
{
    $chunksize = 1024 * 1024; //size in bytes
    $buffer = '';
    $cnt = 0;
    $handle = fopen($filename, 'rb');

    if ($handle === false) {
        return false;
    }

    while (!feof($handle)) {
        $buffer = fread($handle, $chunksize);
        echo $buffer;
        ob_flush();
        flush();

        if ($retbytes) {
            $cnt += strlen($buffer);
        }
    }

    $status = fclose($handle);

    if ($retbytes && $status) {
        return $cnt; // return num. bytes delivered like readfile() does.
    }

    return $status;
}
