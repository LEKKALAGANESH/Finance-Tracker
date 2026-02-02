/**
 * Authentication Error Handling Utility
 *
 * Provides user-friendly error messages for authentication failures,
 * with specific handling for OAuth provider errors.
 */

export type AuthErrorType =
  | 'provider_not_enabled'
  | 'oauth_cancelled'
  | 'oauth_config_error'
  | 'network_error'
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_taken'
  | 'weak_password'
  | 'rate_limited'
  | 'session_expired'
  | 'unknown';

export interface AuthErrorInfo {
  type: AuthErrorType;
  title: string;
  message: string;
  suggestion?: string;
  canRetry: boolean;
  showEmailFallback: boolean;
}

/**
 * Patterns to detect specific error types from Supabase/OAuth errors
 */
const ERROR_PATTERNS: Record<AuthErrorType, RegExp[]> = {
  provider_not_enabled: [
    /provider is not enabled/i,
    /unsupported provider/i,
    /provider.*not.*configured/i,
    /oauth.*not.*enabled/i,
  ],
  oauth_cancelled: [
    /user.*cancel/i,
    /access.*denied/i,
    /user_cancelled/i,
    /consent.*denied/i,
  ],
  oauth_config_error: [
    /redirect.*mismatch/i,
    /invalid.*client/i,
    /client_id.*invalid/i,
    /unauthorized.*client/i,
    /invalid.*redirect/i,
  ],
  network_error: [
    /network/i,
    /fetch.*failed/i,
    /connection.*refused/i,
    /timeout/i,
    /ECONNREFUSED/i,
  ],
  invalid_credentials: [
    /invalid.*credentials/i,
    /invalid.*password/i,
    /incorrect.*password/i,
    /wrong.*password/i,
  ],
  user_not_found: [
    /user.*not.*found/i,
    /no.*user/i,
    /account.*not.*exist/i,
  ],
  email_taken: [
    /email.*already/i,
    /user.*already.*registered/i,
    /duplicate.*email/i,
    /email.*in.*use/i,
  ],
  weak_password: [
    /weak.*password/i,
    /password.*too.*short/i,
    /password.*requirements/i,
  ],
  rate_limited: [
    /rate.*limit/i,
    /too.*many.*requests/i,
    /throttle/i,
  ],
  session_expired: [
    /session.*expired/i,
    /token.*expired/i,
    /refresh.*token/i,
  ],
  unknown: [],
};

/**
 * User-friendly error information for each error type
 */
const ERROR_INFO: Record<AuthErrorType, Omit<AuthErrorInfo, 'type'>> = {
  provider_not_enabled: {
    title: 'Google Sign-In Unavailable',
    message: 'Google sign-in is temporarily unavailable. Our team has been notified and is working to resolve this.',
    suggestion: 'Please use email and password to sign in, or try again later.',
    canRetry: false,
    showEmailFallback: true,
  },
  oauth_cancelled: {
    title: 'Sign-In Cancelled',
    message: 'You cancelled the Google sign-in process.',
    suggestion: 'Click the Google button to try again, or use email sign-in instead.',
    canRetry: true,
    showEmailFallback: true,
  },
  oauth_config_error: {
    title: 'Configuration Error',
    message: 'There was a problem connecting to Google. This is a temporary issue on our end.',
    suggestion: 'Please try again in a few minutes, or use email sign-in.',
    canRetry: true,
    showEmailFallback: true,
  },
  network_error: {
    title: 'Connection Problem',
    message: 'Unable to connect to the authentication service. Please check your internet connection.',
    suggestion: 'Make sure you\'re connected to the internet and try again.',
    canRetry: true,
    showEmailFallback: false,
  },
  invalid_credentials: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
    suggestion: 'Please check your credentials and try again, or reset your password.',
    canRetry: true,
    showEmailFallback: false,
  },
  user_not_found: {
    title: 'Account Not Found',
    message: 'We couldn\'t find an account with that email address.',
    suggestion: 'Please check your email or create a new account.',
    canRetry: true,
    showEmailFallback: false,
  },
  email_taken: {
    title: 'Email Already Registered',
    message: 'An account with this email address already exists.',
    suggestion: 'Please sign in instead, or use a different email address.',
    canRetry: false,
    showEmailFallback: false,
  },
  weak_password: {
    title: 'Weak Password',
    message: 'Your password doesn\'t meet the security requirements.',
    suggestion: 'Please use at least 6 characters with a mix of letters and numbers.',
    canRetry: true,
    showEmailFallback: false,
  },
  rate_limited: {
    title: 'Too Many Attempts',
    message: 'You\'ve made too many sign-in attempts. Please wait a moment.',
    suggestion: 'Wait a few minutes before trying again.',
    canRetry: false,
    showEmailFallback: false,
  },
  session_expired: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
    suggestion: 'Click below to sign in again.',
    canRetry: true,
    showEmailFallback: false,
  },
  unknown: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred during sign-in.',
    suggestion: 'Please try again. If the problem persists, contact support.',
    canRetry: true,
    showEmailFallback: true,
  },
};

/**
 * Detect the error type from an error message or error object
 */
export function detectErrorType(error: Error | string | unknown): AuthErrorType {
  const errorMessage = getErrorMessage(error);

  for (const [type, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (type === 'unknown') continue;

    for (const pattern of patterns) {
      if (pattern.test(errorMessage)) {
        return type as AuthErrorType;
      }
    }
  }

  return 'unknown';
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: Error | string | unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    // Handle Supabase AuthError format
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    // Handle error_code format
    if ('error_code' in error && typeof error.error_code === 'string') {
      return error.error_code;
    }
    // Handle msg format
    if ('msg' in error && typeof error.msg === 'string') {
      return error.msg;
    }
  }

  return 'An unknown error occurred';
}

/**
 * Get user-friendly error information
 */
export function getAuthErrorInfo(error: Error | string | unknown): AuthErrorInfo {
  const type = detectErrorType(error);
  return {
    type,
    ...ERROR_INFO[type],
  };
}

/**
 * Get a simple user-friendly error message for toast notifications
 */
export function getUserFriendlyErrorMessage(error: Error | string | unknown): string {
  const info = getAuthErrorInfo(error);
  return info.message;
}

/**
 * Check if the error is related to OAuth provider configuration
 */
export function isProviderConfigError(error: Error | string | unknown): boolean {
  const type = detectErrorType(error);
  return type === 'provider_not_enabled' || type === 'oauth_config_error';
}

/**
 * Check if the error allows retry
 */
export function canRetryAuth(error: Error | string | unknown): boolean {
  return getAuthErrorInfo(error).canRetry;
}

/**
 * OAuth callback error codes for URL parameters
 */
export type OAuthCallbackError =
  | 'provider_disabled'
  | 'exchange_failed'
  | 'cancelled'
  | 'unknown';

/**
 * Map callback error code to error info
 */
export function getCallbackErrorInfo(errorCode: string | null): AuthErrorInfo | null {
  if (!errorCode) return null;

  switch (errorCode) {
    case 'provider_disabled':
      return { type: 'provider_not_enabled', ...ERROR_INFO.provider_not_enabled };
    case 'exchange_failed':
      return { type: 'oauth_config_error', ...ERROR_INFO.oauth_config_error };
    case 'cancelled':
      return { type: 'oauth_cancelled', ...ERROR_INFO.oauth_cancelled };
    case 'auth_callback_error':
      return { type: 'unknown', ...ERROR_INFO.unknown };
    default:
      return { type: 'unknown', ...ERROR_INFO.unknown };
  }
}
