<?php
// Authentication helper functions

// Function to verify admin credentials
function verifyCredentials($username, $password) {
    // Admin credentials
    // In a production environment, you should use a more secure method
    // such as a database with properly hashed passwords
    $adminCredentials = [
        'username' => 'admin',
        // This is a bcrypt hash of 'khalila'
        'password_hash' => '$2y$10$Nt9Xt9V.Pl0wQMZUDT/Hl.QgT8CXYlZ9LHl.9F9vdF2MrDQ/TnFPK'
    ];
    
    // Check if username matches
    if ($username === $adminCredentials['username']) {
        // Verify password
        return password_verify($password, $adminCredentials['password_hash']);
    }
    
    return false;
}

// Function to check if user is authenticated
function isAuthenticated() {
    session_start();
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}
?>
