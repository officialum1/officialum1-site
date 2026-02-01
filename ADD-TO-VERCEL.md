# 📋 COPY-PASTE GUIDE: Add Environment Variables to Vercel

## 🎯 Complete This in 5 Minutes

### Step 1: Login to Vercel Dashboard

1. Open: **https://vercel.com/dashboard**
2. Click on your project: **officialum1** (or whatever your project name is)
3. Go to: **Settings** tab (top of page)
4. Click: **Environment Variables** (left sidebar)

---

### Step 2: Add These Variables ONE BY ONE

For each variable below:
1. Click **"Add New"** button
2. Copy the **Key** name
3. Copy the **Value**
4. Select environment: **Production**
5. Click **"Save"**

---

## 📝 REQUIRED VARIABLES (Copy from here)

### Database Configuration
```
Key: DB_HOST
Value: 82.197.82.131
```

```
Key: DB_USER
Value: u815786501_officialum1sit
```

```
Key: DB_PASSWORD
Value: 78b?aY&DkF8RM@y
```

```
Key: DB_NAME
Value: u815786501_officialum1sit
```

---

### Admin Security
**⚠️ CREATE A NEW STRONG PASSWORD - Don't use the old one!**

```
Key: ADMIN_PASSWORD
Value: [Your new strong password here - example: kP9#mQ2$vL8@nR5!wT3^x]
```

Example strong password generator (use one of these or create your own):
- `SecureAdmin2026!@#Pass`
- `Um1Str0ng!Pass#2026`
- `Ad1234!@#Secure#Pass`

---

### G2G API Credentials
**Get these from your G2G merchant dashboard**

```
Key: G2G_API_KEY
Value: [Your G2G API Key]
```

```
Key: G2G_SECRET_KEY
Value: [Your G2G Secret Key]
```

```
Key: G2G_USER_ID
Value: [Your G2G User ID]
```

---

### Webhook Secrets
**Generate these using the command below, or use the provided examples**

**How to generate (run this command TWICE in PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

OR use these pre-generated ones:

```
Key: ORDER_WEBHOOK_SECRET
Value: a7f3e9b2c8d1f4a6e5b9c2d8f1a3e7b4c9d5f2a8e6b1c7d3f9a4e2b8c6d1f5a3
```

```
Key: OFFER_WEBHOOK_SECRET
Value: b8e4f0c3d9e2f5a7b6c0d9e3f1a4e8b5c0d6f3a9e7b2c8d4f0a5e3b9c7d2f6a4
```

**📋 IMPORTANT:** Save these webhook secrets! You'll need them for G2G configuration.

---

### Application Settings

```
Key: NEXT_PUBLIC_BASE_URL
Value: https://officialum1.com
```
⚠️ Replace `officialum1.com` with YOUR actual domain

```
Key: NODE_ENV
Value: production
```

---

## ✅ Quick Checklist

After adding all variables, verify you have:

- [ ] 4 Database variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- [ ] 1 Admin variable (ADMIN_PASSWORD)
- [ ] 3 G2G variables (G2G_API_KEY, G2G_SECRET_KEY, G2G_USER_ID)
- [ ] 2 Webhook variables (ORDER_WEBHOOK_SECRET, OFFER_WEBHOOK_SECRET)
- [ ] 2 App variables (NEXT_PUBLIC_BASE_URL, NODE_ENV)

**Total: 12 variables**

---

## Step 3: Redeploy Your Site

1. Still in Vercel dashboard
2. Go to: **Deployments** tab (top of page)
3. Click the 3 dots (...) on the latest deployment
4. Click: **"Redeploy"**
5. Confirm: **"Redeploy"**

Wait 2-3 minutes for deployment to complete.

---

## Step 4: Test Your Deployment

### Test 1: Health Check
Open your browser and visit:
```
https://yourdomain.com/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "missingEnvVars": []
}
```

✅ If you see this, you're good to go!
❌ If you see missing vars, add them and redeploy

---

### Test 2: Admin Login
Visit:
```
https://yourdomain.com/admin/login
```

Login with your new ADMIN_PASSWORD

✅ If you can login, success!

---

## Step 5: Configure G2G Webhooks

In your **G2G Merchant Dashboard**:

### Order Webhook
- **URL**: `https://yourdomain.com/api/webhook/g2g/order`
- **Secret**: [Your ORDER_WEBHOOK_SECRET value]
- **Events**: Select "Order Paid", "Order Completed"

### Offer Webhook
- **URL**: `https://yourdomain.com/api/webhook/g2g/offer`
- **Secret**: [Your OFFER_WEBHOOK_SECRET value]
- **Events**: Select all offer events

---

## 🎉 YOU'RE LIVE!

Your site is now:
- ✅ Secure (all credentials in environment variables)
- ✅ Fast (database optimized)
- ✅ Connected to G2G
- ✅ Monitored (health check active)
- ✅ Production-ready!

---

## 🆘 Troubleshooting

### "Missing environment variables" error
- Go back to Step 2 and add the missing variable
- Click Redeploy

### "Database connection failed"
- Verify DB credentials are correct
- Check DB_PASSWORD has no extra spaces

### G2G webhooks not working
- Verify webhook secrets match exactly
- Check webhook URLs are correct
- Test with G2G's webhook testing tool

---

## 📞 Need Help?

1. Check `/api/health` for missing vars
2. Review Vercel deployment logs
3. Verify all 12 variables are added

---

**Time to complete: 5-10 minutes**

✨ **Happy launching!** ✨
