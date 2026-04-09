<?php
require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get orderId from query parameter (set by router)
    $orderId = getQueryParam('orderId', null);
    
    if (!$orderId) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Order ID is required'
        ], 400);
    }
    
    $userId = getQueryParam('user_id', null);
    
    $signaturePath = '/v2/orders/' . $orderId;
    $urlPath = '/orders/' . $orderId;
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
                'status_code' => $result['status_code'],
                'response_text' => $result['raw_response']
            ]
        ], $result['status_code'] ?: 500);
    }
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

