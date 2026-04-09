<?php
/**
 * Get Offers - Using Webhook Data or G2G Dashboard
 * 
 * Note: G2G API me offers list endpoint available nahi hai.
 * Solutions:
 * 1. Webhook se offers track karein (recommended)
 * 2. G2G Dashboard se manually check karein
 * 3. Individual offer get karne ke liye offer_id chahiye
 */

require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // G2G API me offers list endpoint available nahi hai
    // Individual offer get karne ke liye: GET /offers/{offer_id}
    // Offers list ke liye webhook use karein ya G2G Dashboard se check karein
    
    sendJsonResponse([
        'success' => false,
        'error' => 'G2G API me offers list endpoint available nahi hai. Individual offer get karne ke liye offer_id chahiye. Offers list ke liye G2G Dashboard use karein ya webhook setup karein.',
        'note' => 'Individual offer get karne ke liye: GET /api/get_offer/{offer_id}',
        'solutions' => [
            '1. G2G Dashboard se apni offers check karein',
            '2. Webhook setup karein offers ke liye (recommended)',
            '3. Individual offer get karne ke liye offer_id use karein'
        ]
    ], 400);
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>
