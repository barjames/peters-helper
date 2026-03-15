import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://wttr.in/Drogheda,Ireland?format=j1', {
      next: { revalidate: 1800 } // cache 30 mins
    })
    const data = await res.json()
    const current = data.current_condition[0]
    const tempC = current.temp_C
    const desc = current.weatherDesc[0].value
    const feelsLike = current.FeelsLikeC

    // Map description to friendly emoji + text
    const descLower = desc.toLowerCase()
    let emoji = '🌤️'
    let friendly = desc
    if (descLower.includes('rain') || descLower.includes('drizzle')) { emoji = '🌧️'; friendly = 'Rainy' }
    else if (descLower.includes('snow')) { emoji = '❄️'; friendly = 'Snowy' }
    else if (descLower.includes('thunder')) { emoji = '⛈️'; friendly = 'Thundery' }
    else if (descLower.includes('overcast') || descLower.includes('cloudy')) { emoji = '☁️'; friendly = 'Cloudy' }
    else if (descLower.includes('fog') || descLower.includes('mist')) { emoji = '🌫️'; friendly = 'Misty' }
    else if (descLower.includes('sunny') || descLower.includes('clear')) { emoji = '☀️'; friendly = 'Sunny' }
    else if (descLower.includes('partly')) { emoji = '⛅'; friendly = 'Partly cloudy' }

    return NextResponse.json({ 
      ok: true, 
      emoji, 
      temp: tempC, 
      feelsLike,
      description: friendly 
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
