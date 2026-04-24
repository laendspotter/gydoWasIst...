'use client'
import { useEffect, useState, useRef } from 'react'
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
  const [selected, setSelected] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [roomNotes, setRoomNotes] = useState([])
  const [newQuote, setNewQuote] = useState('')
  const [newNote, setNewNote] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [votedQuotes, setVotedQuotes] = useState({})
  const nameInputRef = useRef(null)

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    // name aus localstorage
    const savedName = localStorage.getItem('gydo_name') || ''
    setAuthorName(savedName)
    setNameInput(savedName)

    const savedVotes = (() => { try { return JSON.parse(localStorage.getItem('gydo_votes') || '{}') } catch { return {} } })()
    setVotedQuotes(savedVotes)

    fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, otp })
    }).then(r => r.json()).then(d => {
      setTeachers((d.teachers || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      setRooms((d.rooms || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      setLoading(false)
    }).catch(() => setLoading(false))

    const tick = setInterval(() => setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000)
    return () => clearInterval(tick)
  }, [])

  const saveName = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setAuthorName(trimmed)
    setNameInput(trimmed)
    localStorage.setItem('gydo_name', trimmed)
  }

  // 1-buchstabe → sofort name nehmen ohne bestätigung
  const handleNameInput = (e) => {
    const val = e.target.value
    setNameInput(val)
    if (val.length === 1) {
      saveName(val)
    }
  }

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

  const submitQuote = async () => {
    if (!newQuote.trim() || !authorName || !selected) return
    setSubmitting(true)
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: selected.id, text: newQuote, authorName })
    })
    const d = await res.json()
    if (d.ok) { setQuotes(q => [d.quote, ...q]); setNewQuote('') }
    setSubmitting(false)
  }

  const submitNote = async () => {
    if (!newNote.trim() || !authorName || !selected) return
    setSubmitting(true)
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selected.id, text: newNote, authorName })
    })
    const d = await res.json()
    if (d.ok) { setRoomNotes(n => [d.note, ...n]); setNewNote('') }
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

  const inp = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '0.75rem 1rem', fontSize: '0.9rem', outline: 'none',
    borderRadius: '2px',
  }

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setSelected(null); setSearch('') }} style={{
      padding: '0.5rem 1.1rem',
      background: tab === id ? 'var(--accent)' : 'var(--surface)',
      border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--border)'}`,
      color: tab === id ? '#fff' : 'var(--muted)',
      fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em', borderRadius: '2px',
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
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', animation: 'pulse 1.5s infinite' }}>LADE...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '300px 1fr' : '1fr', gap: '1.5rem' }}>
            {/* liste */}
            <div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tab === 'lehrer' ? 'Lehrer suchen...' : 'Raum suchen...'}
                style={{ ...inp, marginBottom: '0.75rem' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '70vh', overflowY: 'auto' }}>
                {(tab === 'lehrer' ? filteredTeachers : filteredRooms).map(item => (
                  <button key={item.id}
                    onClick={() => tab === 'lehrer' ? selectTeacher(item) : selectRoom(item)}
                    style={{
                      background: selected?.id === item.id ? 'var(--surface2)' : 'var(--surface)',
                      border: `1px solid ${selected?.id === item.id ? 'var(--accent)' : 'var(--border)'}`,
                      borderLeft: `3px solid ${selected?.id === item.id ? 'var(--accent)' : 'transparent'}`,
                      color: 'var(--text)', padding: '0.8rem 1rem', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderRadius: '2px', transition: 'all 0.1s',
                    }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.name}</div>
                      {item.longName && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{item.longName}</div>}
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* detail */}
            {selected && (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.25rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{selected.name}</div>
                  {selected.longName && <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>{selected.longName}</div>}
                </div>

                {/* name eingabe */}
                <div style={{ background: 'var(--surface)', border: `1px solid ${authorName ? 'var(--border)' : 'var(--accent)'}`, padding: '1rem 1.25rem', marginBottom: '1.25rem', borderRadius: '4px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>DEIN NAME:</span>
                  <input
                    ref={nameInputRef}
                    value={nameInput}
                    onChange={handleNameInput}
                    onBlur={e => saveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveName(e.target.value)}
                    placeholder="Name eingeben..."
                    style={{ ...inp, width: 'auto', flex: 1, padding: '0.4rem 0.75rem', marginBottom: 0, fontSize: '0.85rem' }}
                  />
                  {authorName && <span style={{ fontSize: '0.7rem', color: 'var(--green)', whiteSpace: 'nowrap' }}>✓ gespeichert</span>}
                </div>

                {/* zitate */}
                {tab === 'lehrer' && (
                  <>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                      LEGENDEN-ZITATE ({quotes.length})
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                      <textarea value={newQuote} onChange={e => setNewQuote(e.target.value)}
                        placeholder={`„${selected.name} hat gesagt..."`}
                        rows={2} style={{ ...inp, resize: 'vertical', marginBottom: '0.75rem' }}
                        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && submitQuote()}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {authorName ? <>als <strong style={{ color: 'var(--text)' }}>{authorName}</strong></> : <span style={{ color: 'var(--red)' }}>Name oben eingeben</span>}
                          <span style={{ marginLeft: '0.5rem', color: 'var(--muted2)' }}>· Ctrl+Enter</span>
                        </span>
                        <button onClick={submitQuote} disabled={submitting || !newQuote.trim() || !authorName} style={{
                          background: submitting || !newQuote.trim() || !authorName ? 'var(--surface3)' : 'var(--accent)',
                          color: '#fff', border: 'none', padding: '0.5rem 1rem',
                          fontSize: '0.75rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                          letterSpacing: '0.08em', borderRadius: '2px',
                        }}>EINTRAGEN →</button>
                      </div>
                    </div>

                    {quotes.length === 0 ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '1rem 0' }}>Noch keine Zitate — sei der erste.</div>
                    ) : [...quotes].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).map(q => {
                      const score = q.upvotes - q.downvotes
                      const myVote = votedQuotes[q.id]
                      return (
                        <div key={q.id} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderLeft: `3px solid ${score >= 5 ? 'var(--accent)' : score < 0 ? 'var(--muted2)' : 'var(--border)'}`,
                          padding: '1.1rem', marginBottom: '0.6rem', borderRadius: '2px',
                        }}>
                          <div style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.75rem', fontStyle: 'italic', color: 'var(--text)' }}>
                            „{q.text}"
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                              von <strong style={{ color: 'var(--text)' }}>{q.authorName}</strong> · {new Date(q.createdAt).toLocaleDateString('de-DE')}
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center', color: score > 0 ? 'var(--green)' : score < 0 ? 'var(--red)' : 'var(--muted)' }}>
                                {score > 0 ? '+' : ''}{score}
                              </span>
                              <button onClick={() => vote(q.id, 'up')} disabled={!!myVote} style={{
                                background: myVote === 'up' ? 'var(--green)' : 'var(--surface2)',
                                border: '1px solid var(--border)', color: myVote === 'up' ? '#fff' : 'var(--muted)',
                                padding: '0.3rem 0.55rem', cursor: myVote ? 'not-allowed' : 'pointer', fontSize: '0.8rem', borderRadius: '2px',
                              }}>▲</button>
                              <button onClick={() => vote(q.id, 'down')} disabled={!!myVote} style={{
                                background: myVote === 'down' ? 'var(--red)' : 'var(--surface2)',
                                border: '1px solid var(--border)', color: myVote === 'down' ? '#fff' : 'var(--muted)',
                                padding: '0.3rem 0.55rem', cursor: myVote ? 'not-allowed' : 'pointer', fontSize: '0.8rem', borderRadius: '2px',
                              }}>▼</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}

                {/* raumnotizen */}
                {tab === 'räume' && (
                  <>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                      RAUMNOTIZEN ({roomNotes.length})
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                      <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                        placeholder={`Notiz zu ${selected.name} (Heizung kaputt, Beamer spinnt, guter Raum...)`}
                        rows={2} style={{ ...inp, resize: 'vertical', marginBottom: '0.75rem' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                          {authorName ? <>als <strong style={{ color: 'var(--text)' }}>{authorName}</strong></> : <span style={{ color: 'var(--red)' }}>Name oben eingeben</span>}
                        </span>
                        <button onClick={submitNote} disabled={submitting || !newNote.trim() || !authorName} style={{
                          background: submitting || !newNote.trim() || !authorName ? 'var(--surface3)' : 'var(--accent)',
                          color: '#fff', border: 'none', padding: '0.5rem 1rem',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          letterSpacing: '0.08em', borderRadius: '2px',
                        }}>EINTRAGEN →</button>
                      </div>
                    </div>

                    {roomNotes.length === 0 ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: '1rem 0' }}>Noch keine Notizen zu diesem Raum.</div>
                    ) : roomNotes.map(n => (
                      <div key={n.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--blue)', padding: '1.1rem', marginBottom: '0.6rem', borderRadius: '2px' }}>
                        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>{n.text}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
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
