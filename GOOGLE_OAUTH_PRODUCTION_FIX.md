# Google OAuth Production Redirect Fix

## 🚨 **CRITICAL ISSUE**

**Problem:** Production OAuth redirects to `http://localhost:3000/?code=...` instead of `https://reliable-drapes.vercel.app/?code=...`

**Root Cause:** Google Cloud Console has **BOTH** localhost and production URLs in authorized redirect URIs, and Google is choosing localhost even in production.

---

## ✅ **IMMEDIATE FIX - Google Cloud Console**

### **Step 1: Access Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or the project with Client ID: `906305225514-p8n5jd8lcmqc3e0b6eiuat9dj9e7aahf`)
3. Navigate to **APIs & Services** → **Credentials**

### **Step 2: Edit OAuth 2.0 Client ID**

1. Find your OAuth 2.0 Client ID in the list
2. Click on the **pencil icon** (Edit) to open settings
3. Scroll to **Authorized redirect URIs**

### **Step 3: Check Current Redirect URIs**

**Current Configuration (WRONG):**
```
✅ http://localhost:3000/auth/callback
✅ https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback
```

**Problem:** Missing production Vercel URL!

---

### **Step 4: Add Production Redirect URI**

**Click "+ ADD URI"** and add:

```
https://reliable-drapes.vercel.app/auth/callback
```

**IMPORTANT:** Make sure you add `/auth/callback` at the end, NOT just the domain!

---

### **Step 5: Final Configuration (CORRECT)**

**Your Authorized redirect URIs should be:**

```
✅ http://localhost:3000/auth/callback                          (for development)
✅ https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback   (Supabase callback)
✅ https://reliable-drapes.vercel.app/auth/callback            (production) ← ADD THIS
```

**Optional:** If you have custom domains or preview deployments:
```
✅ https://your-custom-domain.com/auth/callback                 (if using custom domain)
✅ https://reliable-drapes-*.vercel.app/auth/callback           (preview deployments - use wildcard)
```

---

### **Step 6: Save Changes**

1. Click **SAVE** at the bottom
2. Wait 1-2 minutes for Google to propagate changes
3. Close and reopen browser tab (clear cache)

---

## 🧪 **Test the Fix**

### **Production Test:**

1. **Go to:** `https://reliable-drapes.vercel.app/login`
2. **Click:** "Continue with Google"
3. **Expected:** 
   - Google OAuth popup appears
   - You authenticate
   - Redirects to: `https://reliable-drapes.vercel.app/` (NOT localhost!)
   - User is logged in
   - Clean URL (no `?code=` parameter)

### **Development Test (Should Still Work):**

1. **Go to:** `http://localhost:3000/login`
2. **Click:** "Continue with Google"
3. **Expected:**
   - Google OAuth popup appears
   - You authenticate
   - Redirects to: `http://localhost:3000/` (localhost is correct here)
   - User is logged in

---

## 🔍 **Why This Happened**

### **The Issue:**

When you configure OAuth in Google Cloud Console, you specify **authorized redirect URIs**. Google will **only** redirect to URLs in this list.

**Your current setup:**
- ✅ `http://localhost:3000/auth/callback` - Added for development
- ✅ `https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback` - Supabase callback
- ❌ Missing: `https://reliable-drapes.vercel.app/auth/callback` - Production!

**What happens:**
1. User clicks Google OAuth on production (`https://reliable-drapes.vercel.app`)
2. Your code sends: `redirectTo: "https://reliable-drapes.vercel.app/auth/callback"`
3. Google receives the request
4. Google checks: "Is this URL in my authorized list?"
5. Google finds: ❌ NOT in list
6. Google looks for alternatives in the list
7. Google finds: ✅ `http://localhost:3000/auth/callback`
8. Google redirects to localhost (wrong!) 🚫

**After adding production URL:**
1. User clicks Google OAuth on production
2. Your code sends: `redirectTo: "https://reliable-drapes.vercel.app/auth/callback"`
3. Google checks: "Is this URL in my authorized list?"
4. Google finds: ✅ YES! In list
5. Google redirects to production URL ✅

---

## 📋 **Complete Redirect URI Checklist**

Use this checklist to verify your Google Cloud Console configuration:

### **Required (Must Have):**
- [ ] `http://localhost:3000/auth/callback` - Development testing
- [ ] `https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback` - Supabase
- [ ] `https://reliable-drapes.vercel.app/auth/callback` - Production

### **Optional (Nice to Have):**
- [ ] `https://www.reliable-drapes.vercel.app/auth/callback` - www subdomain (if used)
- [ ] `https://reliable-drapes-*.vercel.app/auth/callback` - Preview deployments
- [ ] `https://your-custom-domain.com/auth/callback` - Custom domain (if configured)

### **Testing Ports (Optional - Development Only):**
- [ ] `http://localhost:3001/auth/callback` - Alternative port
- [ ] `http://127.0.0.1:3000/auth/callback` - IP-based localhost

---

## 🚨 **Common Mistakes to Avoid**

### **❌ WRONG:**
```
http://localhost:3000                           ← Missing /auth/callback
https://reliable-drapes.vercel.app              ← Missing /auth/callback
http://localhost:3000/                          ← Trailing slash (might work, but inconsistent)
https://reliable-drapes.vercel.app/auth         ← Missing /callback
```

### **✅ CORRECT:**
```
http://localhost:3000/auth/callback             ← Exact path
https://reliable-drapes.vercel.app/auth/callback ← Exact path
```

