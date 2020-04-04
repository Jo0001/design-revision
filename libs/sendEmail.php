<?php

use PHPMailer\PHPMailer\PHPMailer;

require_once ("config.php");
require_once("PHPMailer.php");
require_once("SMTP.php");

function sendMail($toAdr, $toName, $subject, $content)
{
    $mail = new PHPMailer(true);
    try {
        //debug-level
        $mail->SMTPDebug = 0;
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
        //$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

        $mail->send();
       // echo 'Message has been sent to '.$toAdr;
        return true;
    } catch (Exception $e) {
        //echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        return false;
    }
}