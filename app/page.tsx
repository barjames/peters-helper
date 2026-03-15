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
    <div className={`text-center text-5xl font-bold mb-4 leading-tight ${greeting.className}`}>
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
    <div className="text-center mb-8 leading-none">
      <div className="text-8xl font-bold text-gray-800 tracking-tight">{time}</div>
      <div className="text-4xl font-semibold text-gray-600 mt-3">{dayDate}</div>
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
    <div className="w-full max-w-xl rounded-2xl bg-blue-50 border-2 border-blue-200 px-6 py-4 mb-6 shadow-sm text-center">
      <div className="text-3xl font-semibold text-blue-800">
        {weather.emoji} {weather.description} · {weather.temp}°C{' '}
        <span className="text-2xl font-normal text-blue-600">(feels like {weather.feelsLike}°C)</span>
      </div>
    </div>
  )
}

function StatusBanner({ location }: { location: 'home' | 'dublin' | null }) {
  if (!location) return null

  const isHome = location === 'home'

  return (
    <div
      className={`w-full rounded-2xl px-8 py-6 mb-8 text-center shadow-md ${
        isHome
          ? 'bg-green-100 border-4 border-green-400'
          : 'bg-amber-100 border-4 border-amber-400'
      }`}
    >
      <div className={`text-5xl font-bold mb-2 ${isHome ? 'text-green-800' : 'text-amber-800'}`}>
        {isHome ? '🏠 Barry is at HOME today' : '🏙️ Barry is in DUBLIN today'}
      </div>
      <div className={`text-3xl ${isHome ? 'text-green-700' : 'text-amber-700'}`}>
        {isHome
          ? 'You can go for coffee or mass today'
          : "Can't go to Drogheda today"}
      </div>
    </div>
  )
}

function ReminderBox({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <div className="w-full rounded-2xl bg-blue-50 border-4 border-blue-300 px-8 py-6 mb-8 shadow-md">
      <div className="text-2xl font-semibold text-blue-600 mb-2 uppercase tracking-wide">
        📝 Message from Barry
      </div>
      <div className="text-4xl text-blue-900 leading-snug">{message}</div>
    </div>
  )
}

function CarerNoteBox({ note }: { note: string | null }) {
  if (!note) return null

  return (
    <div className="w-full rounded-2xl bg-purple-50 border-4 border-purple-400 px-8 py-6 mb-8 shadow-md">
      <div className="text-2xl font-semibold text-purple-600 mb-2 uppercase tracking-wide">
        📋 Note for Carer
      </div>
      <div className="text-3xl text-purple-900 leading-snug whitespace-pre-wrap">{note}</div>
    </div>
  )
}

function MusicSection() {
  const [activeSrc, setActiveSrc] = useState<string | null>(null)

  const handleArtist = (src: string) => {
    setActiveSrc(src)
  }

  const handleStop = () => {
    setActiveSrc(null)
  }

  return (
    <div className="w-full rounded-2xl bg-yellow-50 border-4 border-yellow-300 px-8 py-6 mb-8 shadow-md">
      <div className="text-2xl font-semibold text-yellow-700 mb-4 uppercase tracking-wide">
        🎵 Music
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {MUSIC_ARTISTS.map(({ emoji, label, src }) => (
          <button
            key={label}
            onClick={() => handleArtist(src)}
            className={`flex-1 flex items-center justify-center gap-3 border-2 border-yellow-400 rounded-2xl px-6 py-5 text-3xl font-bold text-yellow-900 shadow transition-colors select-none ${
              activeSrc === src
                ? 'bg-yellow-300 active:bg-yellow-400'
                : 'bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300'
            }`}
            style={{ minHeight: '80px' }}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {activeSrc && (
        <>
          <div className="w-full relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              key={activeSrc}
              src={activeSrc}
              className="absolute inset-0 w-full h-full rounded-xl"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Music Player"
            />
          </div>
          <button
            onClick={handleStop}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-2xl px-6 py-5 text-3xl shadow transition-colors select-none"
            style={{ minHeight: '80px' }}
          >
            ⏹ Stop
          </button>
        </>
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
    <>
      <button
        onClick={handleCall}
        disabled={disabled}
        className={`mt-4 w-full max-w-xl font-bold rounded-3xl shadow-lg flex items-center justify-center px-8 py-8 text-4xl transition-colors select-none ${className}`}
        style={{ minHeight: '120px' }}
      >
        {label}
      </button>
      <p className="mt-6 text-xl text-gray-400 text-center">
        Tap the button to send Barry a message
      </p>
    </>
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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-6 py-10">
      {/* Greeting */}
      <Greeting />

      {/* Weather */}
      <WeatherWidget />

      {/* Clock */}
      <Clock />

      {/* Status Banner */}
      <StatusBanner location={status} />

      {/* Carer Note */}
      <CarerNoteBox note={carerNote} />

      {/* Reminder */}
      <ReminderBox message={latestReminder} />

      {/* Music */}
      <MusicSection />

      {/* Call Button */}
      <CallBarryButton />
    </main>
  )
}
