'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, isToday, isTomorrow, formatDate } from '../../../lib/untis'

export default function Termine() {
  const router = useRouter()
  const [timetable, setTimetable] = useState([])
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    Promise.all([
      fetch('/api/timetable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) }).then(r => r.json()),
      fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) }).then(r => r.json()),
    ]).then(([tt, ex]) => {
      setTimetable(tt.timetable || [])
      setExams(ex.exams || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  // nächste freistunden/ausfälle
  const cancellations = timetable
    .filter(l => l.code === 'cancelled')
    .map(l => ({ ...l, _type: 'ausfall', _date: parseUntisDate(l.date) }))
    .sort((a, b) => a._date - b._date)

  // alle klausuren
  const allExams = exams
    .filter(e => e.date)
    .map(e => ({ ...e, _type: 'klausur', _date: parseUntisDate(e.date) }))
    .sort((a, b) => a._date - b._date)

  const combined = [...allExams, ...cancellations].sort((a, b) => a._date - b._date)

  const daysUntil = (d) => {
    const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'HEUTE'
    if (diff === 1) return 'MORGEN'
    return `in ${diff} Tagen`
  }

  const dateLabel = (d) => {
    if (isToday(d)) return 'HEUTE'
    if (isTomorrow(d)) return 'MORGEN'
    return formatDate(d)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Termine</div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', letterSpacing: '0.15em' }}>LADE...</div>
        ) : combined.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0' }}>Keine Termine gefunden.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {combined.map((item, i) => {
              const isKlausur = item._type === 'klausur'
              const daysLeft = Math.ceil((item._date - new Date()) / (1000 * 60 * 60 * 24))
              const urgent = daysLeft < 3
              return (
                <div key={i} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${isKlausur ? (urgent ? 'var(--red)' : 'var(--yellow)') : 'var(--green)'}`,
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{
                        background: isKlausur ? (urgent ? 'var(--red)' : 'var(--yellow)') : 'var(--green)',
                        color: isKlausur && !urgent ? '#000' : '#fff',
                        fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', letterSpacing: '0.1em',
                      }}>{isKlausur ? 'KLAUSUR' : 'AUSFALL'}</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                        {isKlausur ? (item.subject || item.name || '—') : (item.su?.[0]?.name || '—')}
                      </span>
                    </div>
                    {isKlausur && item.teachers?.[0] && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>👤 {item.teachers[0]}</div>
                    )}
                    {!isKlausur && item.lstext && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.lstext}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: urgent ? 'var(--red)' : 'var(--text)' }}>
                      {dateLabel(item._date)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                      {daysUntil(item._date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
