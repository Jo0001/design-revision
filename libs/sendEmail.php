<?php

use PHPMailer\PHPMailer\PHPMailer;

require_once("PHPMailer.php");
require_once("SMTP.php");

function sendMail($toAdr, $toName, $subject, $content)
{
    $mail = new PHPMailer(true);
    try {
        //debug-level
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->Host = 'mail.gmx.de';
        $mail->SMTPAuth = true;
        $mail->Username = 'design-revision@gmx.de';
        $mail->Password = 'dsnRev-4D#2020';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 587;

        //Recipients
        $mail->setFrom('design-revision@gmx.de', 'Design Revision');
        $mail->addAddress($toAdr, $toName);

        // Content
        $mail->CharSet = 'UTF-8';
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $content;
        //$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

        $mail->send();
        //TODO Output just for development!
        echo 'Message has been sent';
    } catch (Exception $e) {
        header("HTTP/1.1 500 Internal Server Error");
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}