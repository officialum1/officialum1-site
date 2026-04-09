<?php
require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getRequestBody();
    
    // Get password from request
    $password = $data['password'] ?? null;
    
    // Default password (defined in g2g-api.php)
    $adminPassword = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : (getenv('ADMIN_PASSWORD') ?: 'admin123');
    
    if (!$password || trim($password) === '') {
        sendJsonResponse([
            'success' => false,
            'error' => 'Password is required'
        ], 400);
    }
    
    // Validate password
    if (trim($password) === $adminPassword) {
        // Password correct - return success
        sendJsonResponse([
            'success' => true,
            'message' => 'Login successful'
        ]);
    } else {
        // Password incorrect
        sendJsonResponse([
            'success' => false,
            'error' => 'Invalid password'
        ], 401);
    }
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

