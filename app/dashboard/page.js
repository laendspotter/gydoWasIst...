'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function parseUntisDate(d) {
  const s = String(d)
  return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`)
}

function parseUntisTime(t) {
  const s = String(t).padStart(4, '0')
  return `${s.slice(0,2)}:${s.slice(2,4)}`
}

function formatDate(d) {
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function isDateToday(d) {
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isDateTomorrow(d) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return d.toDateString() === tomorrow.toDateString()
}

function isCancelled(lesson) {
  return lesson.code === 'cancelled'
}

function isSubstitution(lesson) {
  return lesson.code === 'irregular' || (lesson.lstext && lesson.lstext.length > 0)
}

function hasRoomChange(lesson) {
  return lesson.ro?.[0]?.id === 0 && lesson.ro?.[0]?.orgid
}

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

    async function load() {
      try {
        const res = await fetch('/api/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        })
        const data = await res.json()
        setTimetable(data.timetable || [])
      } catch {}
      setLoading(false)
    }
    load()

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
    dayObjects.find(d => isDateToday(d.date))?.dateInt ??
    dayObjects.find(d => d.date >= now)?.dateInt ??
    dayObjects[0]?.dateInt
  )
  const activeDay = dayObjects.find(d => d.dateInt === activeDayInt)

  const allChanges = timetable
    .filter(l => isCancelled(l) || isSubstitution(l) || hasRoomChange(l))
    .sort((a, b) => a.date - b.date || a.startTime - b.startTime)

  const s = {
    page: { minHeight: '100vh', background: 'var(--dark)', padding: '1.25rem', fontFamily: "'IBM Plex Mono', monospace" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' },
    clock: { fontSize: '2rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.05em', lineHeight: 1 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    card: { background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem' },
    cardTitle: { fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--muted)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid var(--border)' },
    badge: (bg, fg = '#000') => ({ background: bg, color: fg, fontSize: '0.55rem', fontWeight: 700, padding: '0.15rem 0.4rem', letterSpacing: '0.1em', whiteSpace: 'nowrap' }),
    dayTab: (active) => ({
      padding: '0.4rem 0.75rem',
      background: active ? 'var(--red)' : 'var(--surface2)',
      border: `1px solid ${active ? 'var(--red)' : 'var(--border)'}`,
      color: active ? '#fff' : 'var(--muted)',
      fontSize: '0.65rem',
      cursor: 'pointer',
      fontFamily: 'IBM Plex Mono, monospace',
      whiteSpace: 'nowrap'
    }),
    logout: { background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.35rem 0.6rem', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.65rem', cursor: 'pointer' }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--muted)', marginBottom: '0.2rem' }}>GYDO // SCHULBOARD</div>
          <div style={s.clock}>{clock || '--:--:--'}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>{username}</div>
          <button style={s.logout} onClick={() => { sessionStorage.clear(); router.push('/') }}>LOGOUT</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '4rem', letterSpacing: '0.2em', fontSize: '0.8rem' }}>
          LADE DATEN...
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
            {dayObjects.map(d => (
              <button key={d.dateInt} style={s.dayTab(d.dateInt === activeDayInt)} onClick={() => setSelectedDay(d.dateInt)}>
                {isDateToday(d.date) ? 'HEUTE' : isDateTomorrow(d.date) ? 'MORGEN' : formatDate(d.date)}
              </button>
            ))}
          </div>

          <div style={s.grid}>
            <div style={s.card}>
              <div style={s.cardTitle}>
                <span>STUNDENPLAN</span>
                <span>{activeDay ? formatDate(activeDay.date) : '—'}</span>
              </div>
              {!activeDay || activeDay.lessons.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Keine Stunden</div>
              ) : activeDay.lessons.map((l, i) => {
                const cancelled = isCancelled(l)
                const sub = !cancelled && isSubstitution(l)
                const roomChange = hasRoomChange(l)
                return (
                  <div key={i} style={{ ...s.row, opacity: cancelled ? 0.45 : 1 }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', minWidth: '3rem' }}>
                        {parseUntisTime(l.startTime)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, textDecoration: cancelled ? 'line-through' : 'none' }}>
                          {l.su?.[0]?.name || '—'}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
                          {l.te?.[0]?.name !== '---' ? l.te?.[0]?.name : '?'}
                          {l.ro?.[0]?.name && l.ro[0].name !== '---' ? ` · ${l.ro[0].name}` : ''}
                          {l.lstext ? ` · ${l.lstext}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {cancelled && <span style={s.badge('var(--red)', '#fff')}>ENTFALL</span>}
                      {sub && <span style={s.badge('var(--yellow)')}>VERTR.</span>}
                      {roomChange && !cancelled && <span style={s.badge('var(--border)', 'var(--text)')}>RAUM</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>
                <span>ÄNDERUNGEN & AUSFÄLLE</span>
                <span>2 Wochen</span>
              </div>
              {allChanges.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Keine Änderungen 🎉</div>
              ) : allChanges.map((l, i) => {
                const date = parseUntisDate(l.date)
                const cancelled = isCancelled(l)
                return (
                  <div key={i} style={s.row}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {l.su?.[0]?.name || '—'}
                        <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: '0.5rem', fontSize: '0.6rem' }}>
                          {isDateToday(date) ? 'heute' : isDateTomorrow(date) ? 'morgen' : formatDate(date)}
                          {' '}{parseUntisTime(l.startTime)}
                        </span>
                      </div>
                      {l.lstext && <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{l.lstext}</div>}
                    </div>
                    {cancelled
                      ? <span style={s.badge('var(--red)', '#fff')}>ENTFALL</span>
                      : hasRoomChange(l)
                        ? <span style={s.badge('var(--border)', 'var(--text)')}>RAUM</span>
                        : <span style={s.badge('var(--yellow)')}>VERTR.</span>
                    }
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
