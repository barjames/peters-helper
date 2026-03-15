'use client'

import { useEffect, useState } from 'react'
import { supabase, type Reminder, type BarryStatus, type CarerNote } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sendSuccess, setSendSuccess] = useState(false)

  const [barryLocation, setBarryLocation] = useState<'home' | 'dublin'>('home')
  const [statusSaving, setStatusSaving] = useState(false)

  const [carerNote, setCarerNote] = useState('')
  const [carerNoteSaving, setCarerNoteSaving] = useState(false)
  const [carerNoteSaved, setCarerNoteSaved] = useState(false)
  const [carerNoteError, setCarerNoteError] = useState('')

  // Check sessionStorage for auth persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('admin_authed')
      if (saved === 'true') setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (!authed) return

    // Load reminders
    async function loadData() {
      const [{ data: reminderData }, { data: statusData }, { data: carerData }] = await Promise.all([
        supabase
          .from('reminders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase.from('barry_status').select('*').eq('id', 1).single(),
        supabase.from('carer_note').select('*').eq('id', 1).single(),
      ])
      if (reminderData) setReminders(reminderData as Reminder[])
      if (statusData) setBarryLocation((statusData as BarryStatus).location)
      if (carerData) setCarerNote((carerData as CarerNote).note || '')
    }

    loadData()

    // Realtime: keep reminder log live
    const channel = supabase
      .channel('admin-reminders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reminders' },
        (payload) => {
          setReminders((prev) => [payload.new as Reminder, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authed])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    // Server-side check via API route
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setAuthed(true)
          sessionStorage.setItem('admin_authed', 'true')
          setPasswordError(false)
        } else {
          setPasswordError(true)
        }
      })
      .catch(() => setPasswordError(true))
  }

  async function sendReminder(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setSendError('')
    setSendSuccess(false)

    const { error } = await supabase
      .from('reminders')
      .insert({ message: message.trim() })

    setSending(false)
    if (error) {
      setSendError('Could not send reminder. Please try again.')
    } else {
      setSendSuccess(true)
      setMessage('')
      setTimeout(() => setSendSuccess(false), 3000)
    }
  }

  async function saveCarerNote(e: React.FormEvent) {
    e.preventDefault()
    setCarerNoteSaving(true)
    setCarerNoteError('')
    setCarerNoteSaved(false)

    const { error } = await supabase
      .from('carer_note')
      .update({ note: carerNote, updated_at: new Date().toISOString() })
      .eq('id', 1)

    setCarerNoteSaving(false)
    if (error) {
      setCarerNoteError('Could not save note. Please try again.')
    } else {
      setCarerNoteSaved(true)
      setTimeout(() => setCarerNoteSaved(false), 3000)
    }
  }

  async function updateStatus(location: 'home' | 'dublin') {
    setBarryLocation(location)
    setStatusSaving(true)
    await supabase
      .from('barry_status')
      .update({ location, updated_at: new Date().toISOString() })
      .eq('id', 1)
    setStatusSaving(false)
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Admin Panel</h1>
          <p className="text-gray-500 text-center mb-8">Peter&apos;s Helper</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`border-2 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 ${
                passwordError ? 'border-red-400' : 'border-gray-300'
              }`}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-sm">Incorrect password. Try again.</p>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-lg transition-colors"
            >
              Log in
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_authed')
              setAuthed(false)
            }}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Log out
          </button>
        </div>

        {/* Barry's Location */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">📍 Where are you today?</h2>
          <div className="flex gap-4">
            <button
              onClick={() => updateStatus('home')}
              disabled={statusSaving}
              className={`flex-1 py-5 rounded-2xl text-xl font-bold border-4 transition-all ${
                barryLocation === 'home'
                  ? 'bg-green-100 border-green-500 text-green-800 shadow-inner'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'
              }`}
            >
              🏠 At Home
            </button>
            <button
              onClick={() => updateStatus('dublin')}
              disabled={statusSaving}
              className={`flex-1 py-5 rounded-2xl text-xl font-bold border-4 transition-all ${
                barryLocation === 'dublin'
                  ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-inner'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300'
              }`}
            >
              🏙️ In Dublin
            </button>
          </div>
          {statusSaving && (
            <p className="text-sm text-gray-400 mt-2">Updating Dad&apos;s screen…</p>
          )}
        </section>

        {/* Carer Note */}
        <section className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-400">
          <h2 className="text-xl font-bold text-gray-700 mb-1">📋 Note for Carer</h2>
          <p className="text-sm text-gray-400 mb-4">
            This note stays on Dad&apos;s screen until you change it. Carers see it when they arrive.
          </p>
          <form onSubmit={saveCarerNote} className="flex flex-col gap-3">
            <textarea
              className="border-2 border-purple-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-500 resize-none"
              rows={4}
              placeholder="e.g. Peter had a good night. Breakfast done. Give him his 10am tablets. Doctor visit Thursday at 2pm."
              value={carerNote}
              onChange={(e) => setCarerNote(e.target.value)}
              maxLength={500}
            />
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={carerNoteSaving}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold px-8 py-3 rounded-xl text-lg transition-colors"
              >
                {carerNoteSaving ? 'Saving…' : 'Update Carer Note'}
              </button>
              {carerNoteSaved && (
                <span className="text-green-600 font-semibold">✓ Updated!</span>
              )}
              {carerNoteError && (
                <span className="text-red-500 text-sm">{carerNoteError}</span>
              )}
            </div>
          </form>
        </section>

        {/* Send Reminder */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">📝 Send a Reminder</h2>
          <form onSubmit={sendReminder} className="flex flex-col gap-3">
            <textarea
              className="border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
              placeholder="e.g. Lunch is at 1pm today. Don't forget your tablets."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
            />
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-8 py-3 rounded-xl text-lg transition-colors"
              >
                {sending ? 'Sending\u2026' : "Send to Dad's screen"}
              </button>
              {sendSuccess && (
                <span className="text-green-600 font-semibold">✓ Sent!</span>
              )}
              {sendError && (
                <span className="text-red-500 text-sm">{sendError}</span>
              )}
            </div>
          </form>
        </section>

        {/* Recent Reminders */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">🕐 Recent Reminders</h2>
          {reminders.length === 0 ? (
            <p className="text-gray-400">No reminders sent yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reminders.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="text-gray-800 text-base">{r.message}</p>
                  <p className="text-gray-400 text-sm mt-1">{formatDate(r.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}
