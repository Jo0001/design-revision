<?php
require "../libs/auth.php";
if(!isLoggedIn()){
    header("Location: ../login/login.html?returnto=".getCurrentURL());
    die;
}
print parseHTML("../app/ViewDesign.html",null,null,null,null);