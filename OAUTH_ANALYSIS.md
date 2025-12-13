# Google OAuth Analysis & Bug Report

**Date:** December 13, 2024  
**Status:** 🔍 Analysis Complete  
**Priority:** 🔴 CRITICAL

---

## 🔍 Identified Issues

### **1. CRITICAL: Redirect URL Mismatch** 🔴

**Location:** `AuthForm.tsx` (line 174) vs `.env.local` (line 22)

**Problem:**
```typescript
// AuthForm.tsx - Client-side OAuth
redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`

// .env.local
NEXT_PUBLIC_APP_URL=https://reliable-drapes.vercel.app
```

**Issue:** In development mode:
- `process.env.NEXT_PUBLIC_APP_URL` = `https://reliable-drapes.vercel.app` (production URL)
- `window.location.origin` = `http://localhost:3000`
- Result: OAuth redirects to **production URL** instead of **localhost** during development

**Impact:** Developers cannot test OAuth in local environment, causes "redirect URI mismatch" errors

---

### **2. CRITICAL: Duplicate OAuth Handling** 🔴

**Locations:** 
- `AuthProvider.tsx` (lines 26-73) - Client-side code exchange
- `auth/callback/route.ts` (lines 31-59) - Server-side code exchange

**Problem:**
```typescript
// AuthProvider.tsx
const { data: sessionData } = await supabaseClient.auth.exchangeCodeForSession(code);

// auth/callback/route.ts
const { data } = await supabase.auth.exchangeCodeForSession(code);
```

**Issue:** The OAuth code is being exchanged **TWICE**:
1. First in the callback route handler (server-side)
2. Again in AuthProvider (client-side)

**Impact:** 
- Second exchange will fail with "code already used" error
- Causes authentication to fail intermittently
- Console errors confuse debugging
- Race condition between server and client

---

### **3. WARNING: Missing Error Handling** 🟡

**Location:** `AuthForm.tsx` (lines 165-192)

**Problem:**
```typescript
const handleGoogleLogin = async () => {
  // ...OAuth initiation
  // Don't reset loading state - page will redirect
}
```

**Issue:** 
- If OAuth fails (network error, user cancels), loading state stays `true`
- Button remains disabled forever
- No user feedback on failure
- User must refresh page to try again

---

### **4. WARNING: Inconsistent Redirect Handling** 🟡

**Location:** Multiple files

**Problem:**
- `auth.ts` (line 156): `redirectTo: ${baseUrl}/auth/callback`
- `AuthForm.tsx` (line 174): `redirectTo: ${NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`
- Different approaches in different files

**Issue:**
- Inconsistent behavior between login methods
- Hard to maintain
- Confusion about which URL is used when

---

### **5. INFO: Unused Server Action** 🔵

**Location:** `auth.ts` (lines 146-180)

**Problem:**
```typescript
export async function googleOAuthAction(): Promise<{ url?: string; error?: string }> {
  // This function is defined but NEVER used
}
```

**Issue:**
- Dead code
- Confusing for developers
- Increases bundle size
- Suggests incomplete refactoring

---

### **6. CRITICAL: Profile Creation Timing Issue** 🔴

**Location:** `AuthProvider.tsx` (lines 58-63)

**Problem:**
```typescript
// Called AFTER session is set
await handleOAuthSignup(user.id, user.email || "");
```

**Issue:**
- Profile creation happens asynchronously AFTER redirect
- If profile creation fails, user might not have correct role
- Error is logged but user isn't informed
- Admin users might not get admin access immediately

---

### **7. WARNING: Cookie Configuration Incomplete** 🟡

**Location:** `client.ts` (lines 40-61)

**Problem:**
```typescript
set(name: string, value: string, options: any) {
  // Missing httpOnly flag consideration
  // Missing SameSite=Lax default for OAuth
}
```

**Issue:**
- OAuth cookies might not work correctly in production
- CSRF vulnerabilities possible
- Cross-domain OAuth might fail

---

## 🐛 Observed User Bugs (Based on Analysis)

### Bug #1: "OAuth works in production but not locally"
**Cause:** Issue #1 - Redirect URL mismatch  
**User Experience:** Developer tries Google login → gets redirect error → frustrated

### Bug #2: "Sometimes OAuth works, sometimes it doesn't"
**Cause:** Issue #2 - Duplicate code exchange (race condition)  
**User Experience:** User clicks Google login → sometimes succeeds, sometimes fails → confusion

### Bug #3: "Google login button stays loading forever"
**Cause:** Issue #3 - Missing error handling  
**User Experience:** User clicks Google → cancels popup → button stuck → must refresh page

### Bug #4: "I logged in with Google but I'm not an admin"
**Cause:** Issue #6 - Profile creation timing  
**User Experience:** Admin user logs in with Google → doesn't have admin access → must logout/login

---

## ✅ Recommended Fixes

### **Fix #1: Dynamic Redirect URL (CRITICAL)**

