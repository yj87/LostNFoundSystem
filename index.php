<?php
// No database connection needed for this simple data
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Get current year
$current_year = date('Y');

// Taglines array (can be randomized)
$taglines = [
    "Helping you reunite with your lost items",
    "Lost something? We can help you find it",
    "Your trusted lost and found platform",
    "Reuniting people with their belongings",
    "Browse and search found items here"
];

// Random tagline
$random_tagline = $taglines[array_rand($taglines)];

// Features data - ONLY View and Search Found Items
$features = [
    [
        'icon' => 'fas fa-eye',
        'title' => 'View Found Items',
        'description' => 'Browse all found items reported',
        'link' => '../user_page/user/browse_found_items.php'
    ],
    [
        'icon' => 'fas fa-search',
        'title' => 'Search Found Items',
        'description' => 'Search for your lost belongings',
        'link' => '../user_page/user/search_found_items.php'
    ]
];

// Return JSON response
echo json_encode([
    'success' => true,
    'tagline' => $random_tagline,
    'features' => $features,
    'copyright_text' => 'Lost & Found System - Universiti Teknologi Malaysia. All rights reserved.',
    'current_year' => $current_year
]);

// No database connection needed, so no mysqli_close()
?>