# Phone Number Collection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Collect phone numbers during signup and via a post-login modal for users who haven't provided one.

**Architecture:** Indian mobile validation shared across signup form and post-login modal. Modal shown in LayoutContent after auth state changes, with a dismiss counter stored in the `profiles` table. After 3 dismissals the modal becomes mandatory.

**Tech Stack:** Next.js 15, Supabase, Zod, Framer Motion, Zustand, Tailwind CSS

---

### Task 1: Phone validation helper + tests

**Files:**
- Modify: `src/lib/validators/profile.validators.ts`
- Create: `src/lib/validators/profile.validators.spec.ts`

**Step 1: Write the failing test**

Create `src/lib/validators/profile.validators.spec.ts`:

```ts
import { describe, expect, test } from "vitest";
import fc from "fast-check";
import { indianPhoneSchema } from "./profile.validators";

describe("indianPhoneSchema", () => {
  test("accepts valid 10-digit Indian mobile numbers", () => {
    const valid = ["9876543210", "6000000000", "7123456789", "8999999999"];
    for (const num of valid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(true);
    }
  });

  test("rejects numbers not starting with 6-9", () => {
    const invalid = ["5876543210", "0123456789", "1234567890", "4999999999"];
    for (const num of invalid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(false);
    }
  });

  test("rejects wrong length", () => {
    const invalid = ["987654321", "98765432101", ""];
    for (const num of invalid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(false);
    }
  });

  test("rejects non-digit characters", () => {
    const invalid = ["98765abcde", "987-654-3210", "+919876543210"];
    for (const num of invalid) {
      expect(indianPhoneSchema.safeParse(num).success).toBe(false);
    }
  });

  test("all valid phones are exactly 10 digits starting with 6-9", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 9 }),
        fc.stringOf(fc.constantFrom("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"), { minLength: 9, maxLength: 9 }),
        (first, rest) => {
          const phone = `${first}${rest}`;
          expect(indianPhoneSchema.safeParse(phone).success).toBe(true);
        },
      ),
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/validators/profile.validators.spec.ts`
Expected: FAIL — `indianPhoneSchema` is not exported

**Step 3: Write minimal implementation**

Add to `src/lib/validators/profile.validators.ts` (before `profileSchema`):

```ts
export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");
```

Also update the `phone` field in `profileSchema` to reuse it:

```ts
export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: indianPhoneSchema.or(z.literal("")).optional(),
  // ... rest unchanged
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/validators/profile.validators.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/validators/profile.validators.ts src/lib/validators/profile.validators.spec.ts
git commit -m "feat: add Indian phone number validation schema with tests"
```

---

### Task 2: Add phone to signup schema

**Files:**
- Modify: `src/lib/validators/auth.validators.ts`

**Step 1: Update authSignupSchema**

In `src/lib/validators/auth.validators.ts`, add import and phone field:

