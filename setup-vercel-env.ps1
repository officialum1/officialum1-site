# Vercel Environment Variables Setup Script
# Run this in PowerShell: .\setup-vercel-env.ps1

Write-Host "`n🚀 Vercel Environment Variable Setup`n" -ForegroundColor Green
Write-Host "This script will add all environment variables to your Vercel project.`n"

# Check if Vercel CLI is installed
Write-Host "Checking for Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI is installed: $vercelVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing...`n" -ForegroundColor Red
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
    npm install -g vercel
    Write-Host "`n✅ Vercel CLI installed!`n" -ForegroundColor Green
}

# Collect user inputs
Write-Host "📝 Please provide the following information:`n" -ForegroundColor Cyan

$ADMIN_PASSWORD = Read-Host "1. Enter ADMIN_PASSWORD (create a strong password)"
$G2G_API_KEY = Read-Host "2. Enter G2G_API_KEY (or press Enter to skip)"
$G2G_SECRET_KEY = Read-Host "3. Enter G2G_SECRET_KEY (or press Enter to skip)"
$G2G_USER_ID = Read-Host "4. Enter G2G_USER_ID (or press Enter to skip)"
$DOMAIN = Read-Host "5. Enter your domain (e.g., officialum1.com)"

# Generate webhook secrets
Write-Host "`n🔐 Generating webhook secrets...`n" -ForegroundColor Yellow
$ORDER_WEBHOOK_SECRET = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
$OFFER_WEBHOOK_SECRET = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })

Write-Host "✅ Secrets generated!`n" -ForegroundColor Green

# Environment variables
$envVars = @{
    "DB_HOST" = "82.197.82.131"
    "DB_USER" = "u815786501_officialum1sit"
    "DB_PASSWORD" = "&.8&@:@c%QcVrFi"
    "DB_NAME" = "u815786501_officialum1sit"
    "ADMIN_PASSWORD" = $ADMIN_PASSWORD
    "ORDER_WEBHOOK_SECRET" = $ORDER_WEBHOOK_SECRET
    "OFFER_WEBHOOK_SECRET" = $OFFER_WEBHOOK_SECRET
    "NEXT_PUBLIC_BASE_URL" = "https://$DOMAIN"
    "NODE_ENV" = "production"
}

# Add G2G if provided
if ($G2G_API_KEY) { $envVars["G2G_API_KEY"] = $G2G_API_KEY }
if ($G2G_SECRET_KEY) { $envVars["G2G_SECRET_KEY"] = $G2G_SECRET_KEY }
if ($G2G_USER_ID) { $envVars["G2G_USER_ID"] = $G2G_USER_ID }

Write-Host "📤 Adding $($envVars.Count) environment variables to Vercel...`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Adding: $key" -ForegroundColor Yellow
    
    try {
        $output = echo $value | vercel env add $key production 2>&1
        Write-Host "✅ $key added successfully" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "❌ Failed to add $key - Add manually in Vercel dashboard" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "`n✅ Successfully added: $successCount variables" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "⚠️  Failed to add: $failCount variables - Add these manually" -ForegroundColor Yellow
}

Write-Host "`n📊 Environment Variables Added:" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host "Database: ✅ (4 variables)"
Write-Host "Admin: ✅ ADMIN_PASSWORD"
if ($G2G_API_KEY) { Write-Host "G2G: ✅ (3 variables)" }
Write-Host "Webhooks: ✅ (2 variables)"
Write-Host "App: ✅ NEXT_PUBLIC_BASE_URL, NODE_ENV"
Write-Host "==========================================`n"

Write-Host "🔑 IMPORTANT - Save these webhook secrets:`n" -ForegroundColor Yellow
Write-Host "ORDER_WEBHOOK_SECRET = $ORDER_WEBHOOK_SECRET" -ForegroundColor White
Write-Host "OFFER_WEBHOOK_SECRET = $OFFER_WEBHOOK_SECRET`n" -ForegroundColor White

Write-Host "📋 Configure these in your G2G merchant dashboard!`n" -ForegroundColor Cyan

Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "1. Run: vercel --prod (to redeploy)"
Write-Host "2. Wait 2-3 minutes for deployment"
Write-Host "3. Test: https://$DOMAIN/api/health"
Write-Host "`n✨ Done! Your site will be live in ~3 minutes!`n" -ForegroundColor Green

# Save secrets to file
$secretsFile = "WEBHOOK_SECRETS.txt"
@"
🔐 Generated Webhook Secrets
Generated on: $(Get-Date)

ORDER_WEBHOOK_SECRET = $ORDER_WEBHOOK_SECRET
OFFER_WEBHOOK_SECRET = $OFFER_WEBHOOK_SECRET

📋 Add these to your G2G merchant dashboard webhook configuration:
- Order Webhook URL: https://$DOMAIN/api/webhook/g2g/order
- Offer Webhook URL: https://$DOMAIN/api/webhook/g2g/offer
"@ | Out-File -FilePath $secretsFile -Encoding UTF8

Write-Host "📄 Secrets saved to: $secretsFile`n" -ForegroundColor Cyan
