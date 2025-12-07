# Delete Account Feature

We have implemented a safe "Delete Account" feature that allows users to permanently delete their account and all associated data.

## Safety Mechanism

To ensure data consistency and safety, we delete data in the following order:
1. **Memories**: Deleted first.
2. **Transformations**: Deleted second.
3. **Identities**: Deleted third (Identity Versions cascade automatically).
4. **Profile**: Deleted fourth.
5. **Auth User**: Deleted last using the Supabase Admin API.

## Implementation Details

### Server-Side
We use a Next.js API Route (`app/api/auth/delete/route.ts`) that runs with the **Service Role Key**. This allows us to bypass RLS policies to perform cleanups (although we also respect ownership).

The `SUPABASE_SERVICE_ROLE_KEY` MUST be present in your `.env` file for this to work.

### Client-Side
The Safe Deletion feature is exposed in the **Settings** view under a "Danger Zone".

## Usage
1. Go to **Settings**.
2. Scroll to **Danger Zone**.
3. Click **Delete Account**.
4. Confirm the modal action.
