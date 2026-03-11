# Custom Domain Setup for freelanceskills.net

Guide to configure **freelanceskills.net** as a custom domain on Replit with automatic SSL.

---

## Prerequisites

- Active Replit account with hosting plan (Deployments enabled)
- Domain name already registered (or register freelanceskills.net)
- Domain registrar account access (GoDaddy, Namecheap, Domain.com, etc.)
- Admin access to the Replit project

---

## Part 1: Prepare Your Replit Application

### Step 1: Deploy Your Application

1. In your Replit project, navigate to **Deployments** tab (left sidebar)
2. Click **"Deploy new revision"**
3. Select your build configuration:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Root directory: `.` (current directory)
4. Click **Deploy** and wait for the deployment to complete
5. Copy the **Replit deployment URL** (e.g., `https://myproject.replit.dev`)

### Step 2: Enable Custom Domain Feature

1. Go to **Deployments** → **Settings**
2. Scroll to **Custom Domain** section
3. Click **"Add custom domain"**
4. Paste your domain: `freelanceskills.net`
5. Click **Verify & Continue**

Replit will provide you with:
- A **CNAME target** (e.g., `cname.replit.dev`)
- DNS configuration instructions

Keep this page open; you'll need these values.

---

## Part 2: Configure DNS at Your Domain Registrar

Choose your registrar below and follow the steps:

### **GoDaddy (Most Common)**

