<?php
/**
 * Get Tracked Orders
 * Returns all orders tracked via webhook
 */

require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $ordersFile = __DIR__ . '/../../orders_tracked.json';
    
    // Load tracked orders
    $orders = [];
    if (file_exists($ordersFile)) {
        $existingData = file_get_contents($ordersFile);
        $orders = json_decode($existingData, true) ?: [];
    }
    
    // Convert to array format for frontend
    $ordersList = [];
    foreach ($orders as $orderId => $orderData) {
        $orderInfo = $orderData['data'] ?? [];
        $ordersList[] = [
            'order_id' => $orderId,
            'order_number' => $orderInfo['order_number'] ?? $orderId,
            'order_status' => $orderInfo['order_status'] ?? $orderData['event_type'] ?? 'unknown',
            'product_name' => $orderInfo['product_name'] ?? 'N/A',
            'quantity' => $orderInfo['quantity'] ?? 0,
            'unit_price' => $orderInfo['unit_price'] ?? 0,
            'total_price' => $orderInfo['total_price'] ?? 0,
            'currency' => $orderInfo['currency'] ?? 'USD',
            'buyer_name' => $orderInfo['buyer_name'] ?? 'N/A',
            'last_updated' => $orderData['last_updated'] ?? '',
            'event_type' => $orderData['event_type'] ?? 'unknown'
        ];
    }
    
    sendJsonResponse([
        'success' => true,
        'data' => [
            'orders' => $ordersList,
            'total' => count($ordersList)
        ],
        'note' => 'These orders are tracked via webhook. Make sure webhook is configured in G2G Dashboard.'
    ]);
} else {
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}
?>

