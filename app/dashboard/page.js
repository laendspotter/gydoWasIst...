'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../components/DashNav'
import { parseUntisDate, parseUntisTime, isCancelled, isSubstitution, isToday, dayLabel } from '../../lib/untis'

const G = {
  background: 'rgba(255,250,235,0.78)',
  border: '1px solid rgba(220,175,100,0.45)',
  borderRadius: '14px',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  boxShadow: '0 4px 24px rgba(120,60,10,0.1)',
}
const mono = { fontFamily: 'IBM Plex Mono, monospace' }

export default function Dashboard() {
  const router = useRouter()
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, otp })
    }).then(r => r.json()).then(d => {
      setTimetable(d.timetable || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  const days = [...new Set(timetable.map(l => l.date))].sort()
  const dayObjects = days.map(d => ({
    dateInt: d,
    date: parseUntisDate(d),
    lessons: timetable.filter(l => l.date === d).sort((a, b) => a.startTime - b.startTime)
  }))

  const now = new Date()
  const activeDayInt = selectedDay ?? (
    dayObjects.find(d => isToday(d.date))?.dateInt ??
    dayObjects.find(d => d.date >= now)?.dateInt ??
    dayObjects[0]?.dateInt
  )
  const activeDay = dayObjects.find(d => d.dateInt === activeDayInt)
  const allChanges = timetable
    .filter(l => isCancelled(l) || isSubstitution(l))
    .sort((a, b) => a.date - b.date || a.startTime - b.startTime)
    .slice(0, 10)

  const Badge = ({ text, bg, fg = '#fff' }) => (
    <span style={{ background: bg, color: fg, fontSize: '0.6rem', fontWeight: 700, padding: '0.18rem 0.45rem', letterSpacing: '0.08em', borderRadius: '4px', whiteSpace: 'nowrap', ...mono }}>
      {text}
    </span>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.62rem', color: 'rgba(80,50,15,0.5)', letterSpacing: '0.15em', marginBottom: '0.2rem', ...mono }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#1a0e02', ...mono }}>Übersicht</div>
        </div>

        {loading ? (
          <div style={{ color: 'rgba(80,50,15,0.5)', textAlign: 'center', padding: '4rem', animation: 'pulse 1.5s infinite', ...mono }}>LADE DATEN...</div>
        ) : (
          <>
            {/* day tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1.25rem' }}>
              {dayObjects.map(d => (
                <button key={d.dateInt} onClick={() => setSelectedDay(d.dateInt)} style={{
                  padding: '0.45rem 0.9rem',
                  background: d.dateInt === activeDayInt ? 'linear-gradient(135deg,#b84d00,#e07828)' : 'rgba(255,248,225,0.65)',
                  border: `1px solid ${d.dateInt === activeDayInt ? 'transparent' : 'rgba(200,155,80,0.3)'}`,
                  color: d.dateInt === activeDayInt ? '#fff' : 'rgba(70,42,12,0.65)',
                  fontSize: '0.68rem', cursor: 'pointer', whiteSpace: 'nowrap',
                  letterSpacing: '0.08em', borderRadius: '7px', ...mono,
                }}>{dayLabel(d.date)}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* stundenplan */}
              <div style={{ ...G, padding: '1.5rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(80,50,15,0.5)', marginBottom: '1.1rem', display: 'flex', justifyContent: 'space-between', ...mono }}>
                  <span>STUNDENPLAN</span>
                  <span style={{ color: '#c05a00' }}>{activeDay ? dayLabel(activeDay.date) : '—'}</span>
                </div>
                {!activeDay || activeDay.lessons.length === 0 ? (
                  <div style={{ color: 'rgba(80,50,15,0.45)', fontSize: '0.85rem', ...mono }}>Keine Stunden</div>
                ) : activeDay.lessons.map((l, i) => {
                  const cancelled = isCancelled(l)
                  const sub = !cancelled && isSubstitution(l)
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.6rem 0', borderBottom: '1px solid rgba(200,155,80,0.18)',
                      opacity: cancelled ? 0.45 : 1,
                    }}>
                      <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: '#c05a00', minWidth: '2.8rem', fontWeight: 600, ...mono }}>
                          {parseUntisTime(l.startTime)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, textDecoration: cancelled ? 'line-through' : 'none', color: '#1a0e02', ...mono }}>
                            {l.su?.[0]?.name || '—'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(70,42,12,0.55)', marginTop: '0.1rem', ...mono }}>
                            {l.te?.[0]?.name && l.te[0].name !== '---' ? l.te[0].name : '?'}
                            {l.ro?.[0]?.name && l.ro[0].name !== '---' ? ` · ${l.ro[0].name}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {cancelled && <Badge text="ENTFALL" bg="#c0392b" />}
                        {sub && <Badge text="VERTR." bg="#ca8a04" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* änderungen */}
              <div style={{ ...G, padding: '1.5rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(80,50,15,0.5)', marginBottom: '1.1rem', display: 'flex', justifyContent: 'space-between', ...mono }}>
                  <span>ÄNDERUNGEN & AUSFÄLLE</span><span>2 WOCHEN</span>
                </div>
                {allChanges.length === 0 ? (
                  <div style={{ color: '#16a34a', fontSize: '0.85rem', ...mono }}>Keine Änderungen ✓</div>
                ) : allChanges.map((l, i) => {
                  const date = parseUntisDate(l.date)
                  const cancelled = isCancelled(l)
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(200,155,80,0.18)' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a0e02', ...mono }}>
                          {l.su?.[0]?.name || '—'}
                          <span style={{ fontWeight: 400, color: 'rgba(70,42,12,0.55)', marginLeft: '0.45rem', fontSize: '0.68rem' }}>
                            {dayLabel(date)} · {parseUntisTime(l.startTime)}
                          </span>
                        </div>
                        {l.lstext && <div style={{ fontSize: '0.68rem', color: 'rgba(70,42,12,0.5)', marginTop: '0.12rem', ...mono }}>{l.lstext}</div>}
                      </div>
                      {cancelled ? <Badge text="ENTFALL" bg="#c0392b" /> : <Badge text="VERTR." bg="#ca8a04" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
