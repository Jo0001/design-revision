<?php
function isJson($string)
{
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function filterMembers($members)
{
    if (isJson($members)) {

    } else {
        return false;
    }
}

function filterComment($comment)
{
    if (isJson($comment)) {
        $comment = json_decode($comment, true);
        //Check array length and if all fields are present
        if (count($comment) == 11 && array_key_exists("page", $comment) && array_key_exists("x", $comment) && array_key_exists("y", $comment) && array_key_exists("w", $comment) && array_key_exists("h", $comment) && array_key_exists("authorId", $comment) && array_key_exists("commentText", $comment) && array_key_exists("isImplemented", $comment) && array_key_exists("color", $comment) && array_key_exists("cid", $comment) && array_key_exists("type", $comment)) {
            echo "yup";
            //TODO Check for valid content
            return true;
        }
        return false;
    } else {
        return false;
    }
}