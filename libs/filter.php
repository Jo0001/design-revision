<?php
function isJson($string)
{
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

function filterMembers($members)
{
    if (isJson($members)) {
        $members = json_decode($members, true);
        foreach ($members as $member) {
            if (!count($member) == 2 || !array_key_exists("email", $member) || !array_key_exists("role", $member) || !filter_var($member['email'], FILTER_VALIDATE_EMAIL) || strlen($member['role']) !== 1) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

function filterMember($member)
{
    if (isJson($member)) {
        $member = json_decode($member, true);
        if (!count($member) == 2 || !array_key_exists("email", $member) || !array_key_exists("role", $member) || !filter_var($member['email'], FILTER_VALIDATE_EMAIL) || strlen($member['role']) !== 1) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}

function filterComment($comment)
{
    if (isJson($comment)) {
        $comment = json_decode($comment, true);
        //Check array length and if all fields are present
        if (count($comment) == 12 && array_key_exists("page", $comment) && array_key_exists("x", $comment) && array_key_exists("y", $comment) && array_key_exists("w", $comment) && array_key_exists("h", $comment) && array_key_exists("authorId", $comment) && array_key_exists("commentText", $comment) && array_key_exists("isImplemented", $comment) && array_key_exists("color", $comment) && array_key_exists("cid", $comment) && array_key_exists("type", $comment) && array_key_exists("version", $comment)) {
            /*
  Max page value: 999
  Max authorId value: 9999
  Max commentText length: 250letters
  Max cid length: 10letters
  Max type value: 9
  Max version value: 99
  */
            return ($comment['page'] <= 999 && strlen($comment['x']) == 10 && strlen($comment['y']) == 10 && isValidPos($comment['w']) && isValidPos($comment['h']) && strlen($comment['authorId']) <= 4 && strlen($comment['commentText']) <= 250 && is_bool($comment['isImplemented']) && strlen($comment['color']) == 7  && strlen($comment['cid']) <= 10 && strlen($comment['type']) == 1 && strlen($comment['version']) <= 99);
        }
        return false;
    } else {
        return false;
    }
}

function isValidPos($num)
{
    return strlen($num) == 9;
}