# Phone Number Collection at Login

## Problem

Phone numbers are not collected during signup or login. The `phone` column exists in the `profiles` table and the profile edit form supports it, but users are never prompted to provide one during onboarding.

## Solution

Collect phone numbers in two places:

1. **Signup form** — required field for new email/password signups
2. **Post-login modal** — catches OAuth users and existing users who never provided a phone number

## Phone Validation

Indian mobile format only: 10 digits starting with 6-9. Regex: `/^[6-9]\d{9}$/`. Display with +91 prefix.

## Modal Behavior

- Shown after any login (email/password or OAuth) when `profiles.phone` is null or empty
- Dismissible up to 3 times (`phone_prompt_dismissed_count < 3` shows "Skip for now")
- After 3 dismissals, modal becomes mandatory (no skip option)
- Dismissal count stored in `profiles.phone_prompt_dismissed_count` (persists across devices)

## Data Flow

```
Login/OAuth → fetch profile → phone is null?
  → YES → check dismissed_count
    → < 3: show modal (skippable)
    → >= 3: show modal (mandatory)
  → NO → proceed normally
```

## Database Change

New migration: add `phone_prompt_dismissed_count` integer column (default 0) to `profiles` table.

## Files to Modify/Create

| File | Change |
|------|--------|
| `src/lib/validators/auth.validators.ts` | Add phone to `authSignupSchema` |
| `src/lib/validators/profile.validators.ts` | Add Indian phone validation helper, reuse in both schemas |
| `src/components/features/auth/AuthForm.tsx` | Add phone input in signup mode |
| `src/lib/actions/auth.ts` | Accept phone in `signupAction()` |
| `supabase/migrations/YYYYMMDD_add_phone_prompt_dismissed_count.sql` | New column |
| `src/components/features/auth/PhonePromptModal.tsx` | New modal component |
| `src/lib/actions/users.ts` | Add `incrementPhoneDismissCount()` and `getUserPhoneStatus()` |
| `src/components/layout/LayoutContent.tsx` | Trigger phone check after auth state changes |

## Testing

- Unit: phone validation (Indian format edge cases, invalid inputs)
- Unit: dismiss count logic
- Integration: signup with phone persists to profile
- Integration: dismiss count increments correctly
