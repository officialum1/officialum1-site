<?php
require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getRequestBody();
    $orderId = $data['order_id'] ?? null;
    $deliveryId = $data['delivery_id'] ?? null;
    $deliveredQty = $data['delivered_qty'] ?? null;
    $userId = isset($data['user_id']) ? trim($data['user_id']) : null;
    $deliveryIssue = $data['delivery_issue'] ?? '';
    $referenceId = $data['reference_id'] ?? '';
    
    if (!$orderId || !$deliveryId || !$deliveredQty) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Missing required parameters'
        ], 400);
    }
    
    if (!$userId || $userId === '') {
        $userId = null; // Will use default from getHeaders
    }
    
    $signaturePath = '/v2/orders/' . $orderId . '/delivery/' . $deliveryId;
    $urlPath = '/orders/' . $orderId . '/delivery/' . $deliveryId;
    $url = $G2G_BASE_URL . $urlPath;
    
    $payload = [
        'delivered_qty' => intval($deliveredQty),
        'delivered_at' => time() * 1000 // milliseconds
    ];
    
    if ($deliveryIssue) {
        $payload['delivery_issue'] = $deliveryIssue;
    }
    
    if ($referenceId) {
        $payload['reference_id'] = $referenceId;
    } else {
        $payload['reference_id'] = $orderId . '_' . $deliveryId;
    }
    
    $headers = getHeaders('PATCH', $signaturePath, $userId);
    $result = makeG2GRequest('PATCH', $url, $headers, json_encode($payload));
    
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

