<?php
$array = json_decode(getModifiedData(getCursor()), true);
test($array['entries'][2]['cursor']);


function getModifiedData($cursor)
{
    $ch = curl_init("https://api.dropboxapi.com/2/files/list_folder/continue");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer B9jyY_ay_UAAAAAAAAAafR5BQwuqYDwWdAL3Jlnz01y8fYLVpfCFmxa5CiYTVwr5', 'Content-type: application/json'));
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{"cursor": "' . $cursor . '"}');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

//Just for localhost!!!
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    echo $response;
    return $response;
}

function getCursor()
{
    $ch = curl_init("https://api.dropboxapi.com/2/files/list_folder");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer B9jyY_ay_UAAAAAAAAAafR5BQwuqYDwWdAL3Jlnz01y8fYLVpfCFmxa5CiYTVwr5', 'Content-type: application/json'));
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{"path": "","recursive": false,"include_media_info": false,"include_deleted": false,"include_has_explicit_shared_members": false,"include_mounted_folders": true,"include_non_downloadable_files": true}');
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

//Just for localhost!!!
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $response = curl_exec($ch);
    $array = json_decode($response, true);
    return $array['cursor'];
}


function test($h)
{
    echo "<BR>DEBUG:<b>$h</b>";

}