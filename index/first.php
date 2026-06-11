<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

$current_year = date('Y');

echo json_encode([
    'success' => true,
    'copyright_text' => 'Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.',
    'current_year' => $current_year
]);
?>