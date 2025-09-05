/**
 * Centralized environment configuration
 * Supports Node.js, Next.js, and Vite environments
 */

export function getSupabaseUrl(): string {
  // Try different environment variable sources
  let url = process.env.SUPABASE_URL ||
            process.env.NEXT_PUBLIC_SUPABASE_URL

  // Try Vite env (wrapped in try-catch for Node.js compatibility)
  if (!url) {
    try {
      url = (import.meta.env as any)?.VITE_SUPABASE_URL
    } catch {
      // import.meta not available in Node.js, ignore
    }
  }

  if (!url) {
    throw new Error('Missing Supabase ENV. Set SUPABASE_URL / SUPABASE_ANON_KEY in Replit Secrets.')
  }

  // Clean invisible/unicode characters
  return url.replace(/[^\x20-\x7E]/g, '').trim()
}

export function getSupabaseAnonKey(): string {
  // Try different environment variable sources
  let key = process.env.SUPABASE_ANON_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Try Vite env (wrapped in try-catch for Node.js compatibility)
  if (!key) {
    try {
      key = (import.meta.env as any)?.VITE_SUPABASE_ANON_KEY
    } catch {
      // import.meta not available in Node.js, ignore
    }
  }

  if (!key) {
    throw new Error('Missing Supabase ENV. Set SUPABASE_URL / SUPABASE_ANON_KEY in Replit Secrets.')
  }

  // Clean invisible/unicode characters
  return key.replace(/[^\x20-\x7E]/g, '').trim()
}