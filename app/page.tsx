'use client'

import { useEffect, useState } from 'react'
import { supabase, type Reminder, type BarryStatus, type CarerNote } from '@/lib/supabase'

const MUSIC_ARTISTS = [
  {
    emoji: '🎵',
    label: 'Frank Sinatra',
    src: 'https://www.youtube-nocookie.com/embed/qQzdAsjWGPg?autoplay=1',
  },
  {
    emoji: '🎶',
    label: 'Bing Crosby',
    src: 'https://www.youtube-nocookie.com/embed/jrGudBynZow?autoplay=1',
  },
  {
    emoji: '🎼',
    label: 'Dean Martin',
    src: 'https://www.youtube-nocookie.com/embed/RUz1pZ_LujU?autoplay=1',
  },
]

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning, Peter! ☀️'
  if (hour >= 12 && hour < 18) return 'Good afternoon, Peter! 😊'
  if (hour >= 18 && hour < 22) return 'Good evening, Peter! 🌙'
  return 'Good night, Peter! 🌙'
}

function useIrishTime() {
  const [state, setState] = useState({ time: '', day: '', date: '', hour: 0 })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const opts = { timeZone: 'Europe/Dublin' } as const
      const day = now.toLocaleDateString('en-IE', { ...opts, weekday: 'long' })
      const date = now.toLocaleDateString('en-IE', { ...opts, day: 'numeric', month: 'long', year: 'numeric' })
      const time = now.toLocaleTimeString('en-IE', { ...opts, hour: '2-digit', minute: '2-digit' })
      const hour = parseInt(
        now.toLocaleString('en-IE', { hour: 'numeric', hour12: false, timeZone: 'Europe/Dublin' }),
        10
      )
      setState({ time, day, date, hour })
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [])

  return state
}

type WeatherData =
  | { ok: true; emoji: string; temp: string; feelsLike: string; description: string }
  | { ok: false }

function useWeather(): WeatherData | null {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/weather')
        setWeather(await res.json())
      } catch {
        // fail silently
      }
    }
    load()
    const interval = setInterval(load, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  return weather
}

type CallState = 'idle' | 'loading' | 'success' | 'error'

// ─── Top Bar ────────────────────────────────────────────────────────────────

function TopBar({ hour, weather }: { hour: number; weather: WeatherData | null }) {
  const greeting = hour ? getGreeting(hour) : ''

  return (
    <div className="flex justify-between items-center px-6 py-2 flex-shrink-0 border-b border-slate-700/50">
      <span className="text-2xl font-semibold text-amber-400">{greeting}</span>
      {weather && weather.ok && (
        <span className="text-lg text-slate-300">
          {weather.emoji} {weather.description} · {weather.temp}°C
        </span>
      )}
    </div>
  )
}

// ─── Left Clock Column ───────────────────────────────────────────────────────

function ClockColumn({ time, day, date }: { time: string; day: string; date: string }) {
  return (
    <div className="flex flex-col justify-center items-center w-2/5 flex-shrink-0 border-r border-slate-700/50 px-4">
      <div className="text-8xl font-bold text-white leading-none tabular-nums tracking-tight">
        {time}
      </div>
      <div className="text-2xl text-slate-300 mt-3 font-medium">{day}</div>
      <div className="text-xl text-slate-400 mt-1">{date}</div>
    </div>
  )
}

// ─── Status Card ─────────────────────────────────────────────────────────────

function StatusCard({ location }: { location: 'home' | 'dublin' | null }) {
  if (!location) {
    return (
      <div className="flex-1 rounded-2xl bg-slate-700 flex flex-col justify-center px-6 py-4 shadow-lg min-h-0">
        <div className="text-3xl font-bold text-white/40">Loading…</div>
      </div>
    )
  }

  const isHome = location === 'home'
  return (
    <div
      className={`flex-1 rounded-2xl flex flex-col justify-center px-6 py-4 shadow-lg min-h-0 ${
        isHome ? 'bg-green-800' : 'bg-amber-800'
      }`}
    >
      <div className="text-3xl font-bold text-white leading-tight">
        {isHome ? '🏠 Barry is at HOME today' : '🏙️ Barry is in DUBLIN today'}
      </div>
      <div className="text-xl text-white/80 mt-2 leading-snug">
        {isHome
          ? 'You can go for coffee or mass'
          : "Can't go to Drogheda today"}
      </div>
    </div>
  )
}

// ─── Reminder Card ───────────────────────────────────────────────────────────

function ReminderCard({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="flex-1 rounded-2xl bg-blue-900 flex items-center px-6 py-4 shadow-lg min-h-0">
      <span className="text-2xl text-white leading-snug">💬 {message}</span>
    </div>
  )
}

// ─── Carer Note ──────────────────────────────────────────────────────────────

function CarerNoteCard({ note }: { note: string | null }) {
  if (!note) return null
  return (
    <div className="rounded-xl bg-purple-900 px-4 py-3 flex-shrink-0 shadow-md">
      <span className="text-base text-purple-300 font-semibold">📋 Carer: </span>
      <span className="text-base text-purple-100">{note}</span>
    </div>
  )
}

