<?php
/**
 * G2G Order Webhook Handler
 * Receives order updates from G2G API
 * Automatically tracks orders in JSON file
 */

require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Get raw request body for signature verification
    $rawBody = file_get_contents('php://input');
    
    // Get webhook signature from headers
    // G2G sends signature in 'g2g-signature' header
    $signature = $_SERVER['HTTP_G2G_SIGNATURE'] ?? $_SERVER['HTTP_X_G2G_SIGNATURE'] ?? '';
    
    // Order webhook secret token (from G2G Dashboard)
    $webhookSecret = getenv('ORDER_WEBHOOK_SECRET') ?: 't0kQkpU6lKhz9P';
    
    // Verify webhook signature if secret is configured
    if ($webhookSecret && $signature) {
        // G2G uses HMAC-SHA256 hexdigest
        $expectedSignature = hash_hmac('sha256', $rawBody, $webhookSecret);
        
        // Use timing-safe comparison
        if (!hash_equals($expectedSignature, $signature)) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Invalid webhook signature'
            ]);
            exit;
        }
    }
    
    // Parse JSON payload
    $data = json_decode($rawBody, true);
    
    if (!$data) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON payload'
        ]);
        exit;
    }
    
    // Process order webhook event
    $eventType = $data['event_type'] ?? 'unknown';
    $orderData = $data['payload'] ?? [];
    $orderId = $orderData['order_id'] ?? null;
    
    // Auto-track orders - Save to JSON file
    if ($orderId) {
        $ordersFile = __DIR__ . '/../../orders_tracked.json';
        
        // Load existing orders
        $orders = [];
        if (file_exists($ordersFile)) {
            $existingData = file_get_contents($ordersFile);
            $orders = json_decode($existingData, true) ?: [];
        }
        
        // Update or add order based on event type
        if ($eventType === 'order.created' || $eventType === 'order.updated') {
            // Add or update order
            $orders[$orderId] = [
                'order_id' => $orderId,
                'event_type' => $eventType,
                'data' => $orderData,
                'last_updated' => date('Y-m-d H:i:s'),
                'timestamp' => time()
            ];
        } elseif ($eventType === 'order.cancelled' || $eventType === 'order.completed') {
            // Update order status
            if (isset($orders[$orderId])) {
                $orders[$orderId]['event_type'] = $eventType;
                $orders[$orderId]['data'] = array_merge($orders[$orderId]['data'] ?? [], $orderData);
                $orders[$orderId]['last_updated'] = date('Y-m-d H:i:s');
                $orders[$orderId]['timestamp'] = time();
            } else {
                // Add new order
                $orders[$orderId] = [
                    'order_id' => $orderId,
                    'event_type' => $eventType,
                    'data' => $orderData,
                    'last_updated' => date('Y-m-d H:i:s'),
                    'timestamp' => time()
                ];
            }
        } else {
            // Update existing order
            if (isset($orders[$orderId])) {
                $orders[$orderId]['event_type'] = $eventType;
                $orders[$orderId]['data'] = array_merge($orders[$orderId]['data'] ?? [], $orderData);
                $orders[$orderId]['last_updated'] = date('Y-m-d H:i:s');
                $orders[$orderId]['timestamp'] = time();
            } else {
                // Add new order
                $orders[$orderId] = [
                    'order_id' => $orderId,
                    'event_type' => $eventType,
                    'data' => $orderData,
                    'last_updated' => date('Y-m-d H:i:s'),
                    'timestamp' => time()
                ];
            }
        }
        
        // Save orders to file
        file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT));
    }
    
    // Log webhook data
    error_log('Order Webhook Received: ' . json_encode($data));
    
    // Return success response
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Webhook received and tracked successfully',
        'event_type' => $eventType,
        'order_id' => $orderId ?? 'N/A',
        'tracked' => $orderId ? true : false
    ]);
    
} else {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
