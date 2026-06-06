<?php
session_start();
session_unset();
session_destroy();

// Redirect back to login page (relative path from logout folder)
header("Location: ../login/loginpage.html");
exit();
?>