<?php
require "../libs/auth.php";
require  "../libs/util.php";
if(!isLoggedIn()){
    header("Location: ../login/login.html");
    die;
}
print parseHTML("../app/CommentDesign.html",null,null,null,null);