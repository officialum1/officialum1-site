<?php
/**
 * G2G Offer Webhook Handler
 * Receives offer updates from G2G API
 * Automatically tracks offers in JSON file
 */

require_once '../g2g-api.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Get raw request body for signature verification
    $rawBody = file_get_contents('php://input');
    
    // Get webhook signature from headers
    // G2G sends signature in 'g2g-signature' header
    $signature = $_SERVER['HTTP_G2G_SIGNATURE'] ?? $_SERVER['HTTP_X_G2G_SIGNATURE'] ?? '';
    
    // Offer webhook secret token (from G2G Dashboard)
    $webhookSecret = getenv('OFFER_WEBHOOK_SECRET') ?: 's4CheGaCDqiso';
    
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
    
    // Process offer webhook event
    $eventType = $data['event_type'] ?? 'unknown';
    $offerData = $data['payload'] ?? [];
    $offerId = $offerData['offer_id'] ?? null;
    
    // Auto-track offers - Save to JSON file
    if ($offerId) {
        $offersFile = __DIR__ . '/../../offers_tracked.json';
        
        // Load existing offers
        $offers = [];
        if (file_exists($offersFile)) {
            $existingData = file_get_contents($offersFile);
            $offers = json_decode($existingData, true) ?: [];
        }
        
        // Update or add offer based on event type
        if ($eventType === 'offer.created' || $eventType === 'offer.updated') {
            // Add or update offer
            $offers[$offerId] = [
                'offer_id' => $offerId,
                'event_type' => $eventType,
                'data' => $offerData,
                'last_updated' => date('Y-m-d H:i:s'),
                'timestamp' => time()
            ];
        } elseif ($eventType === 'offer.deleted') {
            // Remove offer
            unset($offers[$offerId]);
        } else {
            // Update existing offer
            if (isset($offers[$offerId])) {
                $offers[$offerId]['event_type'] = $eventType;
                $offers[$offerId]['data'] = array_merge($offers[$offerId]['data'] ?? [], $offerData);
                $offers[$offerId]['last_updated'] = date('Y-m-d H:i:s');
                $offers[$offerId]['timestamp'] = time();
            } else {
                // Add new offer
                $offers[$offerId] = [
                    'offer_id' => $offerId,
                    'event_type' => $eventType,
                    'data' => $offerData,
                    'last_updated' => date('Y-m-d H:i:s'),
                    'timestamp' => time()
                ];
            }
        }
        
        // Save offers to file
        file_put_contents($offersFile, json_encode($offers, JSON_PRETTY_PRINT));
    }
    
    // Log webhook data
    error_log('Offer Webhook Received: ' . json_encode($data));
    
    // Return success response
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Webhook received and tracked successfully',
        'event_type' => $eventType,
        'offer_id' => $offerId ?? 'N/A',
        'tracked' => $offerId ? true : false
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
