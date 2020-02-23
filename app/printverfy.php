<?php
if (!empty($_POST['code']) && !empty($_GET['id'])) {
    $code =   filter_var($_POST ['code'], FILTER_SANITIZE_STRING);
    $pid =   filter_var($_GET ['id'], FILTER_SANITIZE_STRING);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Druckfreigabe bestätigen</title>
    <link rel="stylesheet" type="text/css" href="../files/css/layout.css">
    <link rel="icon" href="https://cdn-design-revision.netlify.com/files/img/favicon.ico" type="image/x-icon">
</head>
<body>
<div class="middle">
    <form method="post">
        <input type="text" placeholder="123456" name="code" required>
        <br>
        <input type="submit" value="Endg&uuml;ltig zum Druckfreigeben">
    </form>
</div>
</body>
</html>