```ts
import { indianPhoneSchema } from "./profile.validators";

export const authSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1).optional(),
  phone: indianPhoneSchema,
});
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: May show errors in `auth.ts` because `signupAction` doesn't destructure `phone` yet. That's expected and fixed in Task 4.

**Step 3: Commit**

```bash
git add src/lib/validators/auth.validators.ts
git commit -m "feat: add phone field to signup validation schema"
```

---

### Task 3: Add phone input to signup form

**Files:**
- Modify: `src/components/features/auth/AuthForm.tsx`

**Step 1: Add phone state and input field**

Add state at line ~26 (after `fullName` state):

```ts
const [phone, setPhone] = useState("");
```

Add validation in `handleSubmit` after the fullName check (~line 58):

```ts
if (!isLogin && !/^[6-9]\d{9}$/.test(phone)) {
  addToast("Enter a valid 10-digit Indian mobile number", "warning");
  return;
}
```

Add phone to the signup formData (~line 114-118):

```ts
const formData = {
  email,
  password,
  full_name: fullName,
  phone,
};
```

Add phone input field after the Full Name field block (after line 292, before the Email block). Match the existing input styling:

```tsx
{!isLogin && (
  <motion.div
    className="mb-6"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.37 }}
  >
    <label
      htmlFor="phone"
      className="mb-3 block text-xs tracking-widest text-gray-600 uppercase"
    >
      Phone Number
    </label>
    <div className="flex items-center">
      <span className="border-b border-gray-900 py-3 pr-2 text-gray-500">
        +91
      </span>
      <input
        id="phone"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        placeholder="10-digit mobile number"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
        }
        disabled={isPending}
        className="w-full border-0 border-b border-gray-900 bg-transparent px-2 py-3 text-gray-500 placeholder-gray-300 focus:border-[#2f2581] focus:outline-none disabled:opacity-50"
        required={!isLogin}
      />
    </div>
  </motion.div>
)}
```

**Step 2: Verify it renders**

Run: `npx next dev` and navigate to `/signup`. Confirm phone field appears with +91 prefix, only accepts digits, max 10 chars.

**Step 3: Commit**

```bash
git add src/components/features/auth/AuthForm.tsx
git commit -m "feat: add phone input field to signup form"
```

---

### Task 4: Accept phone in signupAction

**Files:**
- Modify: `src/lib/actions/auth.ts:10-78`

**Step 1: Update signupAction to accept and store phone**

Change the function signature at line 10-11:

```ts
export async function signupAction(
  formData: FormData | { email: string; password: string; full_name?: string; phone?: string },
): Promise<AuthResponse> {
```

Destructure phone from parse.data at line 28:

```ts
const { email, password, full_name, phone } = parse.data;
```

Add phone to the profile upsert at lines 71-78:

```ts
const { error: upsertErr } = await admin.from("profiles").upsert(
  {
    id: userId,
    full_name: full_name ?? null,
    phone: phone ?? null,
    role: isAdminEmail ? "admin" : "customer",
  },
  { onConflict: "id" },
);
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: PASS (no new errors from our changes)

**Step 3: Commit**

```bash
git add src/lib/actions/auth.ts
git commit -m "feat: store phone number during signup"
```

---

### Task 5: Database migration for dismiss count

**Files:**
- Create: `supabase/migrations/20260308000000_add_phone_prompt_dismissed_count.sql`

**Step 1: Write migration**

```sql
-- Add phone_prompt_dismissed_count column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_prompt_dismissed_count integer NOT NULL DEFAULT 0;
```

**Step 2: Verify migration syntax**

Run: `npx supabase db reset` (or apply locally if preferred)

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000000_add_phone_prompt_dismissed_count.sql
git commit -m "feat: add phone_prompt_dismissed_count column to profiles"
```

---

### Task 6: Server actions for phone status + dismiss count

**Files:**
- Modify: `src/lib/actions/users.ts`
- Create: `src/lib/actions/users.spec.ts` (phone status logic tests)

**Step 1: Write the failing test**

Create `src/lib/actions/users.spec.ts`:

```ts
import { describe, expect, test } from "vitest";

import { shouldShowPhonePrompt } from "./users";

describe("shouldShowPhonePrompt", () => {
  test("returns needsPhone=false when phone exists", () => {
    const result = shouldShowPhonePrompt("9876543210", 0);
    expect(result).toEqual({ needsPhone: false, canDismiss: true });
  });

  test("returns needsPhone=true, canDismiss=true when phone is null and count < 3", () => {
    expect(shouldShowPhonePrompt(null, 0)).toEqual({ needsPhone: true, canDismiss: true });
    expect(shouldShowPhonePrompt(null, 2)).toEqual({ needsPhone: true, canDismiss: true });
  });

  test("returns needsPhone=true, canDismiss=false when phone is null and count >= 3", () => {
    expect(shouldShowPhonePrompt(null, 3)).toEqual({ needsPhone: true, canDismiss: false });
    expect(shouldShowPhonePrompt(null, 10)).toEqual({ needsPhone: true, canDismiss: false });
  });

  test("treats empty string phone as missing", () => {
    expect(shouldShowPhonePrompt("", 0)).toEqual({ needsPhone: true, canDismiss: true });
    expect(shouldShowPhonePrompt("  ", 1)).toEqual({ needsPhone: true, canDismiss: true });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/actions/users.spec.ts`
Expected: FAIL — `shouldShowPhonePrompt` not exported

**Step 3: Write implementation**

Add to `src/lib/actions/users.ts` (at the end of the file):

```ts
const MAX_PHONE_DISMISSALS = 3;

export function shouldShowPhonePrompt(
  phone: string | null | undefined,
  dismissedCount: number,
): { needsPhone: boolean; canDismiss: boolean } {
  const hasPhone = Boolean(phone?.trim());
  if (hasPhone) return { needsPhone: false, canDismiss: true };
  return {
    needsPhone: true,
    canDismiss: dismissedCount < MAX_PHONE_DISMISSALS,
  };
}

export async function getUserPhoneStatus(): Promise<{
  needsPhone: boolean;
  canDismiss: boolean;
}> {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { needsPhone: false, canDismiss: true };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("phone, phone_prompt_dismissed_count")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { needsPhone: false, canDismiss: true };
  }

  return shouldShowPhonePrompt(data.phone, data.phone_prompt_dismissed_count ?? 0);
}

export async function incrementPhoneDismissCount(): Promise<{ success: boolean }> {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false };
  }

  const { error } = await supabase.rpc("increment_phone_dismiss_count", {
    user_id: user.id,
  });

  // Fallback: if RPC doesn't exist, do a manual read+write
  if (error) {
    const { data } = await supabase
      .from("profiles")
      .select("phone_prompt_dismissed_count")
      .eq("id", user.id)
      .single();

    const currentCount = data?.phone_prompt_dismissed_count ?? 0;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ phone_prompt_dismissed_count: currentCount + 1 })
      .eq("id", user.id);

    if (updateError) return { success: false };
  }

  return { success: true };
}

