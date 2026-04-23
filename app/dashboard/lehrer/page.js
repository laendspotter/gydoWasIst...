'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'

export default function Lehrer() {
  const router = useRouter()
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [teachers, setTeachers] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('lehrer')
  const [selected, setSelected] = useState(null) // selected teacher or room
  const [quotes, setQuotes] = useState([])
  const [roomNotes, setRoomNotes] = useState([])
  const [newQuote, setNewQuote] = useState('')
  const [newNote, setNewNote] = useState('')
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('gydo_name') || ''
    return ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [votedQuotes, setVotedQuotes] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('gydo_votes') || '{}') } catch { return {} }
    }
    return {}
  })

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    }).then(r => r.json()).then(d => {
      setTeachers((d.teachers || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      setRooms((d.rooms || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  const selectTeacher = async (t) => {
    setSelected(t)
    setQuotes([])
    const res = await fetch(`/api/quotes?teacherId=${t.id}`)
    const d = await res.json()
    setQuotes(d.quotes || [])
  }

  const selectRoom = async (r) => {
    setSelected(r)
    setRoomNotes([])
    const res = await fetch(`/api/rooms?roomId=${r.id}`)
    const d = await res.json()
    setRoomNotes(d.notes || [])
  }

  const saveName = (name) => {
    setAuthorName(name)
    localStorage.setItem('gydo_name', name)
  }

  const submitQuote = async () => {
    if (!newQuote.trim() || !authorName.trim() || !selected) return
    setSubmitting(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: selected.id, text: newQuote, authorName })
    })
    const d = await res.json()
    if (d.ok) {
      setQuotes(q => [d.quote, ...q])
      setNewQuote('')
    }
    setSubmitting(false)
  }

  const submitNote = async () => {
    if (!newNote.trim() || !authorName.trim() || !selected) return
    setSubmitting(true)
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selected.id, text: newNote, authorName })
    })
    const d = await res.json()
    if (d.ok) {
      setRoomNotes(n => [d.note, ...n])
      setNewNote('')
    }
    setSubmitting(false)
  }

  const vote = async (quoteId, voteType) => {
    if (!username || votedQuotes[quoteId]) return
    const res = await fetch('/api/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: selected.id, quoteId, vote: voteType, username })
    })
    const d = await res.json()
    if (d.ok) {
      setQuotes(qs => qs.map(q => q.id === quoteId ? d.quote : q))
      const newVotes = { ...votedQuotes, [quoteId]: voteType }
      setVotedQuotes(newVotes)
      localStorage.setItem('gydo_votes', JSON.stringify(newVotes))
    }
  }

  const filteredTeachers = teachers.filter(t =>
    (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.longName || '').toLowerCase().includes(search.toLowerCase())
  )
  const filteredRooms = rooms.filter(r =>
    (r.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none',
  }

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setSelected(null); setSearch('') }} style={{
      padding: '0.6rem 1.25rem',
      background: tab === id ? 'var(--red)' : 'var(--surface)',
      border: `1px solid ${tab === id ? 'var(--red)' : 'var(--border)'}`,
      color: tab === id ? '#fff' : 'var(--muted)',
      fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.1em',
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Lehrer & Räume</div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <TabBtn id="lehrer" label="LEHRER" />
          <TabBtn id="räume" label="RÄUME" />
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', letterSpacing: '0.15em' }}>LADE...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '320px 1fr' : '1fr', gap: '1.5rem' }}>
            {/* list */}
            <div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={tab === 'lehrer' ? 'Lehrer suchen...' : 'Raum suchen...'}
                style={{ ...inputStyle, marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '70vh', overflowY: 'auto' }}>
                {tab === 'lehrer' ? filteredTeachers.map(t => (
                  <button key={t.id} onClick={() => selectTeacher(t)} style={{
                    background: selected?.id === t.id ? 'var(--surface2)' : 'var(--surface)',
                    border: `1px solid ${selected?.id === t.id ? 'var(--red)' : 'var(--border)'}`,
                    borderLeft: `3px solid ${selected?.id === t.id ? 'var(--red)' : 'transparent'}`,
                    color: 'var(--text)', padding: '0.85rem 1rem', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.1s',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.name}</div>
                      {t.longName && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{t.longName}</div>}
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>›</span>
                  </button>
                )) : filteredRooms.map(r => (
                  <button key={r.id} onClick={() => selectRoom(r)} style={{
                    background: selected?.id === r.id ? 'var(--surface2)' : 'var(--surface)',
                    border: `1px solid ${selected?.id === r.id ? 'var(--red)' : 'var(--border)'}`,
                    borderLeft: `3px solid ${selected?.id === r.id ? 'var(--red)' : 'transparent'}`,
                    color: 'var(--text)', padding: '0.85rem 1rem', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{r.name}</div>
                      {r.longName && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.longName}</div>}
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* detail panel */}
            {selected && (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selected.name}</div>
                  {selected.longName && <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{selected.longName}</div>}
                </div>

                {/* name eingabe (einmalig) */}
                {!authorName && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--yellow)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--yellow)', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>NAME SETZEN (einmalig)</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input placeholder="Dein Name..." style={{ ...inputStyle, flex: 1 }}
                        onKeyDown={e => e.key === 'Enter' && saveName(e.target.value)}
                        onChange={e => setAuthorName(e.target.value)}
                        value={authorName}
                      />
                      <button onClick={() => saveName(authorName)} style={{
                        background: 'var(--yellow)', color: '#000', border: 'none',
                        padding: '0 1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em',
                      }}>SPEICHERN</button>
                    </div>
                  </div>
                )}

                {/* zitate section (nur für lehrer) */}
                {tab === 'lehrer' && (
                  <>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                      LEGENDEN-ZITATE ({quotes.length})
                    </div>

                    {/* neues zitat */}
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                      <textarea
                        value={newQuote}
                        onChange={e => setNewQuote(e.target.value)}
                        placeholder={`Zitat von ${selected.name} eingeben...`}
                        rows={2}
                        style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.75rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {authorName ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>als: <strong style={{ color: 'var(--text)' }}>{authorName}</strong></span>
                            <button onClick={() => { setAuthorName(''); localStorage.removeItem('gydo_name') }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.75rem' }}>ändern</button>
                          </div>
                        ) : (
                          <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Dein Name *" style={{ ...inputStyle, width: 'auto', flex: 1 }} />
                        )}
                        <button onClick={submitQuote} disabled={submitting || !newQuote.trim() || !authorName.trim()} style={{
                          background: 'var(--red)', color: '#fff', border: 'none',
                          padding: '0.6rem 1.25rem', fontSize: '0.8rem', fontWeight: 700,
                          cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.1em', marginLeft: 'auto',
                        }}>EINTRAGEN →</button>
                      </div>
                    </div>

                    {/* zitate liste */}
                    {quotes.length === 0 ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '1rem 0' }}>Noch keine Zitate — sei der erste.</div>
                    ) : quotes.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).map(q => {
                      const score = q.upvotes - q.downvotes
                      const myVote = votedQuotes[q.id]
                      return (
                        <div key={q.id} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          padding: '1.25rem', marginBottom: '0.75rem',
                        }}>
                          <div style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.75rem', fontStyle: 'italic' }}>
                            „{q.text}"
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              von <strong>{q.authorName}</strong> · {new Date(q.createdAt).toLocaleDateString('de-DE')}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: score > 0 ? 'var(--green)' : score < 0 ? 'var(--red)' : 'var(--muted)', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>
                                {score > 0 ? '+' : ''}{score}
                              </span>
                              <button onClick={() => vote(q.id, 'up')} disabled={!!myVote} style={{
                                background: myVote === 'up' ? 'var(--green)' : 'var(--surface2)',
                                border: '1px solid var(--border)', color: myVote === 'up' ? '#fff' : 'var(--muted)',
                                padding: '0.3rem 0.6rem', cursor: myVote ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                              }}>▲</button>
                              <button onClick={() => vote(q.id, 'down')} disabled={!!myVote} style={{
                                background: myVote === 'down' ? 'var(--red)' : 'var(--surface2)',
                                border: '1px solid var(--border)', color: myVote === 'down' ? '#fff' : 'var(--muted)',
                                padding: '0.3rem 0.6rem', cursor: myVote ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                              }}>▼</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}

                {/* raumnotizen (nur für räume) */}
                {tab === 'räume' && (
                  <>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                      RAUMNOTIZEN ({roomNotes.length})
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1rem' }}>
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder={`Notiz zu ${selected.name} (Heizung kaputt, Beamer spinnt, guter Raum...)`}
                        rows={2}
                        style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.75rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {authorName ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>als: <strong style={{ color: 'var(--text)' }}>{authorName}</strong></span>
                        ) : (
                          <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Dein Name *" style={{ ...inputStyle, width: 'auto', flex: 1 }} />
                        )}
                        <button onClick={submitNote} disabled={submitting || !newNote.trim() || !authorName.trim()} style={{
                          background: 'var(--red)', color: '#fff', border: 'none',
                          padding: '0.6rem 1.25rem', fontSize: '0.8rem', fontWeight: 700,
                          cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.1em', marginLeft: 'auto',
                        }}>EINTRAGEN →</button>
                      </div>
                    </div>

                    {roomNotes.length === 0 ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '1rem 0' }}>Noch keine Notizen zu diesem Raum.</div>
                    ) : roomNotes.map(n => (
                      <div key={n.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--blue)', padding: '1.25rem', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>{n.text}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          von <strong>{n.authorName}</strong> · {new Date(n.createdAt).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
