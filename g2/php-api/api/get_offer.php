<?php
/**
 * Get Individual Offer by Offer ID
 * G2G API endpoint: GET /offers/{offer_id}
 */

require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get offerId from query parameter
    $offerId = getQueryParam('offerId', null);
    
    if (!$offerId) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Offer ID is required',
            'usage' => 'GET /api/get_offer?offerId=OFFER_ID&user_id=USER_ID'
        ], 400);
    }
    
    $userId = getQueryParam('user_id', null);
    
    // For signature: full path including /v2/ (as per Postman collection)
    // For URL: BASE_URL already has /v2, so use relative path
    $signaturePath = '/v2/offers/' . $offerId;
    $urlPath = '/offers/' . $offerId;
    $url = $G2G_BASE_URL . $urlPath;
    
    $headers = getHeaders('GET', $signaturePath, $userId);
    $result = makeG2GRequest('GET', $url, $headers);
    
    if ($result['success']) {
        sendJsonResponse([
            'success' => true,
            'data' => $result['data']
        ]);
    } else {
        sendJsonResponse([
            'success' => false,
            'error' => $result['raw_response'] ?: 'Unknown error',
            'details' => [
                'status_code' => $result['status_code']
            ]
        ], $result['status_code'] ?: 500);
    }
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

