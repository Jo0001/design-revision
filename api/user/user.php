<?php
require "../../libs/auth.php";
require "../../libs/api-util.php";

handleOutput(array("user" => getUser("all")));