<?php
use PHPMailer\PHPMailer\PHPMailer;
require("PHPMailer.php");
require ("SMTP.php");
$mail = new PHPMailer(true);

try {
    //debug-level
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->Host       = 'mail.gmx.de';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'design-revision@gmx.de';
    $mail->Password   = 'dsnRev-4D';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
   // $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 587;

    //Recipients
    $mail->setFrom('design-revision@gmx.de', 'Design Revision');
    $mail->addAddress('design-revision@gmx.de', 'Max Mustermann');

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Here is the subject';
    $mail->Body    = 'This is the HTML message body <b>in bold!</b>';
    //$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}