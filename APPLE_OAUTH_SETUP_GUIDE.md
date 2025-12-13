# Apple OAuth Setup Guide for Supabase

## 🚨 **Current Status: Apple OAuth NOT CONFIGURED**

**Problem:** Apple OAuth is currently **disabled** in your Supabase project. The code is ready, but the backend configuration is missing.

**Evidence:**
```toml
# supabase/config.toml (line 263-264)
[auth.external.apple]
enabled = false  # ❌ Disabled
client_id = ""   # ❌ Empty
```

---

## ✅ **What You Need to Do**

Apple OAuth requires **extensive setup** in both Apple Developer Console and Supabase Dashboard. This is much more complex than Google OAuth.

### **Prerequisites**
1. ✅ **Apple Developer Account** ($99/year) - **REQUIRED**
2. ✅ Access to your domain (for redirect URLs)
3. ✅ Supabase project admin access

---

## 📋 **Complete Setup Checklist**

### **Phase 1: Apple Developer Console Setup (30-45 minutes)**

#### **Step 1: Create App ID**
- [ ] Go to [Apple Developer Portal](https://developer.apple.com/account)
- [ ] Navigate to **Certificates, Identifiers & Profiles**
- [ ] Click **Identifiers** → **+** (Add new)
- [ ] Select **App IDs** → **Continue**
- [ ] Select **App** → **Continue**
- [ ] Fill in:
  - **Description:** Reliable Drapes Web App
  - **Bundle ID:** `com.reliabledrapes.web` (or your domain reversed)
  - **Capabilities:** Check ✅ **Sign in with Apple**
- [ ] Click **Continue** → **Register**

#### **Step 2: Create Service ID**
- [ ] Click **Identifiers** → **+** (Add new)
- [ ] Select **Services IDs** → **Continue**
- [ ] Fill in:
  - **Description:** Reliable Drapes Web Auth Service
  - **Identifier:** `com.reliabledrapes.web.auth.service`
  - ✅ Check **Sign in with Apple**
- [ ] Click **Continue** → **Register**

#### **Step 3: Configure Service ID for Web**
- [ ] Click on your newly created **Service ID**
- [ ] Click **Configure** next to "Sign in with Apple"
- [ ] Select **Primary App ID:** (your App ID from Step 1)
- [ ] Under **Website URLs**, click **+** (Add)
- [ ] Fill in:
  - **Domains and Subdomains:**
    - For production: `reliable-drapes.vercel.app`
    - For local dev: `localhost` (if testing locally)
  - **Return URLs:**
    - Production: `https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback`
    - (Get this URL from Supabase Dashboard → Authentication → Providers → Apple)
- [ ] Click **Next** → **Done** → **Continue** → **Save**

#### **Step 4: Create Private Key (.p8 file)**
- [ ] Navigate to **Keys** → **+** (Add new)
- [ ] Fill in:
  - **Key Name:** Sign in with Apple Key
  - ✅ Check **Sign in with Apple**
- [ ] Click **Configure**
- [ ] Select your **Primary App ID** from Step 1
- [ ] Click **Save** → **Continue** → **Register**
- [ ] **⚠️ CRITICAL:** Click **Download** to get the `.p8` file
  - ⚠️ **You can ONLY download this ONCE!**
  - ⚠️ Save it securely (password manager, encrypted storage)
  - ⚠️ File name: `AuthKey_XXXXXXXXXX.p8`
- [ ] Note down the **Key ID** (10 characters, e.g., `AB12CD34EF`)

#### **Step 5: Get Your Team ID**
- [ ] Go to **Membership** in Apple Developer Portal
- [ ] Copy your **Team ID** (10 characters, e.g., `XYZ1234567`)

---

### **Phase 2: Supabase Dashboard Configuration (10-15 minutes)**

#### **Step 6: Enable Apple OAuth in Supabase**
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Select your project: `yjhqnahjucrcjhdwuykd`
- [ ] Navigate to **Authentication** → **Providers**
- [ ] Find **Apple** in the list
- [ ] Toggle **Enable Sign in with Apple** → **ON**

#### **Step 7: Fill in Apple OAuth Configuration**
- [ ] **Services ID (Client ID):**
  - Enter: `com.reliabledrapes.web.auth.service` (from Step 2)
  
- [ ] **Authorized Client IDs:**
  - Enter: `com.reliabledrapes.web` (your App ID from Step 1)
  
- [ ] **Secret Key (Private Key):**
  - Open your `.p8` file in a text editor
  - Copy the **ENTIRE contents** (including BEGIN/END lines)
  - Paste into Supabase
  
- [ ] **Key ID:**
  - Enter the 10-character Key ID from Step 4
  
- [ ] **Team ID:**
  - Enter your 10-character Team ID from Step 5

- [ ] Click **Save**

#### **Step 8: Copy Callback URL**
- [ ] In the same Apple provider settings, find **Callback URL (for OAuth)**
- [ ] It should be: `https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback`
- [ ] **Verify this matches** what you entered in Apple Developer Console (Step 3)

---

### **Phase 3: Environment Variables (5 minutes)**

**Good News:** Your code is already configured correctly! No `.env.local` changes needed.

#### **Step 9: Verify Environment Variables**
- [x] `NEXT_PUBLIC_SUPABASE_URL` - ✅ Already set
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ Already set
- [x] Redirect URL logic - ✅ Already dynamic

**No action needed** - your recent OAuth fixes handle Apple too!

---

### **Phase 4: Testing (15 minutes)**

#### **Step 10: Test in Development**
- [ ] Start dev server: `npm run dev`
- [ ] Go to `http://localhost:3000/login`
- [ ] Click **Continue with Apple**
- [ ] **Expected:**
  - Apple sign-in popup appears
  - You can authenticate with your Apple ID
  - Redirects back to `http://localhost:3000/` (clean URL)
  - User is logged in
- [ ] **Check console logs:**
  - Should see: "Initiating Apple OAuth with redirect: http://localhost:3000/auth/callback"
  - Should NOT see errors

#### **Step 11: Test in Production**
- [ ] Deploy to Vercel (if needed): `git push`
- [ ] Go to `https://reliable-drapes.vercel.app/login`
- [ ] Click **Continue with Apple**
- [ ] **Expected:**
  - Apple sign-in popup appears
  - Authenticate with Apple ID
  - Redirects to `https://reliable-drapes.vercel.app/` (clean URL)
  - User is logged in
- [ ] **Verify:**
  - User profile created in Supabase
  - Admin promotion works (if using admin email)

---

## 🔧 **Technical Details**

### **How Apple OAuth Works (After Setup)**

1. **User clicks "Continue with Apple"**
   - `AuthForm.tsx` calls `supabaseClient.auth.signInWithOAuth({ provider: "apple" })`
   - Redirect URL: `${window.location.origin}/auth/callback`

2. **Supabase redirects to Apple**
   - Uses your Service ID as client_id
   - Uses your Team ID + Key ID + Private Key to authenticate

3. **User authenticates with Apple**
   - Apple shows sign-in popup
   - User enters Apple ID credentials
   - Apple asks permission to share email

4. **Apple redirects back to Supabase**
   - URL: `https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback`
   - Supabase validates the response
   - Creates session

5. **Supabase redirects to your app**
   - URL: `http://localhost:3000/auth/callback?code=ABC123`

6. **Your callback route handles it**
   - `/auth/callback/route.ts` exchanges code for session
   - Checks if user is admin
   - Redirects to homepage

7. **User is logged in** ✅

---

## 🚨 **Common Issues & Troubleshooting**

### **Issue 1: "Invalid Client" Error**
**Cause:** Service ID doesn't match what's in Supabase

**Fix:**
- ✅ Service ID in Supabase **MUST** match Service ID in Apple Developer Console
- ✅ Both should be: `com.reliabledrapes.web.auth.service`

---

### **Issue 2: "Redirect URI Mismatch" Error**
**Cause:** Callback URL in Apple Console doesn't match Supabase callback

**Fix:**
- ✅ In Apple Console (Service ID Web Configuration):
  - Return URL: `https://yjhqnahjucrcjhdwuykd.supabase.co/auth/v1/callback`
- ✅ In Supabase Dashboard:
  - Shows same callback URL
- ✅ They MUST match exactly

---

### **Issue 3: "Invalid Secret" Error**
**Cause:** Wrong private key, Key ID, or Team ID

**Fix:**
- ✅ Copy **entire** `.p8` file contents (including `-----BEGIN PRIVATE KEY-----`)
- ✅ Key ID is **10 characters** (from Apple Keys page)
- ✅ Team ID is **10 characters** (from Apple Membership page)

---

### **Issue 4: Private Key Expired (After 6 Months)**
**Apple Requirement:** Private keys (.p8) expire every 6 months

**Fix:**
- ⚠️ Set a calendar reminder for **6 months from setup date**
- ⚠️ When expired:
  1. Go to Apple Developer Portal → Keys
  2. Create new key (same process as Step 4)
  3. Download new `.p8` file
  4. Update in Supabase Dashboard
  5. Test Apple OAuth still works

---

### **Issue 5: Apple Doesn't Return User's Name**
**Apple Limitation:** User's full name is ONLY provided on FIRST sign-in

**Workaround (Already Handled in Your Code):**
```typescript
// In /auth/callback/route.ts
const displayName = 
  user.user_metadata?.full_name || 
  user.user_metadata?.name || 
  user.email?.split("@")[0] || 
  "User";
```

**Better Solution (Manual Capture):**
- On first sign-in, prompt user to enter their name
- Save it using `supabase.auth.updateUser({ data: { full_name: "..." } })`

---

## 📊 **Setup Time Estimate**

| Phase | Task | Time |
|-------|------|------|
| 1 | Apple Developer Console Setup | 30-45 min |
| 2 | Supabase Dashboard Configuration | 10-15 min |
| 3 | Environment Variables | 5 min (already done ✅) |
| 4 | Testing | 15 min |
| **TOTAL** | **First-time setup** | **60-75 minutes** |

---

## 🎯 **After Completion**

### **Verification Checklist**
- [ ] Apple OAuth button visible on login page
- [ ] Clicking button opens Apple sign-in popup
- [ ] Can authenticate with Apple ID
- [ ] Redirects to clean homepage URL (no `?code=`)
- [ ] User account created in Supabase
- [ ] User is logged in immediately
- [ ] Admin promotion works (if applicable)
- [ ] Session persists on page refresh
- [ ] No console errors

### **Documentation to Update**
- [ ] Mark Apple OAuth as ✅ Fully Functional in `APP_STATUS.md`
- [ ] Add Apple credentials to secure password manager
- [ ] Set 6-month reminder for key rotation

---

## 📚 **Official Resources**

- **Apple Developer Portal:** https://developer.apple.com/account
- **Supabase Apple OAuth Docs:** https://supabase.com/docs/guides/auth/social-login/auth-apple
- **Apple Sign In for Web Guide:** https://developer.apple.com/sign-in-with-apple/get-started/

---

## 💡 **Alternative: Skip Apple OAuth (Optional)**

If you don't have an Apple Developer Account ($99/year) or don't want to spend 60+ minutes on setup:

**Option 1: Hide the Apple Button**
```typescript
// In AuthForm.tsx - Comment out the Apple button
{/* Continue with Apple button - Commented out until Apple OAuth is configured */}
{/* <motion.button ... /> */}
```

**Option 2: Show "Coming Soon" State**
```typescript
<motion.button
  type="button"
  onClick={() => addToast("Apple Sign In coming soon!", "info")}
  disabled={true}
  className="opacity-50 cursor-not-allowed ..."
>
  <Apple className="h-5 w-5" />
  <span className="text-gray-900">Continue with Apple (Coming Soon)</span>
</motion.button>
```

**Option 3: Complete the Setup**
Follow all steps above to enable full Apple OAuth functionality.

---

## ✅ **Summary**

**Why Apple OAuth Isn't Working:**
1. ❌ Not enabled in Supabase Dashboard
2. ❌ No Apple Developer Account configuration
3. ❌ No Service ID created
4. ❌ No private key (.p8) uploaded
5. ✅ Code is ready (no changes needed)

**To Fix:**
- Complete Apple Developer Console setup (30-45 min)
- Configure Supabase Apple provider (10-15 min)
- Test in dev and production (15 min)

**OR:**
- Hide/disable Apple button until you have time to set it up properly

---

**Next Steps:** Let me know if you want to:
1. **Complete the setup** (I can guide you through each step)
2. **Hide the Apple button** for now (quick fix)
3. **Show "Coming Soon"** state (user-friendly)
