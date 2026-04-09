<?php
require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = getQueryParam('user_id', null);
    $categoryId = getQueryParam('category_id', '');
    $brandId = getQueryParam('brand_id', '');
    $serviceId = getQueryParam('service_id', '');
    
    // Build query string
    $queryParams = [];
    if ($categoryId) $queryParams[] = 'category_id=' . urlencode($categoryId);
    if ($brandId) $queryParams[] = 'brand_id=' . urlencode($brandId);
    if ($serviceId) $queryParams[] = 'service_id=' . urlencode($serviceId);
    
    $queryString = implode('&', $queryParams);
    $signaturePath = '/v2/products';
    
    $urlPath = '/products';
    if ($queryString) {
        $urlPath .= '?' . $queryString;
    }
    
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