export async function savePhoneNumber(phone: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ phone, phone_prompt_dismissed_count: 0 })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/actions/users.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/actions/users.ts src/lib/actions/users.spec.ts
git commit -m "feat: add phone status check and dismiss count server actions"
```

---

### Task 7: PhonePromptModal component

**Files:**
- Create: `src/components/features/auth/PhonePromptModal.tsx`

**Step 1: Create the modal component**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, X, Loader } from "lucide-react";
import { savePhoneNumber, incrementPhoneDismissCount } from "@/lib/actions/users";

interface PhonePromptModalProps {
  isOpen: boolean;
  canDismiss: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function PhonePromptModal({
  isOpen,
  canDismiss,
  onClose,
  onSaved,
}: PhonePromptModalProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsSubmitting(true);
    const result = await savePhoneNumber(phone);
    setIsSubmitting(false);

    if (result.success) {
      onSaved();
    } else {
      setError(result.error || "Failed to save phone number");
    }
  };

  const handleDismiss = async () => {
    setIsSubmitting(true);
    await incrementPhoneDismissCount();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {canDismiss && (
              <button
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2F2582]/10">
              <Phone className="h-6 w-6 text-[#2F2582]" />
            </div>

            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Add your phone number
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              {canDismiss
                ? "We'd love to have your phone number for order updates and support."
                : "A phone number is required to continue using Reliable Drapes."}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="phone-prompt"
                  className="mb-2 block text-xs font-medium tracking-widest text-gray-600 uppercase"
                >
                  Mobile Number
                </label>
                <div className="flex items-center rounded-lg border border-gray-300 transition-colors focus-within:border-[#2F2582] focus-within:ring-2 focus-within:ring-[#2F2582]/20">
                  <span className="pl-3 pr-1 text-sm text-gray-500">+91</span>
                  <input
                    id="phone-prompt"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError("");
                    }}
                    disabled={isSubmitting}
                    className="w-full rounded-r-lg border-0 bg-transparent px-2 py-3 text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length < 10}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2F2582] text-sm font-medium text-white transition-colors hover:bg-[#241c66] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                Save Phone Number
              </button>

              {canDismiss && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="mt-3 w-full cursor-pointer py-2 text-center text-sm text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-50"
                >
                  Skip for now
                </button>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/features/auth/PhonePromptModal.tsx
git commit -m "feat: add PhonePromptModal component"
```

---

### Task 8: Wire modal into LayoutContent

**Files:**
- Modify: `src/components/layout/LayoutContent.tsx`

**Step 1: Add phone prompt logic**

Replace the contents of `LayoutContent.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { CTASection, GlobalContactButton } from "@/components/shared";
import { CartDrawer } from "@/components/features/shop";
import { PhonePromptModal } from "@/components/features/auth/PhonePromptModal";
import { useAuthStore } from "@/lib/store";
import { getUserPhoneStatus } from "@/lib/actions/users";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [phonePrompt, setPhonePrompt] = useState<{
    show: boolean;
    canDismiss: boolean;
  }>({ show: false, canDismiss: true });

  useEffect(() => {
    if (!user) {
      setPhonePrompt({ show: false, canDismiss: true });
      return;
    }

    let cancelled = false;

    async function checkPhone() {
      const status = await getUserPhoneStatus();
      if (!cancelled && status.needsPhone) {
        setPhonePrompt({ show: true, canDismiss: status.canDismiss });
      }
    }

    checkPhone();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
      <CTASection enableVideoBackground />
      <Footer />
      <GlobalContactButton />
      <CartDrawer />
      <PhonePromptModal
        isOpen={phonePrompt.show}
        canDismiss={phonePrompt.canDismiss}
        onClose={() => setPhonePrompt({ show: false, canDismiss: true })}
        onSaved={() => setPhonePrompt({ show: false, canDismiss: true })}
      />
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Manual test**

1. Log in with an account that has no phone number
2. Modal should appear after login
3. Dismiss it — should close
4. Refresh page — modal appears again (count now 1)
5. Submit a valid phone — modal closes, never shows again

**Step 4: Commit**

```bash
git add src/components/layout/LayoutContent.tsx
git commit -m "feat: wire PhonePromptModal into layout with auth-aware check"
```

---

### Task 9: Export new components and run final checks

**Step 1: Check if PhonePromptModal needs to be exported from an index file**

Check `src/components/features/auth/index.ts` — if it exists, add the export. If not, the direct import in LayoutContent is fine.

**Step 2: Run full typecheck and lint**

Run: `npx tsc --noEmit && npx prettier --check src/lib/validators/ src/lib/actions/users.ts src/components/features/auth/PhonePromptModal.tsx src/components/layout/LayoutContent.tsx src/components/features/auth/AuthForm.tsx`

Fix any issues.

**Step 3: Run all tests**

Run: `npx vitest run src/lib/validators/profile.validators.spec.ts src/lib/actions/users.spec.ts`
Expected: All PASS

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup for phone collection feature"
```
