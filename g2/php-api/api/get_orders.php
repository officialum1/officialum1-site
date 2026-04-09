<?php
require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // G2G API me orders list endpoint available nahi hai
    sendJsonResponse([
        'success' => false,
        'error' => 'G2G API me orders list endpoint available nahi hai. Individual order get karne ke liye order_id chahiye. Orders list ke liye G2G Dashboard use karein ya webhook setup karein.',
        'note' => 'Individual order get karne ke liye: GET /api/get_order/{order_id}'
    ], 400);
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

