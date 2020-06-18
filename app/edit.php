<?php
require "../libs/auth.php";
if(!isLoggedIn()){
    header("Location: ../login/?returnto=".getCurrentURL());
    die;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Editor - DesignRevision</title>
    <link href="https://cdn-design-revision.netlify.app/files/img/favicon.ico" rel="icon" type="image/x-icon">
    <link href="../files/css/Viewport.css" rel="stylesheet">
    <link href="../files/css/CommentDesign.css" rel="stylesheet">
    <link href="../files/css/message.css" rel="stylesheet">
    <script src="../files/js/message.js"></script>
</head>
<body>
<!-- The pdf.js library and controls-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.js"></script>
<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.min.js"></script>-->
<script src="../files/js/viewport.js"></script>
<script async defer src="../files/js/CommentDesign.js"></script>
<div id="titleBar">
    <p id="titleCard">Designvorschlag für /</p>
</div>
<canvas id="pdf" style="top: 20px; left: 10px;"></canvas>
<!--<div id="pdf" style="top: 20px; left: 10px;"></div>-->
<!--<div id="pdf" style="top: 20px; left: 10px;"></div>-->
<div id="commentContainer" style="top: 20px; left: 10px;">
    <div id="commentArea" style="display: none; width: 10px; height: 10px; z-index: -3;"></div>
</div>
<div id="messageDialog"
     style="position: relative; top: 50%; left: 33%; background-color: #333333; z-index: 10; width: 35%; height: 250px; display: none;">
    <table>
        <tr>
            <h1 style="color: white; font-size: 24px; left: 15px; top: 10px; position: relative;">Kommentar
                erstellen:</h1>
            <p id="emailDisplay" style="position: absolute; top: 0; color: white; right: 20px">
                email@thingymagics.com</p>
        </tr>
        <tr>
            <textarea id="commentMsg"
                      style="position: absolute; left: 15px; width: 92%; height: 60%; resize: none;"></textarea>
        </tr>
        <tr>
            <div style="bottom: 40px; position: absolute;">
                <button id="saveCommentBtn" style="background-color: #00620b; left: 12px; position: absolute;">
                    Speichern
                </button>
                <button id="discardCommentBtn" style="background-color: #910000; left: 122px; position: absolute;">
                    Verwerfen
                </button>
            </div>
        </tr>
    </table>

</div>
<div id="filterDialog"
     style="display: none; position: absolute; width: 25%; height: 50%; top: 20%; left: 40%; background-color: #919191">
    <h1 align="center">Kommentarfilter</h1>
    <div style="margin-left: 10px;">
        <h2>Kommentarstatus:</h2>
        <input checked id="allComments" name="filter" type="radio" value="">
        <label for="allComments">Alle Kommentare</label>
        </br>
        <input id="solvedComments" name="filter" type="radio" value="solved">
        <label for="solvedComments">Erledigte Kommentare</label>
        </br>
        <input id="unsolvedComments" name="filter" type="radio" value="unsolved">
        <label for="unsolvedComments">Unerledigte Kommentare</label>
        <h2>Kommentarseite:</h2>
        <table>
            <tr>
                <td>
                    <input checked id="currentPageFilter" name="pageFilter" style="margin-top: 1px;" type="radio">
                    <label for="currentPageFilter">Aktuelle Seite</label>
                </td>
                <td>
                    <input id="certainPages" name="pageFilter" style="margin-top: 1px;" type="radio">
                    <label for="certainPages">Bestimmte Seiten</label>
                </td>
                <td>
                    <input class="textField" id="certainPagesCriteria" name="pageFilter" pattern="^[0-9][-|,]{0,}"
                           placeholder="1,3,6-8"
                           style=" margin-top: 0; position: unset; min-width: 100px; width: 10%;" type="text"
                           value=""/>
                </td>
            </tr>
            <tr>
                <td>
                    <div>
                        <input id="allPages" name="pageFilter" style="margin-top: 1px;" type="radio">
                        <label for="allPages">Alle Seiten</label>
                    </div>
                </td>
            </tr>
        </table>
        <h2>Versionsfilter:</h2>
        <table style="width: 100%;">
            <colgroup>
                <col style="width: 25%;">
                <col style="width: 34%;">
                <col style="width: 23%;">
            </colgroup>
            <tr>
                <td>
                    <input checked id="allVersionsFilter" name="versionFilter" style="margin-top: 1px;" type="radio">
                    <label for="allVersionsFilter">Alle Versionen</label>
                </td>
                <td>
                    <input id="certainVersion" name="versionFilter" style="margin-top: 1px;" type="radio">
                    <label for="certainVersion">ausgewählte Versionen</label>
                </td>
                <td>
                    <input class="textField" id="certainVersionsCriteria" name="versionFilter" pattern="^[0-9][-|,]{0,}"
                           placeholder="1,4,6-8"
                           style=" margin-top: 0; position: unset; min-width: 100px; width: 10%;" type="text"
                           value=""/>
                </td>
            </tr>
        </table>
    </div>
     <button id="applyFilter">Filtereinstellungen speichern</button>
</div>
<div class="toolbox" id="changeCommentContainer"
     style="top: 15%; width: 28%; height: 63%; min-height: 60%; left: 1%;outline-style:none;box-shadow:none;border-color:transparent; padding-right: 15px;">
    <div id="filterContainer" style="margin-left: 10px;">
        <table>
            <colgroup>
                <col style=""/>
                <col style="width: 5%;"/>
            </colgroup>
            <tr style="width: 100%;">
                <td>
                    <label for="searchComments"></label>
                    <input class="textField" id="searchComments" placeholder="Search here."
                           style="position: relative; width: 100%;  text-align: left;"
                           type="text"/>
                </td>
                <td>
                    <button id="filterSettingsBtn"
                            style="font-size: 15px; height: 100%; white-space: normal; word-wrap: break-word;">
                        Filter
                    </button>
                </td>
            </tr>
        </table>
    </div>
    <div id="textCommentContainer"
         style="height: 89%; width: 99%; overflow-x: hidden; overflow-y: scroll; margin-top: 10px;">
        <div id="blueprintTextComment"
             style="position: absolute; display: none; margin: 5px 15px 10px 10px; background-color: dimgrey; border: 2px solid dimgrey; border-radius: 25px;">
            <table style="width: 100%;">
                <tr>
                    <td>
                        <div id="cIContainer" style="width: 100%; min-width: 100%;">
                            <table style="width: 100%; height: 15px;">
                                <tr>
                                    <td>
                                        <p align="left" id="commentIText"
                                           style="margin-left: 10px; margin-right: 10px;">Idk... Just change it. <br>
                                            dsadadas
                                            s <br> lorem...</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width: 80%;">
                                        <p align="left" style="margin-left: 10px; margin-right: 10px;">
                                            geschrieben von
                                            <a href="mailto:email?subject=Kommentar%20im%20Designvorschlag"
                                               id="commentIAuthor"
                                               style="color: white;">email@thingymagics.com</a>
                                        </p>
                                    </td>
                                    <td>
                                        <p id="commentIVersion" style="float: right; margin-left:auto; margin-right:0;">
                                            Some Version.</p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                    <td>
                        <div>
                            <label for="commentIImplemented"></label>
                            <input id="commentIImplemented"
                                   style="width: 15px; height: 15px; float: right;
                                                margin-top: calc(70% - 8px);"
                                   type="checkbox"/>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div id="commentIFinder"
                             style="height: 10px; z-index: 3; margin-bottom: 15px; border-radius: 5px; margin-left: 10px; margin-right: 10px;"></div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</div>
<div class="toolbox" style="top: 40%; right: 1%;outline-style:none;box-shadow:none;border-color:transparent;outline: none;">
    <button class="disSelected" id="movePdf" style="left: 40px; right: 40px; background-color: Transparent;outline: none;"><img
            alt="Move" class="icon" src="https://cdn-design-revision.netlify.app/files/img/move.png"/></button>
    <br/>
    <button class="disSelected" id="zoomPdf" style="left: 40px; right: 40px; background-color: Transparent;outline: none;"><img
            alt="Zoom" class="icon" src="https://cdn-design-revision.netlify.app/files/img/zoom.png"/></button>
    <br/>
    <button class="disSelected" id="createComment" style="left: 40px; right: 40px; background-color: Transparent;outline: none;"><img
            alt="Comment" class="icon" src="https://cdn-design-revision.netlify.app/files/img/addComment.png"/></button>

</div>
<button style="position: absolute; top: 84%; display: none;" id="sendBack">Send back!</button>
<div class="lowerBar" style="outline-style:none;box-shadow:none;border-color:transparent;">
    <button class="button" id="decPage" style="left: 40%;">-</button>
    <label>
        <input class="textField" id="currentPage" onkeypress="return event.charCode >= 48 && event.charCode <= 57"
               style="right: 53%;"
               type="text" value="1"/>
    </label>
    <p class="pageNumField">von</p>
    <label>
        <input class="textField" id="lastPage" onkeypress="return event.charCode >= 48 && event.charCode <= 57" readonly
               style="left: 53%;" type="text"
               value="999"/>
    </label>
    <button class="button" id="incPage" style="right: 40%;">+</button>
    <div class="progress" id="loadingBar" style="width: 97%; margin-left: 1%; margin-right: 1%; top: 58%; height: 35%;">
        <div class="progress-value" id="loading" style="height: 35%; width: 10px;"></div>
    </div>
</div>
<div class="warn" id="mes"></div>
</body>
</html>
