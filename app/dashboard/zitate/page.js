'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'

export default function Zitate() {
  const router = useRouter()
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [quotes, setQuotes] = useState([])
  const [teachers, setTeachers] = useState({}) // id -> name map
  const [loading, setLoading] = useState(true)
  const [votedQuotes, setVotedQuotes] = useState({})

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    const savedVotes = (() => { try { return JSON.parse(localStorage.getItem('gydo_votes') || '{}') } catch { return {} } })()
    setVotedQuotes(savedVotes)

    // top zitate + lehrer-namen parallel laden
    Promise.all([
      fetch('/api/quotes?top=week').then(r => r.json()),
      fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p, otp })
      }).then(r => r.json())
    ]).then(([quotesData, teachersData]) => {
      setQuotes(quotesData.quotes || [])
      const map = {}
      for (const t of (teachersData.teachers || [])) {
        map[String(t.id)] = t.longName || t.name || '?'
      }
      setTeachers(map)
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  const vote = async (quoteId, teacherKey, voteType) => {
    if (!username || votedQuotes[quoteId]) return
    const res = await fetch('/api/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: teacherKey, quoteId, vote: voteType, username })
    })
    const d = await res.json()
    if (d.ok) {
      setQuotes(qs => qs.map(q => q.id === quoteId ? { ...q, ...d.quote } : q))
      const newVotes = { ...votedQuotes, [quoteId]: voteType }
      setVotedQuotes(newVotes)
      localStorage.setItem('gydo_votes', JSON.stringify(newVotes))
    }
  }

  const getMedal = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>WÖCHENTLICHER WETTBEWERB</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>Top Zitate</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
            die besten zitate der letzten 7 tage — sortiert nach upvotes
          </div>
        </div>

        {/* woche countdown */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem 1.25rem', marginBottom: '2rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            NEUE WOCHE STARTET JEDEN MONTAG — halbjahres-reset behält nur ≥10 upvotes
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>
            {quotes.length} ZITATE DIESE WOCHE
          </span>
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', animation: 'pulse 1.5s infinite' }}>LADE...</div>
        ) : quotes.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '1rem', padding: '2rem 0', textAlign: 'center' }}>
            Diese Woche noch keine Zitate — los geht's!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quotes.map((q, i) => {
              const score = q.upvotes - q.downvotes
              const myVote = votedQuotes[q.id]
              const teacherName = teachers[q._teacherKey] || `Lehrer ${q._teacherKey}`
              const isTop3 = i < 3

              return (
                <div key={q.id} style={{
                  background: isTop3 ? 'var(--surface2)' : 'var(--surface)',
                  border: `1px solid ${isTop3 ? 'var(--accent)' : 'var(--border)'}`,
                  borderLeft: `4px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--border)'}`,
                  padding: '1.25rem 1.5rem',
                  borderRadius: '4px',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: isTop3 ? '1.5rem' : '1rem', fontWeight: 700 }}>{getMedal(i)}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '1rem', fontWeight: 700, minWidth: '2.5rem', textAlign: 'center',
                        color: score > 0 ? 'var(--green)' : score < 0 ? 'var(--red)' : 'var(--muted)',
                      }}>
                        {score > 0 ? '+' : ''}{score}
                      </span>
                      <button onClick={() => vote(q.id, q._teacherKey, 'up')} disabled={!!myVote} style={{
                        background: myVote === 'up' ? 'var(--green)' : 'var(--surface3)',
                        border: '1px solid var(--border)', color: myVote === 'up' ? '#fff' : 'var(--muted)',
                        padding: '0.35rem 0.65rem', cursor: myVote ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem', borderRadius: '2px',
                      }}>▲</button>
                      <button onClick={() => vote(q.id, q._teacherKey, 'down')} disabled={!!myVote} style={{
                        background: myVote === 'down' ? 'var(--red)' : 'var(--surface3)',
                        border: '1px solid var(--border)', color: myVote === 'down' ? '#fff' : 'var(--muted)',
                        padding: '0.35rem 0.65rem', cursor: myVote ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem', borderRadius: '2px',
                      }}>▼</button>
                    </div>
                  </div>

                  <div style={{ fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    „{q.text}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)' }}>
                    <span>von <strong style={{ color: 'var(--text)' }}>{q.authorName}</strong></span>
                    <span style={{ color: 'var(--accent)', opacity: 0.8 }}>{teacherName}</span>
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
