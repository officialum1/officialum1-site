<?php
/**
 * Get Tracked Offers
 * Returns all offers tracked via webhook
 */

require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $offersFile = __DIR__ . '/../../offers_tracked.json';
    
    // Load tracked offers
    $offers = [];
    if (file_exists($offersFile)) {
        $existingData = file_get_contents($offersFile);
        $offers = json_decode($existingData, true) ?: [];
    }
    
    // Convert to array format for frontend
    $offersList = [];
    foreach ($offers as $offerId => $offerData) {
        $offersList[] = [
            'offer_id' => $offerId,
            'product_name' => $offerData['data']['product_name'] ?? 'N/A',
            'offer_status' => $offerData['data']['status'] ?? 'active',
            'unit_price' => $offerData['data']['unit_price'] ?? 0,
            'currency' => $offerData['data']['currency'] ?? 'USD',
            'api_qty' => $offerData['data']['api_qty'] ?? 0,
            'min_qty' => $offerData['data']['min_qty'] ?? 1,
            'last_updated' => $offerData['last_updated'] ?? '',
            'event_type' => $offerData['event_type'] ?? 'unknown'
        ];
    }
    
    sendJsonResponse([
        'success' => true,
        'data' => [
            'offers' => $offersList,
            'total' => count($offersList)
        ],
        'note' => 'These offers are tracked via webhook. Make sure webhook is configured in G2G Dashboard.'
    ]);
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

