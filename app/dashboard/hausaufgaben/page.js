'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, formatDate, isToday, isTomorrow } from '../../../lib/untis'

export default function Hausaufgaben() {
  const router = useRouter()
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      setHomework(d.homework || [])
      if (d.error) setError(d.error)
      setLoading(false)
    }).catch(e => {
      setError(e.message)
      setLoading(false)
    })

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  const dueLabel = (dateVal) => {
    if (!dateVal) return '?'
    try {
      const d = typeof dateVal === 'number' ? parseUntisDate(dateVal) : new Date(dateVal)
      if (isToday(d)) return 'HEUTE'
      if (isTomorrow(d)) return 'MORGEN'
      return formatDate(d)
    } catch { return '?' }
  }

  const urgency = (dateVal) => {
    if (!dateVal) return 'normal'
    try {
      const d = typeof dateVal === 'number' ? parseUntisDate(dateVal) : new Date(dateVal)
      const diff = (d - new Date()) / (1000 * 60 * 60 * 24)
      if (diff < 1) return 'red'
      if (diff < 3) return 'yellow'
      return 'normal'
    } catch { return 'normal' }
  }

  const urgencyColor = { red: 'var(--red)', yellow: 'var(--yellow)', normal: 'var(--border)' }
  const urgencyText = { red: 'var(--red)', yellow: 'var(--yellow)', normal: 'var(--muted)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Hausaufgaben</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          direkt aus WebUntis — was deine Lehrer eingetragen haben
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', letterSpacing: '0.15em', animation: 'pulse 1.5s infinite' }}>LADE...</div>
        ) : error ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red)', padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--red)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>FEHLER</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{error}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted2)', marginTop: '0.5rem' }}>
              WebUntis-Hausaufgaben sind bei vielen Schulen nicht verfügbar oder eingeschränkt. Kein Beinbruch.
            </div>
          </div>
        ) : homework.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0' }}>
            Keine Hausaufgaben gefunden — entweder nichts eingetragen oder WebUntis gibt nix her.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {homework.map((h, i) => {
              const u = urgency(h.dueDate || h.date)
              return (
                <div key={i} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${urgencyColor[u]}`,
                  padding: '1.25rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', gap: '1rem', borderRadius: '2px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      {h.subject?.name || h.subject || '—'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {h.text || h.remark || 'Keine Beschreibung'}
                    </div>
                    {h.teacher && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', marginTop: '0.35rem' }}>
                        von {h.teacher.name || h.teacher}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: urgencyText[u], letterSpacing: '0.08em' }}>
                      {dueLabel(h.dueDate || h.date)}
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
