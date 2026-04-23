'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, formatDate, isToday, isTomorrow } from '../../../lib/untis'

export default function Hausaufgaben() {
  const router = useRouter()
  const [data, setData] = useState({ homework: [], exams: [] })
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [tab, setTab] = useState('homework')

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    }).then(r => r.json()).then(d => {
      setData({ homework: d.homework || [], exams: d.exams || [] })
      setLoading(false)
    }).catch(() => setLoading(false))

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
  const urgencyTextColor = { red: 'var(--red)', yellow: 'var(--yellow)', normal: 'var(--muted)' }

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: '0.6rem 1.25rem',
      background: tab === id ? 'var(--surface)' : 'transparent',
      border: '1px solid var(--border)',
      borderBottom: tab === id ? '1px solid var(--surface)' : '1px solid var(--border)',
      color: tab === id ? 'var(--text)' : 'var(--muted)',
      fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.1em',
    }}>{label}</button>
  )

  const hw = data.homework
  const exams = data.exams.sort((a, b) => (a.date || 0) - (b.date || 0))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Hausaufgaben & Termine</div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <TabBtn id="homework" label="HAUSAUFGABEN" />
          <TabBtn id="exams" label="KLAUSUREN & PRÜFUNGEN" />
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', letterSpacing: '0.15em' }}>LADE...</div>
        ) : tab === 'homework' ? (
          hw.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0' }}>
              Keine Hausaufgaben gefunden — oder WebUntis gibt nix her.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hw.map((h, i) => {
                const u = urgency(h.dueDate || h.date)
                return (
                  <div key={i} style={{
                    background: 'var(--surface)',
                    border: `1px solid var(--border)`,
                    borderLeft: `4px solid ${urgencyColor[u]}`,
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        {h.subject?.name || h.subject || '—'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                        {h.text || h.remark || 'Keine Beschreibung'}
                      </div>
                      {h.teacher && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted2)', marginTop: '0.35rem' }}>
                          von {h.teacher.name || h.teacher}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: urgencyTextColor[u], letterSpacing: '0.08em' }}>
                        {dueLabel(h.dueDate || h.date)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          exams.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0' }}>
              Keine Klausuren gefunden — oder WebUntis gibt nix her (403 ist normal).
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {exams.map((e, i) => {
                const u = urgency(e.date)
                return (
                  <div key={i} style={{
                    background: 'var(--surface)',
                    border: `1px solid var(--border)`,
                    borderLeft: `4px solid ${urgencyColor[u]}`,
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {e.subject || e.name || '—'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {e.examType || 'Klausur'}
                        {e.teachers?.[0] && ` · ${e.teachers[0]}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: urgencyTextColor[u] }}>
                        {dueLabel(e.date)}
                      </div>
                      {e.startTime && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{String(e.startTime).padStart(4,'0').slice(0,2)}:{String(e.startTime).padStart(4,'0').slice(2,4)} Uhr</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
