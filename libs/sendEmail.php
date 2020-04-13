<?php

use PHPMailer\PHPMailer\PHPMailer;

require_once("config.php");
require_once("PHPMailer.php");
require_once("SMTP.php");

/**
 * @param $toAdr String
 * @param $toName String
 * @param $subject String
 * @param $content String
 * @return bool Success
 */
function sendMail($toAdr, $toName, $subject, $content)
{
    $mail = new PHPMailer(true);
    try {
        $mail->SMTPDebug = 0; //debug-level
        $mail->XMailer = ' ';
        $mail->isSMTP();
        $mail->Host = emailHost;
        $mail->SMTPAuth = true;
        $mail->Username = emailUsername;
        $mail->Password = emailPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = emailPort;

        //Recipients
        $mail->setFrom(emailFromaddress, emailFromname);
        $mail->addAddress($toAdr, $toName);

        // Content
        $mail->CharSet = 'UTF-8';
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $content;

        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}