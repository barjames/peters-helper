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

function getGreeting(hour: number): { text: string; className: string } {
  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning, Peter! ☀️', className: 'text-amber-600' }
  } else if (hour >= 12 && hour < 18) {
    return { text: 'Good afternoon, Peter! 😊', className: 'text-orange-500' }
  } else if (hour >= 18 && hour < 22) {
    return { text: 'Good evening, Peter! 🌙', className: 'text-blue-600' }
  } else {
    return { text: 'Good night, Peter! 🌙', className: 'text-indigo-700' }
  }
}

function Greeting() {
  const [greeting, setGreeting] = useState<{ text: string; className: string } | null>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const hour = parseInt(
        now.toLocaleString('en-IE', { hour: 'numeric', hour12: false, timeZone: 'Europe/Dublin' }),
        10
      )
      setGreeting(getGreeting(hour))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!greeting) return null

  return (
    <div className={`text-2xl font-bold leading-tight ${greeting.className}`}>
      {greeting.text}
    </div>
  )
}

function Clock() {
  const [time, setTime] = useState('')
  const [dayDate, setDayDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const opts = { timeZone: 'Europe/Dublin' } as const
      const day = now.toLocaleDateString('en-IE', { ...opts, weekday: 'long' })
      const date = now.toLocaleDateString('en-IE', { ...opts, day: 'numeric', month: 'long', year: 'numeric' })
      const t = now.toLocaleTimeString('en-IE', { ...opts, hour: '2-digit', minute: '2-digit' })
      setDayDate(`${day}, ${date}`)
      setTime(t)
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center flex-shrink-0 leading-none">
      <div className="text-6xl font-bold text-gray-800 tracking-tight">{time}</div>
      <div className="text-xl font-semibold text-gray-600 mt-1">{dayDate}</div>
    </div>
  )
}

type WeatherData = {
  ok: true
  emoji: string
  temp: string
  feelsLike: string
  description: string
} | { ok: false }

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/weather')
        const data = await res.json()
        setWeather(data)
      } catch {
        // fail silently
      }
    }
    load()
    const interval = setInterval(load, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (!weather || !weather.ok) return null

  return (
    <div className="text-base text-blue-700">
      {weather.emoji} {weather.description} · {weather.temp}°C (feels like {weather.feelsLike}°C)
    </div>
  )
}

function StatusBanner({ location }: { location: 'home' | 'dublin' | null }) {
  if (!location) return null

  const isHome = location === 'home'

  return (
    <div
      className={`flex-shrink-0 w-full rounded-xl px-4 py-2 text-center shadow-sm ${
        isHome
          ? 'bg-green-100 border-2 border-green-400'
          : 'bg-amber-100 border-2 border-amber-400'
      }`}
    >
      <div className={`text-xl font-bold ${isHome ? 'text-green-800' : 'text-amber-800'}`}>
        {isHome ? '🏠 Barry is at HOME today — You can go for coffee or mass' : '🏙️ Barry is in DUBLIN today — Can\'t go to Drogheda today'}
      </div>
    </div>
  )
}

function ReminderBox({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="flex-shrink-0 w-full rounded-lg bg-blue-50 border border-blue-300 px-3 py-2 shadow-sm">
      <span className="text-base text-blue-900">💬 {message}</span>
    </div>
  )
}

function CarerNoteBox({ note }: { note: string | null }) {
  if (!note) return null

  return (
    <div className="flex-shrink-0 w-full rounded-lg bg-purple-50 px-3 py-1">
      <span className="text-sm text-purple-700 font-medium">📋 Carer:</span>{' '}
      <span className="text-sm text-purple-900">{note}</span>
    </div>
  )
}

function MusicSection() {
  const [activeSrc, setActiveSrc] = useState<string | null>(null)

  const handleArtist = (src: string) => {
    setActiveSrc(prev => prev === src ? prev : src)
  }

  const handleStop = () => {
    setActiveSrc(null)
  }

  return (
    <div className="flex-shrink-0 w-full rounded-xl bg-yellow-50 border-2 border-yellow-300 px-3 py-2 shadow-sm">
      <div className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-2">
        🎵 Music
      </div>
      <div className="flex flex-row gap-2">
        {MUSIC_ARTISTS.map(({ emoji, label, src }) => (
          <button
            key={label}
            onClick={() => handleArtist(src)}
            className={`flex-1 flex items-center justify-center gap-2 border-2 border-yellow-400 rounded-xl px-3 py-3 text-base font-bold text-yellow-900 shadow transition-colors select-none ${
              activeSrc === src
                ? 'bg-yellow-300 active:bg-yellow-400'
                : 'bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300'
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Inline YouTube player — shown below buttons when active */}
      {activeSrc && (
        <div className="mt-2">
          <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: '56.25%' }}>
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
            onClick={handleStop}
            className="mt-2 w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-2xl px-6 py-3 text-xl shadow transition-colors select-none"
          >
            ⏹ Stop Music
          </button>
        </div>
      )}
    </div>
  )
}

type CallState = 'idle' | 'loading' | 'success' | 'error'

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

  const buttonConfig = {
    idle: {
      label: '📞 Call Barry',
      className: 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white',
      disabled: false,
    },
    loading: {
      label: 'Calling…',
      className: 'bg-green-400 text-white opacity-80 cursor-wait',
      disabled: true,
    },
    success: {
      label: '✅ Message sent to Barry — he\'s on the way',
      className: 'bg-green-300 text-green-900 cursor-default',
      disabled: true,
    },
    error: {
      label: '⚠️ Something went wrong — try again',
      className: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
      disabled: false,
    },
  }

  const { label, className, disabled } = buttonConfig[callState]

  return (
    <button
      onClick={handleCall}
      disabled={disabled}
      className={`flex-shrink-0 w-full font-bold rounded-2xl shadow-lg flex items-center justify-center px-6 py-3 text-xl transition-colors select-none ${className}`}
    >
      {label}
    </button>
  )
}

export default function TabletPage() {
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
        (payload) => {
          setLatestReminder((payload.new as Reminder).message)
        }
      )
      .subscribe()

    const statusChannel = supabase
      .channel('status-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'barry_status' },
        (payload) => {
          setStatus((payload.new as BarryStatus).location)
        }
      )
      .subscribe()

    const carerChannel = supabase
      .channel('carer-note-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'carer_note' },
        (payload) => {
          setCarerNote((payload.new as CarerNote).note || null)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(reminderChannel)
      supabase.removeChannel(statusChannel)
      supabase.removeChannel(carerChannel)
    }
  }, [])

  return (
    <main className="h-screen overflow-hidden flex flex-col bg-gray-50 p-3 gap-2">

      {/* Row 1: Greeting + Weather — compact, one line each */}
      <div className="text-center flex-shrink-0 flex flex-col items-center gap-0.5">
        <Greeting />
        <WeatherWidget />
      </div>

      {/* Row 2: Clock — large but not huge */}
      <Clock />

      {/* Row 3: Status banner — compact */}
      <StatusBanner location={status} />

      {/* Row 4: Carer note — single line, only if content exists */}
      <CarerNoteBox note={carerNote} />

      {/* Row 5: Reminder — compact */}
      <ReminderBox message={latestReminder} />

      {/* Spacer — pushes Call Barry + Music to bottom */}
      <div className="flex-1" />

      {/* Row 7: Call Barry button */}
      <CallBarryButton />

      {/* Row 8: Music — compact with inline player */}
      <MusicSection />

    </main>
  )
}
