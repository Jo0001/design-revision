<?php
require "../libs/auth.php";
if(!isLoggedIn()){
    header("Location: ../login/login.html");
    die;
}
print parseHTML("../app/CustumorDashboard.html",null,null,null,null);