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
    <title>Customer Dashboard</title>
    <link href="../files/css/CustomerDashboard..css" rel="stylesheet">
    <link href="../files/css/message.css" rel="stylesheet">
    <script src="../files/js/CustumorDashboard.js"></script>
    <script src="../files/js/message.js"></script>
    <link href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" rel="icon" type="image/x-icon">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet">
</head>
<body style="overflow: hidden;display:none">
<div class="topDivs">
    <img alt="tick" height="100%" src="https://cdn-design-revision.netlify.app/files/img/logo.png"
         style="float: left"
         width="100">
    <div id="pageLoader"></div>
    <a href="../login/?logout">Log Out</a>
    <form enctype="multipart/form-data" autocomplete="off" id="search1">
        <div class="autocomplete" style="float: right">
            <label>
                <input id="searchform" name="searchform" onkeyup="showRes()" placeholder="Projektname"
                       type="text">
            </label>
        </div>
    </form>
</div>
<div class="space"></div>
<div class="form" id="form1">
    <form enctype="multipart/form-data" id="CustumorDashForm" method="post">
        <h2 id="projektErstellen">Projekt erstellen</h2>
        <label>
            <input id="projectname" name="projectname" placeholder="Projektname" required type="text">
        </label><br>
        <span id="nameToLong"></span><br>
        <span id="AddOrDelete"></span><br>
        <span id="emailSpan">
        <label>
            <input id="email" name="email" placeholder="E-mail" required style="width: 60%" type="email">
        </label>
            <select id="AdminOrMember" name="AdminOrMember" required>
                <option disabled hidden selected value="">Auswählen</option>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
            </select></span>
        <span id="messageRole"></span><br>
        <span id="messageEmail"></span><br>
        <span id="messageDoubleSelected"></span><br>
        <input onclick="addEmailField()" id="newEmail"
               type="button" value="Weiterer Nutzer auswählen"/> <br>
        <input accept="application/pdf" id="inputFile" name="inputFile" style="display: none;" type="file"/>
        <input onclick="document.getElementById('inputFile').click();"
               type="button"
               value="Datei suchen"/>
        <div class="image-preview" id="imagePreview">
            <img alt="PDF" id="pdfIcon" src="https://cdn-design-revision.netlify.app/files/img/pdf.icon.png"
                 style="display:none;width: 25%;height: 80%;padding-left: 5px"/><br>
            <span class="image-preview__file"></span>
            <span class="image-preview__default-text">Keine Datei ausgew&auml;lt</span>
        </div>
        <input id="btnAddMember" onclick="addMember()"
               type="button"
               value="Member ausw&#228;hlen"/><br>
        <input id="submitButton" type="submit" value="Speichern">
        <b id="loeschen">Kunde löschen</b>
        <div id="loader"><span id="percentage" style="display: none"></span></div>
    </form>
</div>
<dialog aria-labelledby="dialog-heading" id="dialog">
    <p> Wollen sie den Kunden wirklich löschen?</p>
    <p id="pName">Name</p>
    <p id="pProjekt">Projekt</p>
    <button class="Dialog_button" id="btnYes">Ja</button>
    <button class="Dialog_button" onclick="closeNo()">Nein</button>
</dialog>
<h1 id="message" style="color: red;text-align: center;display: none">Keine Treffer</h1>

<!-- response message if sending was successful -->
<div class="warn" id="mes"></div>
<div id="scrollArea" style="position: fixed; top: 11%; width: 76%; height: 90%; min-height: 90%; overflow: hidden;">
    <div id="projectsScrollContainer" style="height: 98%; width: 99%; overflow-x: hidden; overflow-y: scroll;">
    </div>
</div>
</body>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
</html>
