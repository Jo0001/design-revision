<?php
if (!empty($_GET['name'])) {
    $name = filter_var($_GET['name'], FILTER_SANITIZE_STRING);

    header('Content-Type: image/png');
    $im = imagecreatetruecolor(128, 128);

    imagealphablending($im, true);
    imagesavealpha($im, true);

    $white = imagecolorallocate($im, 255, 255, 255);

    $bgcolor = imagecolorallocatealpha($im, 255, 20, 0, 50);
    imagefill($im, 0, 0, $bgcolor);

    $text = strtoupper($name[0]);
    $font = '../libs/arial.ttf';

    //center the image
    $xi = imagesx($im);
    $yi = imagesy($im);
    $box = imagettfbbox(99, 0, $font, $text);
    $xr = abs(max($box[2], $box[4]));
    $yr = abs(max($box[5], $box[7]));
    $x = intval(($xi - $xr) / 2);
    $y = intval(($yi + $yr) / 2);

    imagettftext($im, 99, 0, $x, $y, $white, $font, $text);
    imagepng($im);
    imagedestroy($im);
}else {
    header("HTTP/1.0 400 Bad Request");
}
