'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../components/DashNav'
import { parseUntisDate, parseUntisTime, isCancelled, isSubstitution, isToday, isTomorrow, dayLabel, formatDate } from '../../lib/untis'

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
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    }).then(r => r.json()).then(d => {
      setTimetable(d.timetable || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
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
    .slice(0, 8)

  const badge = (text, bg, fg = '#fff') => (
    <span style={{
      background: bg, color: fg,
      fontSize: '0.65rem', fontWeight: 700,
      padding: '0.2rem 0.5rem',
      letterSpacing: '0.08em',
      whiteSpace: 'nowrap',
    }}>{text}</span>
  )

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.75rem' }
  const cardTitle = { fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }
  const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* date header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>Übersicht</div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '4rem 0', textAlign: 'center', letterSpacing: '0.15em' }}>
            LADE DATEN...
          </div>
        ) : (
          <>
            {/* day tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
              {dayObjects.map(d => (
                <button key={d.dateInt}
                  onClick={() => setSelectedDay(d.dateInt)}
                  style={{
                    padding: '0.6rem 1.1rem',
                    background: d.dateInt === activeDayInt ? 'var(--red)' : 'var(--surface)',
                    border: `1px solid ${d.dateInt === activeDayInt ? 'var(--red)' : 'var(--border)'}`,
                    color: d.dateInt === activeDayInt ? '#fff' : 'var(--muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.08em',
                    transition: 'all 0.15s',
                  }}
                >
                  {dayLabel(d.date)}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* stundenplan */}
              <div style={card}>
                <div style={cardTitle}>
                  <span>STUNDENPLAN</span>
                  <span>{activeDay ? dayLabel(activeDay.date) : '—'}</span>
                </div>
                {!activeDay || activeDay.lessons.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Keine Stunden</div>
                ) : activeDay.lessons.map((l, i) => {
                  const cancelled = isCancelled(l)
                  const sub = !cancelled && isSubstitution(l)
                  return (
                    <div key={i} style={{ ...row, opacity: cancelled ? 0.4 : 1 }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', minWidth: '3.5rem', fontWeight: 500 }}>
                          {parseUntisTime(l.startTime)}
                        </div>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, textDecoration: cancelled ? 'line-through' : 'none' }}>
                            {l.su?.[0]?.name || '—'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                            {l.te?.[0]?.name && l.te[0].name !== '---' ? l.te[0].name : '?'}
                            {l.ro?.[0]?.name && l.ro[0].name !== '---' ? ` · ${l.ro[0].name}` : ''}
                            {l.lstext ? ` · ${l.lstext}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {cancelled && badge('ENTFALL', 'var(--red)')}
                        {sub && badge('VERTR.', 'var(--yellow)', '#000')}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* änderungen */}
              <div style={card}>
                <div style={cardTitle}>
                  <span>ÄNDERUNGEN & AUSFÄLLE</span>
                  <span>2 WOCHEN</span>
                </div>
                {allChanges.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Keine Änderungen 🎉</div>
                ) : allChanges.map((l, i) => {
                  const date = parseUntisDate(l.date)
                  const cancelled = isCancelled(l)
                  return (
                    <div key={i} style={row}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                          {l.su?.[0]?.name || '—'}
                          <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: '0.6rem', fontSize: '0.75rem' }}>
                            {dayLabel(date)} · {parseUntisTime(l.startTime)}
                          </span>
                        </div>
                        {l.lstext && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{l.lstext}</div>}
                      </div>
                      {cancelled
                        ? badge('ENTFALL', 'var(--red)')
                        : badge('VERTR.', 'var(--yellow)', '#000')
                      }
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
