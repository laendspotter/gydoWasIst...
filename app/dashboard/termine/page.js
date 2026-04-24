'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, isToday, isTomorrow, formatDate } from '../../../lib/untis'

export default function Termine() {
  const router = useRouter()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, otp })
    }).then(r => r.json()).then(d => {
      setExams(d.exams || [])
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  const sorted = exams
    .filter(e => e.date)
    .map(e => ({ ...e, _date: parseUntisDate(e.date) }))
    .sort((a, b) => a._date - b._date)

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
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Termine</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          Klausuren & Prüfungen aus WebUntis — keine Ausfälle (die sind im Stundenplan)
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', letterSpacing: '0.15em', animation: 'pulse 1.5s infinite' }}>LADE...</div>
        ) : sorted.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0' }}>
            Keine Termine gefunden — WebUntis gibt für gydo keine Klausuren zurück (403 ist normal).
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map((item, i) => {
              const daysLeft = Math.ceil((item._date - new Date()) / (1000 * 60 * 60 * 24))
              const urgent = daysLeft < 3
              const color = urgent ? 'var(--red)' : daysLeft < 7 ? 'var(--yellow)' : 'var(--accent)'
              return (
                <div key={i} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${color}`,
                  padding: '1.25rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: '1rem', borderRadius: '2px',
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{
                        background: color, color: urgent ? '#fff' : daysLeft < 7 ? '#000' : '#fff',
                        fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem',
                        letterSpacing: '0.1em', borderRadius: '2px',
                      }}>KLAUSUR</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {item.subject || item.name || '—'}
                      </span>
                    </div>
                    {item.teachers?.[0] && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {item.teachers[0]}
                      </div>
                    )}
                    {item.examType && item.examType !== 'KL' && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', marginTop: '0.2rem' }}>{item.examType}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color }}>
                      {dateLabel(item._date)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                      {daysUntil(item._date)}
                    </div>
                    {item.startTime && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                        {String(item.startTime).padStart(4, '0').slice(0, 2)}:{String(item.startTime).padStart(4, '0').slice(2, 4)} Uhr
                      </div>
                    )}
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
