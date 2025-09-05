#!/usr/bin/env tsx

import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DOTENV_FILE = '.env.local'

function syncSecretsToEnv() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase secrets!')
    console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in Replit Secrets')
    process.exit(1)
  }

  let existingEnv: Record<string, string> = {}

  // Read existing .env.local if it exists
  if (existsSync(DOTENV_FILE)) {
    try {
      const content = readFileSync(DOTENV_FILE, 'utf-8')
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=')
        if (key && valueParts.length > 0) {
          existingEnv[key.trim()] = valueParts.join('=').trim()
        }
      })
    } catch (err) {
      console.warn('Warning: Could not read existing .env.local')
    }
  }

  // Clean up URLs from potential unicode issues
  const cleanUrl = supabaseUrl.replace(/[^\x20-\x7E]/g, '').trim()
  const cleanKey = supabaseAnonKey.replace(/[^\x20-\x7E]/g, '').trim()

  // Update with Supabase values
  existingEnv['NEXT_PUBLIC_SUPABASE_URL'] = cleanUrl
  existingEnv['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = cleanKey
  existingEnv['VITE_SUPABASE_URL'] = cleanUrl
  existingEnv['VITE_SUPABASE_ANON_KEY'] = cleanKey

  // Write updated .env.local
  const envContent = Object.entries(existingEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  writeFileSync(DOTENV_FILE, envContent + '\n')
  console.log('✅ synced secrets → .env.local')
}

syncSecretsToEnv()