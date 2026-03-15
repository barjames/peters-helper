import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  // Simple secret check
  const secret = request.headers.get('x-reset-secret')
  if (secret !== process.env.RESET_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  await supabase.from('carer_note').update({ note: '', updated_at: new Date().toISOString() }).eq('id', 1)
  return NextResponse.json({ ok: true })
}