// ─── Call Barry ──────────────────────────────────────────────────────────────

function CallBarryButton() {
  const [callState, setCallState] = useState<CallState>('idle')

  const handleCall = async () => {
    if (callState === 'loading' || callState === 'success') return
    setCallState('loading')
    try {
      const res = await fetch('/api/call-barry', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setCallState('success')
        setTimeout(() => setCallState('idle'), 120 * 1000)
      } else {
        setCallState('error')
      }
    } catch {
      setCallState('error')
    }
  }

  const configs: Record<CallState, { label: string; className: string; disabled: boolean }> = {
    idle: {
      label: '📞  Call Barry',
      className: 'bg-green-500 hover:bg-green-400 active:bg-green-600',
      disabled: false,
    },
    loading: {
      label: 'Calling…',
      className: 'bg-green-400 opacity-80 cursor-wait',
      disabled: true,
    },
    success: {
      label: "✅  Message sent — Barry's on his way",
      className: 'bg-green-700 cursor-default',
      disabled: true,
    },
    error: {
      label: '⚠️  Something went wrong — try again',
      className: 'bg-red-500 hover:bg-red-400 active:bg-red-600',
      disabled: false,
    },
  }

  const { label, className, disabled } = configs[callState]

  return (
    <button
      onClick={handleCall}
      disabled={disabled}
      className={`mx-4 mb-2 py-5 rounded-2xl text-white text-2xl font-bold flex-shrink-0 flex items-center justify-center gap-3 shadow-xl transition-colors select-none ${className}`}
    >
      {label}
    </button>
  )
}

// ─── Music Row ───────────────────────────────────────────────────────────────

function MusicRow() {
  const [activeSrc, setActiveSrc] = useState<string | null>(null)

  const handleArtist = (src: string) => {
    setActiveSrc(prev => (prev === src ? null : src))
  }

  return (
    <>
      {/* Floating overlay player when music is active */}
      {activeSrc && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-8 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              <iframe
                key={activeSrc}
                src={activeSrc}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Music Player"
              />
            </div>
            <button
              onClick={() => setActiveSrc(null)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-4 transition-colors select-none"
            >
              ⏹ Stop Music
            </button>
          </div>
        </div>
      )}

      {/* Bottom music button row */}
      <div className="flex flex-row gap-3 px-4 pb-3 flex-shrink-0">
        {MUSIC_ARTISTS.map(({ emoji, label, src }) => (
          <button
            key={label}
            onClick={() => handleArtist(src)}
            className={`flex-1 py-3 rounded-xl text-white text-base font-semibold transition-colors select-none flex items-center justify-center gap-2 shadow ${
              activeSrc === src
                ? 'bg-amber-700 hover:bg-amber-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TabletPage() {
  const { time, day, date, hour } = useIrishTime()
  const weather = useWeather()

  const [latestReminder, setLatestReminder] = useState<string | null>(null)
  const [status, setStatus] = useState<'home' | 'dublin' | null>(null)
  const [carerNote, setCarerNote] = useState<string | null>(null)

  useEffect(() => {
    async function loadInitial() {
      const [{ data: reminders }, { data: statusData }, { data: carerData }] = await Promise.all([
        supabase
          .from('reminders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1),
        supabase.from('barry_status').select('*').eq('id', 1).single(),
        supabase.from('carer_note').select('*').eq('id', 1).single(),
      ])

      if (reminders && reminders.length > 0) {
        setLatestReminder((reminders[0] as Reminder).message)
      }
      if (statusData) {
        setStatus((statusData as BarryStatus).location)
      }
      if (carerData && (carerData as CarerNote).note) {
        setCarerNote((carerData as CarerNote).note)
      }
    }

    loadInitial()

    const reminderChannel = supabase
      .channel('reminders-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reminders' },
        (payload) => setLatestReminder((payload.new as Reminder).message)
      )
      .subscribe()

    const statusChannel = supabase
      .channel('status-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'barry_status' },
        (payload) => setStatus((payload.new as BarryStatus).location)
      )
      .subscribe()

    const carerChannel = supabase
      .channel('carer-note-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'carer_note' },
        (payload) => setCarerNote((payload.new as CarerNote).note || null)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(reminderChannel)
      supabase.removeChannel(statusChannel)
      supabase.removeChannel(carerChannel)
    }
  }, [])

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-slate-900 relative">

      {/* ── Top Bar ── */}
      <TopBar hour={hour} weather={weather} />

      {/* ── Main Content Area ── */}
      <div className="flex flex-row flex-1 gap-4 px-4 pt-3 min-h-0">

        {/* Left: Big Clock */}
        <ClockColumn time={time} day={day} date={date} />

        {/* Right: Cards */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 pb-3">
          <StatusCard location={status} />
          <ReminderCard message={latestReminder} />
          <CarerNoteCard note={carerNote} />
        </div>

      </div>

      {/* ── Call Barry ── */}
      <CallBarryButton />

      {/* ── Music Row (+ overlay player) ── */}
      <MusicRow />

    </main>
  )
}
