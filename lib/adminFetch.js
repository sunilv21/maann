'use client';
import { authFetch } from '@/lib/authFetch';

// Admin requests use the same session handling as all other authenticated API calls.
export function adminFetch(url, options = {}) {
  return authFetch(url, options);
}
