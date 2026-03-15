import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Reminder = {
  id: string
  message: string
  created_at: string
}

export type BarryStatus = {
  id: number
  location: 'home' | 'dublin'
  updated_at: string
}

export type CarerNote = {
  id: number
  note: string
  updated_at: string
}
