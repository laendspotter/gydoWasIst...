'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { glass, glassSubtle, pageWrap } from '../../../lib/styles'

const STUNDEN_PRO_TAG = 6
const TAGE_PRO_WOCHE  = 5
const MINUTEN_PRO_STD = 45

export default function Tracker() {
  const router = useRouter()
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [now, setNow] = useState(new Date())
  const [schoolYearStart, setSchoolYearStart] = useState(null)
  const [schoolYearEnd, setSchoolYearEnd] = useState(null)
  // fallback: manuell wählbar
  const [startYear, setStartYear] = useState(2018)
  const [useUntis, setUseUntis] = useState(false)

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u) { router.push('/'); return }
    setUsername(u)

    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, otp })
    }).then(r => r.json()).then(d => {
      if (d.schoolYearStart && d.schoolYearEnd) {
        setSchoolYearStart(new Date(d.schoolYearStart))
        setSchoolYearEnd(new Date(d.schoolYearEnd))
        setUseUntis(true)
      }
    }).catch(() => {})

    const tick = setInterval(() => { setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })); setNow(new Date()) }, 1000)
    return () => clearInterval(tick)
  }, [])

  // schuljahr berechnen
  const schulbeginnGymnasium = new Date(`${startYear}-09-01`) // klasse 5 start
  const schulendeGymnasium   = new Date(`${startYear + 9}-07-31`)  // nach klasse 13

  // wenn untis daten hat: aktuelles schuljahr
  const currentYearStart = useUntis ? schoolYearStart : schulbeginnGymnasium
  const currentYearEnd   = useUntis ? schoolYearEnd   : schulendeGymnasium

  // vergangene schulzeit (gesamtes gymnasium, ca seit klasse 5)
  const msVerstrichen = now - schulbeginnGymnasium
  const tageVerstrichen = Math.max(0, Math.floor(msVerstrichen / (1000 * 60 * 60 * 24)))
  const wochenVerstrichenRaw = tageVerstrichen / 7
  const schulwochenBisher = wochenVerstrichenRaw * (TAGE_PRO_WOCHE / 7) * 0.82 // ~82% echte schulwochen
  const stundenBisher = Math.floor(schulwochenBisher * TAGE_PRO_WOCHE * STUNDEN_PRO_TAG)
  const minutenBisher = stundenBisher * MINUTEN_PRO_STD

  // verbleibend
  const msLeft = schulendeGymnasium - now
  const tageLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)))
  const schulwochenLeft = Math.floor(tageLeft / 7) * 0.82
  const stundenLeft = Math.floor(schulwochenLeft * TAGE_PRO_WOCHE * STUNDEN_PRO_TAG)

  // aktuelles schuljahr (aus untis oder manuell)
  const msCurrentYear = currentYearEnd ? currentYearEnd - currentYearStart : 0
  const msDoneCurrentYear = currentYearStart ? now - currentYearStart : 0
  const currentYearPct = Math.min(100, Math.max(0, (msDoneCurrentYear / msCurrentYear) * 100))

  // gesamt prozent
  const gesamtPct = Math.min(100, Math.round((stundenBisher / (stundenBisher + stundenLeft)) * 100))

  const fmt = n => Math.round(n).toLocaleString('de-DE')

  const statCard = (label, value, sub, color = '#1a0e02') => (
    <div style={{ ...glass, padding: '1.75rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.6rem', color: 'rgba(80,50,15,0.5)', letterSpacing: '0.18em', marginBottom: '0.65rem', fontFamily: 'IBM Plex Mono, monospace' }}>{label}</div>
      <div style={{ fontSize: '2.2rem', fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'IBM Plex Mono, monospace' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'rgba(80,50,15,0.5)', marginTop: '0.45rem', fontFamily: 'IBM Plex Mono, monospace' }}>{sub}</div>}
    </div>
  )

  const ProgressBar = ({ pct, color = '#c05a00', label, labelRight }) => (
    <div style={{ marginBottom: '0.35rem' }}>
      {(label || labelRight) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'rgba(80,50,15,0.5)', marginBottom: '0.45rem', fontFamily: 'IBM Plex Mono, monospace' }}>
          <span>{label}</span><span style={{ color }}>{Math.round(pct)}% DURCH</span>
        </div>
      )}
      <div style={{ height: '10px', background: 'rgba(200,155,80,0.2)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(200,155,80,0.25)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: '999px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <DashNav username={username} clock={clock} />
      <div style={pageWrap}>
        <div style={{ marginBottom: '0.4rem', fontSize: '1.9rem', fontWeight: 700, color: '#1a0e02', fontFamily: 'IBM Plex Mono, monospace' }}>Schulstunden-Tracker</div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(60,35,10,0.5)', marginBottom: '1.75rem', fontFamily: 'IBM Plex Mono, monospace' }}>
          wie viel lebenszeit du schon in der schule verbracht hast. deprimierend, aber wahr.
          {useUntis && <span style={{ color: '#16a34a', marginLeft: '0.5rem' }}>✓ schuljahres-daten aus webuntis</span>}
        </div>

        {/* einschulung wählen */}
        <div style={{ ...glassSubtle, padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.68rem', color: 'rgba(80,50,15,0.6)', letterSpacing: '0.1em', fontFamily: 'IBM Plex Mono, monospace' }}>EINSCHULUNG KLASSE 5:</span>
          {[2016, 2017, 2018, 2019, 2020, 2021].map(y => (
            <button key={y} onClick={() => setStartYear(y)} style={{
              padding: '0.35rem 0.75rem',
              background: startYear === y ? 'linear-gradient(135deg,#b84d00,#e07828)' : 'rgba(255,245,215,0.55)',
              border: `1px solid ${startYear === y ? 'transparent' : 'rgba(190,140,60,0.3)'}`,
              color: startYear === y ? '#fff' : 'rgba(80,50,15,0.65)',
              fontSize: '0.72rem', cursor: 'pointer', borderRadius: '6px', fontFamily: 'IBM Plex Mono, monospace',
            }}>{y}</button>
          ))}
        </div>

        {/* main stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {statCard('SCHULSTUNDEN BISHER', fmt(stundenBisher), `= ${fmt(minutenBisher)} Minuten`, '#c05a00')}
          {statCard('NOCH VOR DIR', fmt(stundenLeft), `≈ ${Math.floor(schulwochenLeft)} Schulwochen`, '#ca8a04')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {statCard('SCHULTAGE BISHER', fmt(Math.floor(schulwochenBisher * TAGE_PRO_WOCHE)))}
          {statCard('HEUTE NOCH', `${STUNDEN_PRO_TAG}h`, `${STUNDEN_PRO_TAG * MINUTEN_PRO_STD} Minuten`, '#16a34a')}
          {statCard('KLASSE', startYear ? `${Math.min(13, Math.max(5, Math.floor((now - new Date(`${startYear}-09-01`)) / (1000 * 60 * 60 * 24 * 365)) + 5))}` : '?', `Gymnasium BW · Abitur ${startYear + 9}`)}
        </div>

        {/* progress bars */}
        <div style={{ ...glass, padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <ProgressBar pct={gesamtPct} color="#c05a00" label="GYMNASIUM GESAMT (KL. 5 → ABITUR)" labelRight />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'rgba(80,50,15,0.4)', marginTop: '0.35rem', fontFamily: 'IBM Plex Mono, monospace' }}>
              <span>Klasse 5 ({startYear})</span><span>Abitur ({startYear + 9})</span>
            </div>
          </div>

          {useUntis && currentYearStart && currentYearEnd && (
            <div>
              <ProgressBar pct={currentYearPct} color="#16a34a" label="AKTUELLES SCHULJAHR (aus WebUntis)" labelRight />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'rgba(80,50,15,0.4)', marginTop: '0.35rem', fontFamily: 'IBM Plex Mono, monospace' }}>
                <span>{currentYearStart.toLocaleDateString('de-DE')}</span>
                <span>{currentYearEnd.toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.25rem', fontSize: '0.68rem', color: 'rgba(80,50,15,0.4)', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace' }}>
          ~{STUNDEN_PRO_TAG} Std/Tag · {TAGE_PRO_WOCHE} Tage/Woche · ~82% echte Schulwochen (ohne Ferien) · Gymnasium BW
        </div>
      </div>
    </div>
  )
}
