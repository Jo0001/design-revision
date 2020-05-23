<?php
/*Email Settings*/
//Host
define("emailHost","smtp.sendgrid.net");
//Username
define("emailUsername","apikey");
//Password
define("emailPassword","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");
//Port
define("emailPort",587);
//From e-mail address
define("emailFromaddress","design-revision@gmx.de");
//From Name
define("emailFromname","Design Revision");

/*Database Settings*/
//DSN
define("dbDsn","mysql:host=localhost;dbname=design_revision");
//Username
define("dbUsername","dsnRev");
//Password
define("dbPassword","4_DiDsrev2019");

/*API Settings*/
//Should we output some useful information for developers
define("apiDebug",false);