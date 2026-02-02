import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Determine the appropriate error code based on the OAuth error
 */
function getErrorCode(error: Error | null, errorParam: string | null): string {
  // Check for OAuth error in URL (from provider)
  if (errorParam) {
    if (errorParam === 'access_denied' || errorParam === 'user_cancelled_login') {
      return 'cancelled';
    }
    return 'exchange_failed';
  }

  // Check for specific error messages from Supabase
  if (error?.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('provider') && (msg.includes('not enabled') || msg.includes('disabled'))) {
      return 'provider_disabled';
    }
    if (msg.includes('invalid') || msg.includes('expired')) {
      return 'exchange_failed';
    }
  }

  return 'exchange_failed';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  // Handle OAuth errors returned directly in the URL (e.g., user cancelled)
  if (errorParam) {
    const errorCode = getErrorCode(null, errorParam);
    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    // Map the error to a user-friendly error code
    const errorCode = getErrorCode(error, null);
    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  // No code and no error - unexpected state
  return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
}