**Key Rules:**
1. ✅ Must include FULL path: `/auth/callback`
2. ✅ Must match EXACTLY what your app sends
3. ✅ Must use correct protocol: `http://` for localhost, `https://` for production
4. ✅ No trailing slashes

---

## 🔧 **Troubleshooting**

### **Issue 1: Still redirecting to localhost after adding production URL**

**Possible causes:**
1. **Google hasn't propagated changes yet**
   - Wait 2-5 minutes
   - Clear browser cache
   - Try incognito/private window

2. **Typo in production URL**
   - Double-check: `https://reliable-drapes.vercel.app/auth/callback`
   - No trailing slash
   - Correct domain

3. **Browser cached old OAuth flow**
   - Clear cookies and cache
   - Try different browser
   - Use incognito mode

**Fix:**
- Wait a few minutes
- Clear cache: `Ctrl+Shift+Delete` (Chrome) or `Cmd+Shift+Delete` (Mac)
- Test in incognito window

---

### **Issue 2: "Redirect URI mismatch" error**

**Error message:**
```
Error: redirect_uri_mismatch
The redirect URI in the request, https://reliable-drapes.vercel.app/auth/callback,
does not match the ones authorized for the OAuth client.
```

**Cause:** Production URL not added to Google Cloud Console

**Fix:**
1. Go to Google Cloud Console
2. Add EXACT URL: `https://reliable-drapes.vercel.app/auth/callback`
3. Click Save
4. Wait 2 minutes
5. Try again

---

### **Issue 3: Works in dev but not production**

**Symptoms:**
- ✅ `http://localhost:3000` works fine
- ❌ `https://reliable-drapes.vercel.app` redirects to localhost

**Cause:** Production URL missing from Google Cloud Console

**Fix:** Follow steps above to add production URL

---

### **Issue 4: OAuth works but still shows `?code=` in URL**

**This is a DIFFERENT issue** - see `OAUTH_FIX_APPLIED.md` for the duplicate code exchange fix.

**Quick check:**
1. Does URL redirect to correct domain? (production vs localhost)
2. Does `?code=` get cleaned up after 1-2 seconds?
3. Is user logged in after code cleanup?

If code stays in URL forever, that's the AuthProvider issue (already fixed in previous commit).

---

## 📊 **Before vs After**

### **Before Fix:**

```
User action: Click Google OAuth on production
↓
Google OAuth: Authenticate
↓
Google redirect: http://localhost:3000/?code=xyz  ❌ WRONG!
↓
Result: User sees error (localhost not accessible from production)
```

### **After Fix:**

```
User action: Click Google OAuth on production
↓
Google OAuth: Authenticate
↓
Google redirect: https://reliable-drapes.vercel.app/auth/callback?code=xyz  ✅ CORRECT!
↓
Callback route: Exchange code for session
↓
Redirect: https://reliable-drapes.vercel.app/  ✅ Clean URL
↓
Result: User logged in successfully
```

---

## ✅ **Verification Steps**

After making changes in Google Cloud Console:

1. **Clear browser cache and cookies**
   - Chrome: `Ctrl+Shift+Delete` → Clear last hour
   - Safari: `Cmd+Option+E`
   - Firefox: `Ctrl+Shift+Delete`

2. **Test production OAuth:**
   - Go to: `https://reliable-drapes.vercel.app/login`
   - Click "Continue with Google"
   - Should redirect to production (NOT localhost)

3. **Check browser console:**
   - Should see: `"Initiating Google OAuth with redirect: https://reliable-drapes.vercel.app/auth/callback"`
   - Should NOT see localhost URLs

4. **Verify final URL:**
   - After OAuth completes, URL should be: `https://reliable-drapes.vercel.app/`
   - NO `?code=` parameter
   - User logged in

5. **Test development still works:**
   - Go to: `http://localhost:3000/login`
   - OAuth should work (redirect to localhost)

---

## 📸 **Screenshot Guide**

**What to look for in Google Cloud Console:**

### **Authorized redirect URIs section should show:**
```
Authorized redirect URIs

http://localhost:3000/auth/callback                          [Delete]
https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback   [Delete]
https://reliable-drapes.vercel.app/auth/callback            [Delete]  ← THIS ONE!

[+ ADD URI]

[SAVE]  [CANCEL]
```

---

## 🎯 **Summary**

**Problem:** Google redirecting to localhost even in production

**Root Cause:** Missing production URL in Google Cloud Console authorized redirect URIs

**Solution:** Add `https://reliable-drapes.vercel.app/auth/callback` to authorized redirect URIs

**Time to Fix:** 2-3 minutes

**Testing:** Clear cache, try OAuth on production

---

## 📞 **Need Help?**

If issues persist after following this guide:

1. **Check exact URLs:**
   - Copy-paste from this guide
   - No typos in domain or path

2. **Verify Client ID matches:**
   - Client ID: `906305225514-p8n5jd8lcmqc3e0b6eiuat9dj9e7aahf`
   - Should match `.env.local` file

3. **Wait for propagation:**
   - Google changes can take 2-5 minutes
   - Try again after waiting

4. **Clear EVERYTHING:**
   - Logout from Google
   - Clear all cookies and cache
   - Close browser completely
   - Reopen and try again

---

**This is a Google Cloud Console configuration issue, NOT a code issue. Your Next.js code is correct.**