```typescript
// src/components/features/auth/AuthForm.tsx
const handleGoogleLogin = async () => {
  setStoreError(null);
  setIsGoogleLoading(true);

  try {
    // Dynamically build redirect based on environment
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      addToast(error.message || "Failed to initiate Google sign-in", "error");
      setStoreError(error.message);
      setIsGoogleLoading(false); // ✅ Reset on error
      return;
    }
  } catch (error) {
    console.error("Google OAuth error:", error);
    addToast("Failed to initiate Google sign-in", "error");
    setIsGoogleLoading(false); // ✅ Reset on error
  }
};
```

### **Fix #2: Remove Duplicate Code Exchange (CRITICAL)**

**Remove from `AuthProvider.tsx`:**
```typescript
// ❌ DELETE lines 26-73 (OAuth code exchange)
// Let the callback route handle it exclusively
```

**Simplify `AuthProvider.tsx`:**
```typescript
useEffect(() => {
  const restoreSession = async () => {
    try {
      // Just check for existing session
      const { data, error: sessionError } = await supabaseClient.auth.getSession();

      if (!sessionError && data.session) {
        const session = data.session;
        const user = session.user;

        if (user) {
          setUser({
            id: user.id,
            email: user.email || "",
            full_name: (user.user_metadata?.full_name as string) || undefined,
          });

          setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token || "",
            expires_at: session.expires_at,
            user: {
              id: user.id,
              email: user.email || "",
              full_name: (user.user_metadata?.full_name as string) || undefined,
            },
          });
        }
      }
    } catch (error) {
      console.error("AuthProvider - Failed to restore session:", error);
    } finally {
      setIsRestored(true);
    }
  };

  restoreSession();
}, [setUser, setSession]);
```

### **Fix #3: Better Error Handling (HIGH)**

```typescript
// Add timeout and better error recovery
const handleGoogleLogin = async () => {
  setStoreError(null);
  setIsGoogleLoading(true);

  // Set timeout to prevent infinite loading
  const timeout = setTimeout(() => {
    setIsGoogleLoading(false);
    addToast("OAuth timeout - please try again", "error");
  }, 30000); // 30 seconds

  try {
    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    });

    clearTimeout(timeout);

    if (error) {
      addToast(error.message || "Failed to initiate Google sign-in", "error");
      setStoreError(error.message);
      setIsGoogleLoading(false);
      return;
    }

    // OAuth redirect will happen, loading state will persist
  } catch (error) {
    clearTimeout(timeout);
    console.error("Google OAuth error:", error);
    addToast("Failed to initiate Google sign-in", "error");
    setIsGoogleLoading(false);
  }
};
```

### **Fix #4: Better Cookie Configuration (MEDIUM)**

```typescript
// src/lib/supabase/client.ts
export const supabaseClient = (() => {
  // ... existing code

  _browserClient = createBrowserClient(url, anonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        
        const matches = document.cookie.match(
          new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return;
        
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        
        cookieString += `; path=${options?.path || '/'}`;
        cookieString += `; samesite=${options?.sameSite || 'lax'}`; // ✅ Default to lax
        
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        }
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`;
        }
        if (options?.secure !== false) { // ✅ Secure by default in production
          cookieString += '; secure';
        }
        
        document.cookie = cookieString;
      },
      remove(name: string, options: any) {
        this.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  return _browserClient;
})();
```

### **Fix #5: Remove Dead Code (LOW)**

```typescript
// src/lib/actions/auth.ts
// ❌ DELETE lines 146-180 (googleOAuthAction)
// ❌ DELETE lines 182-216 (appleOAuthAction)
// These are unused and OAuth is handled client-side
```

---

## 🧪 Testing Checklist

### Development Mode Testing
- [ ] Google OAuth works on `http://localhost:3000`
- [ ] Apple OAuth works on `http://localhost:3000`
- [ ] Error messages display correctly
- [ ] Loading states reset properly
- [ ] Profile creation succeeds
- [ ] Admin promotion works for configured emails
- [ ] Regular users get 'customer' role

### Production Mode Testing
- [ ] Google OAuth works on production domain
- [ ] Apple OAuth works on production domain
- [ ] Cookies persist correctly
- [ ] Session restoration works after page refresh
- [ ] Multiple OAuth attempts don't cause errors
- [ ] Error handling works in all scenarios

---

## 📊 Priority Order

1. **🔴 IMMEDIATE (Today):** Fix #1 & #2 - Redirect URL + Duplicate Exchange
2. **🟡 HIGH (This Week):** Fix #3 - Error Handling
3. **🟡 MEDIUM (Before Launch):** Fix #4 - Cookie Configuration
4. **🔵 LOW (Cleanup):** Fix #5 - Remove Dead Code

---

## 🔗 Related Files

- `src/components/features/auth/AuthForm.tsx`
- `src/components/providers/AuthProvider.tsx`
- `src/app/auth/callback/route.ts`
- `src/lib/actions/auth.ts`
- `src/lib/supabase/client.ts`
- `.env.local`

---

**Next Steps:**
1. Review this analysis
2. Test OAuth in both development and production
3. Apply fixes based on priority
4. Re-test all OAuth flows
5. Update documentation
