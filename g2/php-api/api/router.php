<?php
/**
 * PHP API Router
 * Ye file sab API requests handle karega
 */

require_once '../g2g-api.php';

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if needed
$path = str_replace('/php-api', '', $path);
$path = trim($path, '/');

// Route to appropriate handler
$routes = [
    'api/get_services' => 'get_services.php',
    'api/get_products' => 'get_products.php',
    'api/create_offer' => 'create_offer.php',
    'api/deliver' => 'deliver.php',
    'api/webhook/order' => 'webhook_order.php',
    'api/webhook/offer' => 'webhook_offer.php',
];

// Handle dynamic routes
if (preg_match('#^api/get_order/([^/]+)#', $path, $matches)) {
    $_GET['orderId'] = $matches[1];
    require 'get_order.php';
    exit;
}

if (preg_match('#^api/get_brands/([^/]+)#', $path, $matches)) {
    $_GET['serviceId'] = $matches[1];
    require 'get_brands.php';
    exit;
}

if (preg_match('#^api/get_product_attributes/([^/]+)#', $path, $matches)) {
    $_GET['productId'] = $matches[1];
    require 'get_product_attributes.php';
    exit;
}

if (preg_match('#^api/get_deliveries/([^/]+)#', $path, $matches)) {
    $_GET['orderId'] = $matches[1];
    require 'get_deliveries.php';
    exit;
}

if (preg_match('#^api/get_market_prices/([^/]+)#', $path, $matches)) {
    $_GET['productId'] = $matches[1];
    require 'get_market_prices.php';
    exit;
}

// Handle static routes
if (isset($routes[$path])) {
    require $routes[$path];
    exit;
}

// 404 Not Found
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
exit;

?>

