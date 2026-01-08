# Supabase Setup Requirements

## Database Trigger for Profile Creation

**CRITICAL:** Supabase must have a database trigger that automatically creates a profile row when a new user signs up.

### Required SQL Trigger

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Why This Is Needed

1. **On signup**: User is created in `auth.users` table
2. **Trigger fires**: Automatically creates corresponding row in `profiles` table with `plan: 'free'`
3. **On login**: App fetches profile from `profiles` table and gets the user's plan
4. **On reinstall**: User logs in → profile is fetched → plan is restored (no manual "Pro" click needed)

### Without This Trigger

- New users won't have a profile row
- `loadUserProfile()` will return `null`
- User defaults to free plan even if they paid for Pro
- On reinstall, Pro users have to manually click "Pro" to restore access

### Verification

After setting up the trigger, verify it works:

1. Create a new test user via signup
2. Check Supabase dashboard → `profiles` table
3. Confirm a row was automatically created with `plan: 'free'`

### Manual Profile Creation (Temporary Workaround)

If the trigger isn't set up yet, profiles can be created manually in Supabase:

```sql
INSERT INTO profiles (id, email, plan, created_at, updated_at)
SELECT id, email, 'free', NOW(), NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## Plan Upgrade Flow

When a user upgrades to Pro:

1. Update their profile in Supabase: `UPDATE profiles SET plan = 'pro' WHERE id = '<user_id>'`
2. On next login, `loadUserProfile()` fetches the updated plan
3. Plan is cached to localStorage for offline fallback
4. User has Pro access immediately

## Reinstall Flow (With Proper Setup)

1. User reinstalls PWA → localStorage is cleared
2. User logs in with email/password
3. `loadUserProfile()` fetches profile from Supabase → gets `plan: 'pro'`
4. Plan is cached to localStorage
5. Pro features are immediately available (no manual "Pro" click needed)

## Fallback Mechanism

The app now has a fallback mechanism in `setUserProfile()`:

- If `loadUserProfile()` fails (returns `null`), the app checks localStorage for a cached plan
- If a cached Pro plan exists, it's restored temporarily
- This handles network errors or temporary Supabase issues
- However, this only works if the user has logged in successfully at least once before

**Bottom line:** The Supabase trigger is essential for new users and first-time logins after reinstall.
