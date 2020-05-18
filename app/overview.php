<?php
require "../libs/auth.php";
if (!isLoggedIn()) {
    header("Location: ../login/?returnto=" . getCurrentURL());
    die;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <link href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" rel="icon" type="image/x-icon">
    <title>Versionen</title>
    <link href="../files/css/VersionOverview.css" rel="stylesheet">
    <script src="../files/js/message.js"></script>
    <script src="../files/js/VersionOverview.js"></script>
    <link href="../files/css/message.css" rel="stylesheet">
</head>
<body>
<div class="topimg">
    <a href="../app/">Zur&uuml;ck</a>
    <img alt="tick" height="100" src="https://cdn-design-revision.netlify.app/files/img/logo.png"
         style="float: left"
         width="100">
    <h1>Versions&uuml;bersicht</h1>

</div>
<div class="space">
</div>
<div class="table">
    <div class="row">
        <div class="nummer">
            <p>Nummer</p>
        </div>
        <div class="link">
            <p>Link</p>
        </div>
        <div class="ZuletztBearbeitet">
            <p>Zuletzt Bearbeitet</p>
        </div>
    </div>

    <div class="row">
        <div class="tnummer" id="tnummer">

        </div>
        <div class="tlink" id="tlink">

        </div>
        <div class="tZuletztBearbeitet" id="tZuletztBearbeitet">

        </div>
    </div>
</div>
<!-- response message if sending was successful -->
<div class="warn" id="mes"></div>
</body>
</html>
