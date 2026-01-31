<?php
/**
 * PHP API Index - Testing Page
 * Ye file API testing ke liye hai
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>G2G PHP API - Status</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        h1 { color: #333; }
        .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .endpoint { margin: 10px 0; padding: 10px; background: #f8f9fa; border-left: 3px solid #007bff; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 G2G PHP API - Status Check</h1>
        
        <?php
        // Check PHP version
        $phpVersion = phpversion();
        $phpOk = version_compare($phpVersion, '7.4.0', '>=');
        ?>
        
        <div class="status <?php echo $phpOk ? 'success' : 'error'; ?>">
            <strong>PHP Version:</strong> <?php echo $phpVersion; ?>
            <?php echo $phpOk ? '✅ OK' : '❌ Need PHP 7.4+'; ?>
        </div>
        
        <?php
        // Check required extensions
        $extensions = ['curl', 'json', 'hash'];
        $allOk = true;
        foreach ($extensions as $ext) {
            $loaded = extension_loaded($ext);
            $allOk = $allOk && $loaded;
            ?>
            <div class="status <?php echo $loaded ? 'success' : 'error'; ?>">
                <strong><?php echo strtoupper($ext); ?> Extension:</strong>
                <?php echo $loaded ? '✅ Loaded' : '❌ Not Loaded'; ?>
            </div>
            <?php
        }
        ?>
        
        <?php
        // Check if g2g-api.php exists
        $apiFile = __DIR__ . '/g2g-api.php';
        $apiExists = file_exists($apiFile);
        ?>
        
        <div class="status <?php echo $apiExists ? 'success' : 'error'; ?>">
            <strong>API Helper File:</strong>
            <?php echo $apiExists ? '✅ Found' : '❌ Not Found'; ?>
        </div>
        
        <h2>📡 Available API Endpoints:</h2>
        
        <div class="endpoint">
            <strong>GET</strong> <code>/php-api/api/get_services.php?user_id=7788063</code>
            <br><small>Get all services</small>
        </div>
        
        <div class="endpoint">
            <strong>GET</strong> <code>/php-api/api/get_products.php?user_id=7788063</code>
            <br><small>Get all products</small>
        </div>
        
        <div class="endpoint">
            <strong>GET</strong> <code>/php-api/api/get_order.php?orderId=ORDER_ID&user_id=7788063</code>
            <br><small>Get order details</small>
        </div>
        
        <div class="endpoint">
            <strong>GET</strong> <code>/php-api/api/get_brands.php?serviceId=SERVICE_ID&user_id=7788063</code>
            <br><small>Get brands for a service</small>
        </div>
        
        <div class="endpoint">
            <strong>POST</strong> <code>/php-api/api/create_offer.php</code>
            <br><small>Create a new offer</small>
        </div>
        
        <div class="endpoint">
            <strong>POST</strong> <code>/php-api/api/deliver.php</code>
            <br><small>Deliver an order</small>
        </div>
        
        <?php if ($allOk && $apiExists): ?>
            <div class="status success">
                <strong>✅ All Systems Ready!</strong><br>
                PHP API is properly configured and ready to use.
            </div>
        <?php else: ?>
            <div class="status error">
                <strong>❌ Configuration Issues</strong><br>
                Please check the errors above and fix them.
            </div>
        <?php endif; ?>
        
        <h2>📖 Documentation</h2>
        <p>Complete deployment guide: <code>HOSTINGER_PHP_DEPLOYMENT.md</code></p>
        <p>Quick reference: <code>QUICK_DEPLOY_PHP.txt</code></p>
    </div>
</body>
</html>

