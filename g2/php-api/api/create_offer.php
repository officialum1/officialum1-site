<?php
require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getRequestBody();
    $userId = isset($data['user_id']) ? trim($data['user_id']) : null;
    
    if (!$userId || $userId === '') {
        sendJsonResponse([
            'success' => false,
            'error' => 'User ID is required'
        ], 400);
    }
    
    // Required fields
    $productId = $data['product_id'] ?? null;
    $offerAttributes = isset($data['offer_attributes']) && is_array($data['offer_attributes']) 
        ? $data['offer_attributes'] : [];
    $currency = $data['currency'] ?? null;
    $unitPrice = $data['unit_price'] ?? null;
    $minQty = $data['min_qty'] ?? 1;
    $apiQty = $data['api_qty'] ?? 100;
    $deliveryMethodIds = $data['delivery_method_ids'] ?? [];
    
    // Validate required fields
    if (!$productId) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Missing required parameter: product_id'
        ], 400);
    }
    
    if (!isset($data['offer_attributes'])) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Missing required parameter: offer_attributes (must be an array, can be empty)'
        ], 400);
    }
    
    if (!$currency) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Missing required parameter: currency'
        ], 400);
    }
    
    if (!$unitPrice || floatval($unitPrice) <= 0) {
        sendJsonResponse([
            'success' => false,
            'error' => 'Missing or invalid required parameter: unit_price (must be greater than 0)'
        ], 400);
    }
    
    if (!is_array($deliveryMethodIds)) {
        $deliveryMethodIds = $deliveryMethodIds ? [$deliveryMethodIds] : [];
    }
    
    // Build payload
    $payload = [
        'product_id' => $productId,
        'offer_attributes' => $offerAttributes,
        'currency' => $currency,
        'unit_price' => floatval($unitPrice),
        'min_qty' => intval($minQty),
        'api_qty' => intval($apiQty),
        'delivery_method_ids' => $deliveryMethodIds
    ];
    
    // Optional fields
    if (isset($data['description']) && trim($data['description']) !== '') {
        $payload['description'] = trim($data['description']);
    }
    
    if (isset($data['low_stock_alert_qty'])) {
        $payload['low_stock_alert_qty'] = intval($data['low_stock_alert_qty']);
    }
    
    if (isset($data['other_pricing'])) {
        $payload['other_pricing'] = $data['other_pricing'];
    }
    
    if (isset($data['wholesale_details'])) {
        $payload['wholesale_details'] = $data['wholesale_details'];
    }
    
    if (isset($data['other_wholesale_details'])) {
        $payload['other_wholesale_details'] = $data['other_wholesale_details'];
    }
    
    if (isset($data['sales_territory_settings'])) {
        $payload['sales_territory_settings'] = $data['sales_territory_settings'];
    } else {
        $payload['sales_territory_settings'] = [
            'settings_type' => 'global',
            'countries' => []
        ];
    }
    
    $signaturePath = '/v2/offers';
    $urlPath = '/offers';
    $url = $G2G_BASE_URL . $urlPath;
    
    $headers = getHeaders('POST', $signaturePath, $userId);
    $result = makeG2GRequest('POST', $url, $headers, json_encode($payload));
    
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

