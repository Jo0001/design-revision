<?php
require "../libs/auth.php";
if(!isLoggedIn()){
    header("Location: ../login/?returnto=".getCurrentURL());
    die;
}
print parseHTML("../app/CommentDesign.html",null,null,null,null);