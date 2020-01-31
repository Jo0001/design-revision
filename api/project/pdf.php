<?php
require "../../libs/auth.php";
if (isLoggedIn() && !empty($_GET['file'])) {
    //TODO Check if user is projectmember
    $file = "../../user-content/" . filter_var($_GET['file'], FILTER_SANITIZE_STRING);

    if (file_exists($file)&& substr($file, -4)==".pdf") {
        $handle = @fopen($file, "rb");
        header("Content-type: application/pdf");
        header("Content-Length: " . filesize($file));
        header('Content-Transfer-Encoding: binary');
        readfile_chunked($file);
        die;
    } else {
        header("HTTP/1.1 404 Not Found");
        die;
    }
} else {
    header('WWW-Authenticate: Login to get the requested data');
    header("HTTP/1.1 401 Unauthorized ");
    die;
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
