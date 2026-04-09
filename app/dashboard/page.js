'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function formatDate(d) {
  return new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function daysUntil(dateStr) {
  const now = new Date()
  now.setHours(0,0,0,0)
  const target = new Date(dateStr)
  target.setHours(0,0,0,0)
  return Math.round((target - now) / 86400000)
}

function parseUntisDate(d) {
  const s = String(d)
  return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`
}

function parseUntisTime(t) {
  const s = String(t).padStart(4, '0')
  return `${s.slice(0,2)}:${s.slice(2,4)}`
}

function isToday(dateInt) {
  const s = String(dateInt)
  const d = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isCancelled(lesson) {
  return lesson.code === 'cancelled' || lesson.lstext?.toLowerCase().includes('entfall') || lesson.statflags?.includes('~')
}

function isSubstitution(lesson) {
  return lesson.code === 'irregular' || lesson.lstext?.length > 0
}

export default function Dashboard() {
  const router = useRouter()
  const [timetable, setTimetable] = useState([])
  const [exams, setExams] = useState([])
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    async function load() {
      try {
        const [ttRes, exRes] = await Promise.all([
          fetch('/api/timetable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) }),
          fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) })
        ])
        const ttData = await ttRes.json()
        const exData = await exRes.json()
        setTimetable(ttData.timetable || [])
        setNews(ttData.news?.newMessages || [])
        setExams(exData.exams || [])
      } catch {}
      setLoading(false)
    }
    load()

    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const todayLessons = timetable.filter(l => isToday(l.date)).sort((a,b) => a.startTime - b.startTime)
  const cancelled = todayLessons.filter(isCancelled)
  const substitutions = todayLessons.filter(l => !isCancelled(l) && isSubstitution(l))

  const upcomingExams = exams
    .filter(e => daysUntil(parseUntisDate(e.examDate)) >= 0)
    .sort((a,b) => a.examDate - b.examDate)
    .slice(0, 6)

  const s = {
    page: { minHeight: '100vh', background: 'var(--dark)', padding: '1.5rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' },
    label: { fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--muted)', marginBottom: '0.25rem' },
    clock: { fontSize: '2rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.05em' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' },
    card: { background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem' },
    cardTitle: { fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--muted)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' },
    badge: (color) => ({ background: color, color: '#000', fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.5rem', letterSpacing: '0.1em' }),
    countdown: (days) => ({
      fontSize: '1.4rem', fontWeight: 700,
      color: days <= 2 ? 'var(--red)' : days <= 7 ? 'var(--yellow)' : 'var(--text)'
    }),
    logout: { background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '0.4rem 0.75rem', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em' }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.label}>GYDO // SCHULBOARD</div>
          <div style={s.clock}>{clock || '--:--:--'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{username}</div>
          <button style={s.logout} onClick={() => { sessionStorage.clear(); router.push('/') }}>LOGOUT</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '4rem', letterSpacing: '0.2em' }}>
          LADE DATEN...
        </div>
      ) : (
        <div style={s.grid}>

          {/* Heute anders */}
          <div style={s.card}>
            <div style={s.cardTitle}>
              <span>HEUTE ANDERS</span>
              <span>{new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
            </div>
            {cancelled.length === 0 && substitutions.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Kein Ausfall / keine Vertretung heute</div>
            ) : (
              <>
                {cancelled.map((l, i) => (
                  <div key={i} style={s.row}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{l.su?.[0]?.name || 'Stunde'}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{parseUntisTime(l.startTime)} Uhr</div>
                    </div>
                    <span style={s.badge('var(--red)')}>ENTFALL</span>
                  </div>
                ))}
                {substitutions.map((l, i) => (
                  <div key={i} style={s.row}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{l.su?.[0]?.name || 'Stunde'}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{parseUntisTime(l.startTime)} · {l.lstext || 'Vertretung'}</div>
                    </div>
                    <span style={s.badge('var(--yellow)')}>ÄNDERUNG</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Nächste Tests & Arbeiten */}
          <div style={s.card}>
            <div style={s.cardTitle}><span>TESTS & ARBEITEN</span><span>nächste 8 Wochen</span></div>
            {upcomingExams.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Keine eingetragenen Prüfungen</div>
            ) : upcomingExams.map((e, i) => {
              const days = daysUntil(parseUntisDate(e.examDate))
              return (
                <div key={i} style={s.row}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{e.subject || e.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                      {formatDate(parseUntisDate(e.examDate))}
                      {e.examType && ` · ${e.examType}`}
                    </div>
                  </div>
                  <div style={s.countdown(days)}>
                    {days === 0 ? 'HEUTE' : days === 1 ? 'MORGEN' : `${days}d`}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stundenplan heute */}
          <div style={s.card}>
            <div style={s.cardTitle}><span>STUNDENPLAN HEUTE</span></div>
            {todayLessons.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Keine Stunden heute</div>
            ) : todayLessons.map((l, i) => (
              <div key={i} style={{ ...s.row, opacity: isCancelled(l) ? 0.4 : 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', minWidth: '3.5rem' }}>
                    {parseUntisTime(l.startTime)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textDecoration: isCancelled(l) ? 'line-through' : 'none' }}>
                      {l.su?.[0]?.name || '—'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                      {l.ro?.[0]?.name && `Raum ${l.ro[0].name}`}
                      {l.te?.[0]?.name && ` · ${l.te[0].name}`}
                    </div>
                  </div>
                </div>
                {isCancelled(l) && <span style={s.badge('var(--red)')}>X</span>}
                {!isCancelled(l) && isSubstitution(l) && <span style={s.badge('var(--yellow)')}>!</span>}
              </div>
            ))}
          </div>

          {/* News / Ankündigungen */}
          {news.length > 0 && (
            <div style={s.card}>
              <div style={s.cardTitle}><span>NACHRICHTEN</span></div>
              {news.slice(0, 4).map((n, i) => (
                <div key={i} style={{ ...s.row, flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{n.subject}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }} dangerouslySetInnerHTML={{ __html: n.text?.slice(0, 120) + '...' }} />
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
