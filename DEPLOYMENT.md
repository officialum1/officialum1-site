# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ⚠️ CRITICAL: Before You Deploy

### 1. **Set ALL Environment Variables in Vercel**

Go to your Vercel project → Settings → Environment Variables and add:

#### **Database (REQUIRED)**
```bash
DB_HOST=82.197.82.131
DB_USER=u815786501_officialum1sit
DB_PASSWORD=<your_database_password>
DB_NAME=u815786501_officialum1sit
```

#### **Admin Security (REQUIRED)**
```bash
ADMIN_PASSWORD=<generate_a_strong_password>
```
⚠️ **NEVER use the default password from before - it was exposed in code!**

#### **G2G API (REQUIRED for G2G features)**
```bash
G2G_API_KEY=<your_g2g_api_key>
G2G_SECRET_KEY=<your_g2g_secret_key>
G2G_USER_ID=<your_g2g_user_id>
ORDER_WEBHOOK_SECRET=<generate_random_64char_string>
OFFER_WEBHOOK_SECRET=<generate_random_64char_string>
```

**Generate webhook secrets** with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### **Payment Gateways (OPTIONAL)**
```bash
STRIPE_SECRET_KEY=sk_live_...
CRYPTOMUS_API_KEY=...
CRYPTOMUS_MERCHANT_ID=...
BINANCE_API_KEY=...
BINANCE_SECRET_KEY=...
```

#### **AI Tools (OPTIONAL)**
```bash
GEMINI_API_KEY=...
OPENAI_API_KEY=...
```

#### **Application Settings**
```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 2. **Security Checklist**

- [ ] Changed default ADMIN_PASSWORD
- [ ] Added all G2G webhook secrets
- [ ] Verified no hardcoded secrets remain in code
- [ ] Database credentials are in environment variables only
- [ ] `.env.local` is in `.gitignore`

---

## 3. **Database Setup**

The database will auto-initialize on first run, but verify:

1. **Test database connection** via health check:
   ```
   https://yourdomain.com/api/health
   ```

2. **Expected response**:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "missingEnvVars": []
   }
   ```

3. **If you see missing env vars**, add them in Vercel and redeploy.

---

## 4. **Performance Optimizations Applied**

✅ Database indexes added for:
- Orders (userId, email, status, date)
- Products (platform, type, stock)
- Leads (status, platform)
- Users (email, role, referral_code)

✅ Removed hardcoded fallback secrets
✅ Added health check endpoint (`/api/health`)
✅ Environment variable validation

---

##5. **Deploy to Vercel**

### Option A: Auto-Deploy (Recommended)
1. Push to GitHub:
   ```bash
   git push origin main
   ```
2. Vercel will auto-deploy

### Option B: Manual Deploy
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy:
   ```bash
   vercel --prod
   ```

---

## 6. **Post-Deployment Verification**

### Test Critical Endpoints:
```bash
# Health Check
curl https://yourdomain.com/api/health

# Admin Login (should reject without password)
curl -X POST https://yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}'

# Products API
curl https://yourdomain.com/api/products
```

### Test Admin Panel:
1. Navigate to `/admin/login`
2. Login with your ADMIN_PASSWORD
3. Verify dashboard loads
4. Check CRM, Market Intel, Client Portal

---

## 7. **G2G Webhook Setup**

In your G2G Merchant Dashboard:

1. **Order Webhook URL**:
   ```
   https://yourdomain.com/api/webhook/g2g/order
   ```
   - Secret: Use `ORDER_WEBHOOK_SECRET` from env vars

2. **Offer Webhook URL**:
   ```
   https://yourdomain.com/api/webhook/g2g/offer
   ```
   - Secret: Use `OFFER_WEBHOOK_SECRET` from env vars

---

## 8. **Monitoring & Logs**

- **Vercel Logs**: https://vercel.com/dashboard → Your Project → Logs
- **Health Check**: Monitor `/api/health` with UptimeRobot or similar
- **Error Tracking**: Consider adding Sentry in future

---

## 9. **Troubleshooting**

### Build Fails
- Check Vercel build logs
- Ensure all TypeScript errors are resolved
- Verify `npm run build` works locally

### Database Connection Error
- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are set
- Check firewall allows Vercel IPs (contact hosting provider)

### "Missing Environment Variables" Warning
- Add the missing vars in Vercel dashboard
- Redeploy

### G2G Webhooks Not Working
- Verify webhook secrets match in Vercel and G2G dashboard
- Check `/api/health` for missing env vars
- Review Vercel function logs

---

## 10. **Next Steps After Deployment**

1. **Test All Features**:
   - Place a test order
   - Check CRM lead generation
   - Test Market Intel tracking
   - Verify Client Portal access

2. **Set Up SSL** (Vercel does this automatically)

3. **Configure Domain** in Vercel settings

4. **Enable Analytics** (Vercel Analytics or Google Analytics)

5. **Set Up Backups** for your database

---

## 📞 **Support**

If you encounter issues:
1. Check `/api/health` endpoint
2. Review Vercel deployment logs
3. Verify all environment variables are set
4. Test database connection

---

## ✅ **You're Live!**

Your application is now production-ready with:
- ✅ Secure environment variable handling
- ✅ No exposed secrets
- ✅ Performance optimizations
- ✅ Health monitoring
- ✅ G2G integration
- ✅ Revenue engine features

**Happy selling! 🚀**
