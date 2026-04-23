'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, parseUntisTime, isCancelled, isSubstitution, dayLabel } from '../../../lib/untis'

export default function Stundenplan() {
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
    dayObjects.find(d => d.date.toDateString() === now.toDateString())?.dateInt ??
    dayObjects.find(d => d.date >= now)?.dateInt ??
    dayObjects[0]?.dateInt
  )
  const activeDay = dayObjects.find(d => d.dateInt === activeDayInt)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Stundenplan</div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', letterSpacing: '0.15em' }}>LADE...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
              {dayObjects.map(d => (
                <button key={d.dateInt} onClick={() => setSelectedDay(d.dateInt)} style={{
                  padding: '0.6rem 1.1rem',
                  background: d.dateInt === activeDayInt ? 'var(--red)' : 'var(--surface)',
                  border: `1px solid ${d.dateInt === activeDayInt ? 'var(--red)' : 'var(--border)'}`,
                  color: d.dateInt === activeDayInt ? '#fff' : 'var(--muted)',
                  fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.08em',
                }}>{dayLabel(d.date)}</button>
              ))}
            </div>

            {!activeDay || activeDay.lessons.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0' }}>Keine Stunden an diesem Tag.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeDay.lessons.map((l, i) => {
                  const cancelled = isCancelled(l)
                  const sub = !cancelled && isSubstitution(l)
                  const subjectColor = cancelled ? 'var(--muted2)' : sub ? 'var(--yellow)' : 'var(--text)'

                  return (
                    <div key={i} style={{
                      background: 'var(--surface)',
                      border: `1px solid ${cancelled ? 'var(--border)' : sub ? 'var(--yellow)' : 'var(--border)'}`,
                      borderLeft: `4px solid ${cancelled ? 'var(--muted2)' : sub ? 'var(--yellow)' : 'var(--red)'}`,
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: cancelled ? 0.5 : 1,
                      gap: '1rem',
                    }}>
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
                        <div style={{ textAlign: 'right', minWidth: '4rem' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--red)' }}>{parseUntisTime(l.startTime)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{parseUntisTime(l.endTime)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: subjectColor, textDecoration: cancelled ? 'line-through' : 'none' }}>
                            {l.su?.[0]?.longName || l.su?.[0]?.name || '—'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {l.te?.[0]?.name && l.te[0].name !== '---' && <span>👤 {l.te[0].name}</span>}
                            {l.ro?.[0]?.name && l.ro[0].name !== '---' && <span>📍 {l.ro[0].name}</span>}
                            {l.lstext && <span style={{ color: sub ? 'var(--yellow)' : 'var(--muted)' }}>ℹ {l.lstext}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        {cancelled && <span style={{ background: 'var(--red)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', letterSpacing: '0.08em' }}>ENTFALL</span>}
                        {sub && <span style={{ background: 'var(--yellow)', color: '#000', fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.6rem', letterSpacing: '0.08em' }}>VERTRETUNG</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