1. Log into your GoDaddy account
2. Navigate to **Products** → **Domains**
3. Find **freelanceskills.net** in your domain list
4. Click the domain name to open its settings
5. Go to **DNS** tab
6. Under **Records**, find or create a **CNAME record**:
   - **Name:** `www` (or leave blank for root domain)
   - **Type:** `CNAME`
   - **Value:** `cname.replit.dev` (Replit's CNAME target)
7. For root domain (`freelanceskills.net`), use an **A record**:
   - **Name:** `@` (or leave blank)
   - **Type:** `A`
   - **Value:** `34.212.31.203` (Replit's IP — check Replit's custom domain page for current IP)
8. Click **Save**

### **Namecheap**

1. Log into Namecheap
2. Go to **Domain List** → Select **freelanceskills.net**
3. Click **Manage** on the domain
4. Go to **Advanced DNS** tab
5. Add a new **CNAME Record**:
   - **Host:** `www`
   - **Value:** `cname.replit.dev`
   - **TTL:** 3600
6. For root domain, edit the **A record**:
   - **Host:** `@`
   - **Value:** `34.212.31.203` (Replit's IP)
7. Click **Save**

### **Cloudflare**

1. Log into Cloudflare
2. Select your domain (**freelanceskills.net**)
3. Go to **DNS** → **Records**
4. Add a **CNAME record**:
   - **Name:** `www`
   - **Type:** `CNAME`
   - **Target:** `cname.replit.dev`
   - **Proxy status:** DNS only (gray cloud)
5. For root domain:
   - **Name:** `@`
   - **Type:** `A`
   - **IPv4:** `34.212.31.203`
   - **Proxy status:** DNS only
6. Click **Save**

### **Other Registrars (Bluehost, 1&1, etc.)**

General steps:
1. Log into your registrar's control panel
2. Find **DNS Settings** or **Domain Management**
3. Locate **DNS Records** section
4. Add/Edit CNAME record:
   - **Host/Subdomain:** `www`
   - **Type:** `CNAME`
   - **Target/Value:** `cname.replit.dev`
5. Add/Edit A record for root domain:
   - **Host/Subdomain:** `@` or blank
   - **Type:** `A`
   - **Value:** `34.212.31.203`
6. Save changes
7. Wait 15-30 minutes for DNS propagation

---

## Part 3: Complete Custom Domain Configuration in Replit

1. Return to Replit **Deployments** → **Custom Domain**
2. Click **Verify DNS** to confirm your records are correct
3. Once verified, Replit will automatically:
   - Issue an **SSL certificate** (via Let's Encrypt)
   - Redirect all HTTP traffic to HTTPS
   - Configure your domain as the primary URL

---

## Part 4: Verify the Setup

### Test Your Domain

1. Open a new browser tab
2. Navigate to `https://freelanceskills.net`
3. Verify:
   - ✅ Site loads without errors
   - ✅ URL shows `freelanceskills.net` (not Replit's preview)
   - ✅ SSL certificate is valid (green lock icon in browser)
   - ✅ All assets load correctly (images, CSS, JS)

### DNS Propagation Check

Use an online DNS checker to verify propagation:
1. Go to https://mxtoolbox.com/mxlookup.aspx
2. Enter `freelanceskills.net`
3. Verify CNAME and A records point to correct targets

### SSL Certificate Status

In Replit:
1. Go to **Deployments** → **Custom Domain**
2. Verify SSL status shows **Active/Configured**
3. Certificate should auto-renew 30 days before expiry

---

## Part 5: Configure Subdomains (Optional)

If you want subdomains like `api.freelanceskills.net` or `admin.freelanceskills.net`:

### For Backend API Subdomain

1. In your registrar's DNS settings, add a CNAME record:
   - **Host:** `api`
   - **Type:** `CNAME`
   - **Value:** `api.replit.dev` (or your API host)

2. For SSL, create a wildcard certificate or use Cloudflare's free SSL

### Example Subdomain Setup

| Subdomain | Type | Value | Purpose |
|-----------|------|-------|---------|
| `www` | CNAME | `cname.replit.dev` | Main app |
| `api` | CNAME | `api.replit.dev` | Backend API (if separate) |
| `admin` | CNAME | `cname.replit.dev` | Admin dashboard (same as main) |
| `blog` | CNAME | `blog.freelanceskills.net` | External blog host |

---

## Troubleshooting

### Problem: Domain still shows "Not Configured"

**Solution:**
- DNS changes take 15-30 minutes to propagate
- Clear your browser cache (Ctrl+Shift+Del)
- Try a different browser or incognito mode
- Use `nslookup` or `dig` to verify DNS:
  ```bash
  nslookup freelanceskills.net
  dig freelanceskills.net CNAME
  ```

### Problem: SSL Certificate Not Issued

**Solution:**
- Ensure DNS records are correctly configured
- Wait 24-48 hours for Let's Encrypt verification
- Check Replit's Deployments logs for certificate errors
- Contact Replit support if issue persists

### Problem: 404 or "Cannot reach server"

**Solution:**
- Verify Replit deployment is active (green status in Deployments)
- Check Replit logs for server errors
- Ensure no DNS CNAME conflicts (only one CNAME per subdomain)
- Test with direct Replit URL to isolate issue

### Problem: Mixed Content Warnings

**Solution:**
- Ensure all external resources (images, API calls) use `https://`
- Update `client/index.html` to use absolute HTTPS URLs
- Check for hardcoded `http://` in your code and fix to `https://`

### Problem: Slow DNS Propagation

**Solution:**
- Use Cloudflare free tier (faster propagation, better caching)
- Flush DNS cache:
  ```bash
  # macOS
  sudo dscacheutil -flushcache
  
  # Windows (Command Prompt as Admin)
  ipconfig /flushdns
  
  # Linux
  sudo systemctl restart systemd-resolved
  ```

---

## Security Best Practices

### 1. Enable HTTPS Everywhere

Replit automatically redirects HTTP → HTTPS. Verify in your code:

```javascript
// Redirect non-HTTPS in your server code
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

### 2. Set Security Headers

Add to your `server/index.ts`:

```typescript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
```

### 3. Monitor Certificate Expiry

- Replit auto-renews SSL certificates
- Set a calendar reminder 6 months out to verify
- Check certificate status monthly in Deployments

### 4. DNS Security

- Use Cloudflare for DDoS protection (free tier)
- Enable 2FA on your domain registrar account
- Consider DNSSEC if your registrar supports it

---

## Update Environment Variables for Production

1. Go to Replit **Secrets** (pencil icon, left sidebar)
2. Ensure these variables are set:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgres_url
   STRIPE_SECRET_KEY=your_stripe_key
   API_URL=https://freelanceskills.net
   ```
3. Restart your deployment

---

## Monitoring & Maintenance

### Uptime Monitoring

Use a free service like UptimeRobot:
1. Go to https://uptimerobot.com
2. Create a monitor for `https://freelanceskills.net`
3. Set check interval: every 5 minutes
4. Get alerts if site goes down

### Log Monitoring

1. In Replit, go to **Deployments** → **Logs**
2. Monitor for errors, 500s, and performance issues
3. Set up alerts for critical errors

### SSL Certificate Monitoring

1. Use SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=freelanceskills.net
2. Verify:
   - Grade: A or A+
   - Certificate chain valid
   - No weak ciphers

---

## Summary Checklist

- ✅ Application deployed on Replit
- ✅ Custom domain enabled in Replit
- ✅ DNS records configured at registrar (CNAME + A record)
- ✅ DNS propagation verified (mxtoolbox.com)
- ✅ SSL certificate issued and active
- ✅ Domain accessible at `https://freelanceskills.net`
- ✅ HTTPS enforcement enabled
- ✅ Environment variables set for production
- ✅ Uptime monitoring configured
- ✅ Security headers in place

---

## Support

- **Replit Docs:** https://docs.replit.com/hosting/custom-domains
- **Let's Encrypt Docs:** https://letsencrypt.org/docs/
- **DNS Propagation Checker:** https://mxtoolbox.com/mxlookup.aspx
- **SSL Test:** https://www.ssllabs.com/ssltest/

For issues, contact:
- Replit Support: support@replit.com
- Registrar Support: See your domain registrar's contact page
- FreelanceSkills.net Team: hello@freelanceskills.net

---

**Last Updated:** 2024
**Status:** Production Ready
