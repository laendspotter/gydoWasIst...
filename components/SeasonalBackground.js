'use client'
import { useEffect, useState } from 'react'

function getSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

// ── SUNSET (universal — läuft hinter allem) ──────────────────────────────
function SunsetBg() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="sunsetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0a0a14" />
          <stop offset="35%"  stopColor="#1a0a2e" />
          <stop offset="58%"  stopColor="#6b1a3a" />
          <stop offset="75%"  stopColor="#c0392b" />
          <stop offset="88%"  stopColor="#e8620a" />
          <stop offset="100%" stopColor="#ff9a2e" />
        </linearGradient>
        <linearGradient id="sunsetGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ff6b35" stopOpacity="0" />
          <stop offset="100%" stopColor="#ff9a2e" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0d0d0f" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#fff7e6" stopOpacity="1" />
          <stop offset="40%"  stopColor="#ffcc66" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ff9a2e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
        </radialGradient>
        <filter id="blur4">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="blur8">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <style>{`
          @keyframes sunPulse {
            0%,100% { transform: scale(1); opacity: 0.95; }
            50% { transform: scale(1.04); opacity: 1; }
          }
          @keyframes starTwinkle {
            0%,100% { opacity: 0.9; }
            50% { opacity: 0.2; }
          }
          @keyframes cloudDrift {
            0% { transform: translateX(0); }
            100% { transform: translateX(60px); }
          }
          @keyframes horizonGlow {
            0%,100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          @keyframes mountainFloat {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}</style>
      </defs>

      {/* sky gradient */}
      <rect width="1440" height="900" fill="url(#sunsetSky)" />

      {/* stars (nur oben, wo dunkel) */}
      {[
        [80,35],[160,18],[290,42],[420,15],[550,38],[680,12],[810,44],[940,20],[1060,36],[1180,8],[1320,28],[1400,50],
        [130,70],[350,65],[600,72],[870,60],[1100,68],[1380,75],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%3===0?1.8:1.2} fill="white">
          <animate attributeName="opacity" values="0.9;0.2;0.9"
            dur={`${1.5 + (i%5)*0.4}s`} begin={`${i*0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* halo riesig um sonne */}
      <ellipse cx="720" cy="620" rx="320" ry="180" fill="url(#sunHalo)" filter="url(#blur8)">
        <animate attributeName="rx" values="320;340;320" dur="5s" repeatCount="indefinite" />
      </ellipse>

      {/* sonne */}
      <g style={{ transformOrigin: '720px 620px', animation: 'sunPulse 5s ease-in-out infinite' }}>
        {/* outer glow */}
        <circle cx="720" cy="620" r="140" fill="url(#sunCore)" opacity="0.15" filter="url(#blur8)" />
        {/* mid glow */}
        <circle cx="720" cy="620" r="90" fill="#ff9a2e" opacity="0.25" filter="url(#blur4)" />
        {/* sun disc */}
        <circle cx="720" cy="620" r="55" fill="#fff7e6" opacity="0.98" />
        {/* inner ring */}
        <circle cx="720" cy="620" r="48" fill="#ffd166" />
        <circle cx="720" cy="620" r="38" fill="#ffcc44" />
      </g>

      {/* horizon glow streak */}
      <rect x="0" y="580" width="1440" height="120" fill="url(#horizon)" filter="url(#blur4)"
        style={{ animation: 'horizonGlow 5s ease-in-out infinite' }} />

      {/* horizon line — reflektiert auf wasser */}
      <rect x="0" y="700" width="1440" height="200" fill="#0d1520" />

      {/* wasser — reflection */}
      <rect x="0" y="700" width="1440" height="200" fill="#0d1520" />
      {/* sonnensäule im wasser */}
      <ellipse cx="720" cy="760" rx="60" ry="120" fill="#ff9a2e" opacity="0.18" filter="url(#blur8)" />
      <ellipse cx="720" cy="800" rx="30" ry="80" fill="#ffcc44" opacity="0.12" filter="url(#blur4)" />

      {/* wellen */}
      {[720, 740, 755, 768, 780, 792].map((y, i) => (
        <path key={i}
          d={`M${i*50} ${y} Q${180+i*30} ${y-6} ${360+i*20} ${y} Q${540+i*25} ${y+5} ${720} ${y} Q${900-i*25} ${y-5} ${1080-i*20} ${y} Q${1260-i*30} ${y+6} 1440 ${y}`}
          stroke={`rgba(255,154,46,${0.15 - i*0.02})`} strokeWidth={1.5-i*0.15} fill="none">
          <animate attributeName="d"
            values={`M${i*50} ${y} Q${180+i*30} ${y-6} ${360+i*20} ${y} Q${540+i*25} ${y+5} ${720} ${y} Q${900-i*25} ${y-5} ${1080-i*20} ${y} Q${1260-i*30} ${y+6} 1440 ${y};M${i*50} ${y+3} Q${180+i*30} ${y+3} ${360+i*20} ${y+3} Q${540+i*25} ${y+3} ${720} ${y+3} Q${900-i*25} ${y+3} ${1080-i*20} ${y+3} Q${1260-i*30} ${y+3} 1440 ${y+3};M${i*50} ${y} Q${180+i*30} ${y-6} ${360+i*20} ${y} Q${540+i*25} ${y+5} ${720} ${y} Q${900-i*25} ${y-5} ${1080-i*20} ${y} Q${1260-i*30} ${y+6} 1440 ${y}`}
            dur={`${3+i*0.5}s`} repeatCount="indefinite" />
        </path>
      ))}

      {/* berge / silhouetten — dunkel */}
      <g style={{ animation: 'mountainFloat 12s ease-in-out infinite' }}>
        {/* berg links groß */}
        <polygon points="0,700 180,420 380,700" fill="#080810" opacity="0.95" />
        {/* berg links klein */}
        <polygon points="120,700 280,500 440,700" fill="#0d0d18" opacity="0.9" />
        {/* berg mitte */}
        <polygon points="380,700 620,380 860,700" fill="#08080f" opacity="0.98" />
        {/* berg rechts klein */}
        <polygon points="780,700 980,480 1180,700" fill="#0d0d18" opacity="0.9" />
        {/* berg rechts groß */}
        <polygon points="1000,700 1220,440 1440,700" fill="#080810" opacity="0.95" />
      </g>

      {/* wolken — dunkel/silhouette vor sunset */}
      {[
        { cx: 220, cy: 180, rx: 90, ry: 28, delay: 0, dur: 35 },
        { cx: 650, cy: 140, rx: 120, ry: 35, delay: 5, dur: 48 },
        { cx: 1100, cy: 200, rx: 100, ry: 30, delay: 12, dur: 42 },
        { cx: 400, cy: 260, rx: 70, ry: 22, delay: 8, dur: 38 },
        { cx: 900, cy: 280, rx: 85, ry: 26, delay: 3, dur: 50 },
      ].map((c, i) => (
        <g key={i} style={{ animation: `cloudDrift ${c.dur}s ${c.delay}s ease-in-out infinite alternate` }}>
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="#1a0a2e" opacity="0.75" />
          <ellipse cx={c.cx-25} cy={c.cy+6} rx={c.rx*0.55} ry={c.ry*0.8} fill="#1a0a2e" opacity="0.65" />
          <ellipse cx={c.cx+20} cy={c.cy+4} rx={c.rx*0.5} ry={c.ry*0.75} fill="#1a0a2e" opacity="0.6" />
          {/* cloud edge glow vom sunset */}
          <ellipse cx={c.cx} cy={c.cy-c.ry*0.5} rx={c.rx*0.9} ry={5} fill="#c0392b" opacity="0.3" filter="url(#blur4)" />
        </g>
      ))}

      {/* vignette oben */}
      <defs>
        <radialGradient id="vignette" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#0a0a14" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a0a14" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <rect width="1440" height="400" fill="url(#vignette)" />
    </svg>
  )
}

// ── EXPORT ───────────────────────────────────────────────────────────────────
export default function SeasonalBackground() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  // sunset überall — unabhängig von jahreszeit
  return <SunsetBg />
}
