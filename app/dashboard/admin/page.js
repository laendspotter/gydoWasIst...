'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
const glass = { background: 'rgba(255,250,235,0.78)', border: '1px solid rgba(220,175,100,0.45)', borderRadius: '14px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 4px 24px rgba(120,60,10,0.1)' }
const glassSubtle = { background: 'rgba(255,248,225,0.62)', border: '1px solid rgba(200,155,80,0.3)', borderRadius: '10px', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }
const btnPrimary = { background: 'linear-gradient(135deg, #b84d00, #e07828)', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.09em', cursor: 'pointer', borderRadius: '8px', boxShadow: '0 3px 12px rgba(160,80,0,0.28)', fontFamily: 'IBM Plex Mono, monospace' }
const pageWrap = { position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '2rem' }
const pageTitle = { fontSize: '1.9rem', fontWeight: 700, color: '#1a0e02', fontFamily: 'IBM Plex Mono, monospace' }

const ADMIN_USERS = ['joshua.bohat', 'benjamin.kuebler']

export default function AdminPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [clock, setClock] = useState('')
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [notes, setNotes] = useState([])
  const [tab, setTab] = useState('quotes') // quotes | rooms | reset
  const [resetMsg, setResetMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [searchT, setSearchT] = useState('')
  const [searchR, setSearchR] = useState('')

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    if (!ADMIN_USERS.includes(u)) { router.push('/dashboard'); return }
    setUsername(u)

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

  const loadQuotes = async (t) => {
    setSelectedTeacher(t)
    setQuotes([])
    const res = await fetch(`/api/quotes?teacherId=${t.id}`)
    const d = await res.json()
    setQuotes(d.quotes || [])
  }

  const loadNotes = async (r) => {
    setSelectedRoom(r)
    setNotes([])
    const res = await fetch(`/api/rooms?roomId=${r.id}`)
    const d = await res.json()
    setNotes(d.notes || [])
  }

  const deleteQuote = async (quoteId) => {
    if (!selectedTeacher) return
    setDeleting(quoteId)
    const res = await fetch('/api/quotes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: selectedTeacher.id, quoteId, adminUser: username })
    })
    const d = await res.json()
    if (d.ok) setQuotes(q => q.filter(x => x.id !== quoteId))
    setDeleting(null)
  }

  const deleteNote = async (noteId) => {
    if (!selectedRoom) return
    setDeleting(noteId)
    const res = await fetch('/api/rooms', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoom.id, noteId, adminUser: username })
    })
    const d = await res.json()
    if (d.ok) setNotes(n => n.filter(x => x.id !== noteId))
    setDeleting(null)
  }

  const doReset = async () => {
    if (!confirm('Halbjahres-Reset wirklich starten? Löscht ALLE Zitate < 10 Upvotes + alle Raumnotizen!')) return
    setResetting(true)
    setResetMsg('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUser: username, action: 'halbjahr_reset' })
    })
    const d = await res.json()
    setResetMsg(d.message || d.error || 'Fehler')
    setResetting(false)
  }

  const card = { ...glass, padding: '1.5rem', marginBottom: '1rem' }
  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setSelectedTeacher(null); setSelectedRoom(null) }} style={{
      padding: '0.5rem 1.1rem',
      background: tab === id ? 'linear-gradient(135deg,#b84d00,#e07828)' : 'rgba(200,150,80,0.12)',
      border: `1px solid ${tab === id ? 'transparent' : 'rgba(200,150,80,0.3)'}`,
      color: tab === id ? '#fff' : 'rgba(80,45,10,0.7)',
      fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '0.1em',
      borderRadius: '8px', fontWeight: tab === id ? 700 : 400,
      fontFamily: 'IBM Plex Mono, monospace',
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ ...pageWrap, maxWidth: '1200px' }}>
        <div style={pageTitle}>⚙ Admin</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(60,35,10,0.5)', marginBottom: '1.75rem', fontFamily: 'IBM Plex Mono, monospace' }}>
          nur für {ADMIN_USERS.join(' + ')} — du bist eingeloggt als <strong style={{ color: '#c05a00' }}>{username}</strong>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <TabBtn id="quotes" label="ZITATE" />
          <TabBtn id="rooms" label="RAUMNOTIZEN" />
          <TabBtn id="reset" label="HALBJAHRES-RESET" />
        </div>

        {loading ? (
          <div style={{ color: 'rgba(80,50,15,0.5)', padding: '3rem', textAlign: 'center', animation: 'pulse 1.5s infinite' }}>LADE...</div>
        ) : tab === 'reset' ? (
          /* ── RESET TAB ── */
          <div style={card}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(150,80,20,0.7)', marginBottom: '1.25rem' }}>HALBJAHRES-RESET</div>
            <div style={{ fontSize: '0.9rem', color: '#2d1a04', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Löscht nach jedem Halbjahr alle Zitate mit weniger als <strong>10 Upvotes</strong>.<br />
              Alle Raumnotizen werden komplett geleert.<br />
              <span style={{ color: 'rgba(80,50,15,0.6)', fontSize: '0.78rem' }}>Zitate mit ≥10 Upvotes bleiben dauerhaft erhalten.</span>
            </div>

            {resetMsg && (
              <div style={{
                ...glassSubtle, padding: '1rem 1.25rem', marginBottom: '1.25rem',
                borderLeft: '3px solid #16a34a', color: '#14532d', fontSize: '0.82rem',
              }}>
                ✓ {resetMsg}
              </div>
            )}

            <button onClick={doReset} disabled={resetting} style={{
              ...btnPrimary,
              background: resetting ? 'rgba(150,80,20,0.3)' : 'linear-gradient(135deg,#7f1d1d,#b91c1c)',
              boxShadow: '0 3px 12px rgba(180,30,30,0.28)',
              cursor: resetting ? 'not-allowed' : 'pointer',
              padding: '0.75rem 1.75rem',
            }}>
              {resetting ? 'RESET LÄUFT...' : '⚠ HALBJAHRES-RESET STARTEN'}
            </button>
          </div>

        ) : tab === 'quotes' ? (
          /* ── QUOTES TAB ── */
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem' }}>
            <div>
              <input value={searchT} onChange={e => setSearchT(e.target.value)}
                placeholder="Lehrer suchen..."
                style={{ width: '100%', background: 'rgba(255,245,215,0.6)', border: '1px solid rgba(190,140,60,0.3)', color: '#2d1a04', padding: '0.65rem 0.9rem', fontSize: '0.82rem', outline: 'none', borderRadius: '8px', marginBottom: '0.75rem', fontFamily: 'IBM Plex Mono, monospace' }} />
              <div style={{ maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {teachers.filter(t => (t.name || '').toLowerCase().includes(searchT.toLowerCase())).map(t => (
                  <button key={t.id} onClick={() => loadQuotes(t)} style={{
                    background: selectedTeacher?.id === t.id ? 'rgba(192,90,0,0.15)' : 'rgba(255,248,225,0.6)',
                    border: `1px solid ${selectedTeacher?.id === t.id ? 'rgba(192,90,0,0.5)' : 'rgba(200,155,80,0.25)'}`,
                    borderLeft: `3px solid ${selectedTeacher?.id === t.id ? '#c05a00' : 'transparent'}`,
                    color: '#2d1a04', padding: '0.7rem 0.9rem', cursor: 'pointer',
                    textAlign: 'left', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'IBM Plex Mono, monospace',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.name}</div>
                      {t.longName && <div style={{ fontSize: '0.68rem', color: 'rgba(80,50,15,0.55)', marginTop: '0.1rem' }}>{t.longName}</div>}
                    </div>
                    <span style={{ color: '#c05a00' }}>›</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {!selectedTeacher ? (
                <div style={{ ...glassSubtle, padding: '2rem', textAlign: 'center', color: 'rgba(80,50,15,0.45)', fontSize: '0.85rem' }}>
                  Lehrer auswählen um Zitate zu verwalten
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(80,50,15,0.5)', marginBottom: '0.75rem' }}>
                    ZITATE VON {selectedTeacher.name?.toUpperCase()} ({quotes.length})
                  </div>
                  {quotes.length === 0 ? (
                    <div style={{ color: 'rgba(80,50,15,0.45)', fontSize: '0.85rem', padding: '1rem 0' }}>Keine Zitate.</div>
                  ) : quotes.map(q => (
                    <div key={q.id} style={{
                      ...glassSubtle, padding: '1rem 1.25rem', marginBottom: '0.6rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '0.35rem', color: '#2d1a04' }}>
                          „{q.text}"
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(80,50,15,0.55)' }}>
                          von <strong>{q.authorName}</strong> · {new Date(q.createdAt).toLocaleDateString('de-DE')}
                          {' · '}
                          <span style={{ color: q.upvotes - q.downvotes > 0 ? '#16a34a' : q.upvotes - q.downvotes < 0 ? '#c0392b' : 'rgba(80,50,15,0.5)' }}>
                            {q.upvotes - q.downvotes > 0 ? '+' : ''}{q.upvotes - q.downvotes} Punkte
                          </span>
                          {q.upvotes >= 10 && <span style={{ color: '#c05a00', marginLeft: '0.35rem' }}>⭐ bleibt beim Reset</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteQuote(q.id)} disabled={deleting === q.id} style={{
                        background: 'rgba(180,30,30,0.12)', border: '1px solid rgba(180,30,30,0.3)',
                        color: '#c0392b', padding: '0.35rem 0.7rem', fontSize: '0.68rem',
                        cursor: 'pointer', borderRadius: '6px', flexShrink: 0, fontFamily: 'IBM Plex Mono, monospace',
                      }}>
                        {deleting === q.id ? '...' : '✕ LÖSCHEN'}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        ) : (
          /* ── ROOMS TAB ── */
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem' }}>
            <div>
              <input value={searchR} onChange={e => setSearchR(e.target.value)}
                placeholder="Raum suchen..."
                style={{ width: '100%', background: 'rgba(255,245,215,0.6)', border: '1px solid rgba(190,140,60,0.3)', color: '#2d1a04', padding: '0.65rem 0.9rem', fontSize: '0.82rem', outline: 'none', borderRadius: '8px', marginBottom: '0.75rem', fontFamily: 'IBM Plex Mono, monospace' }} />
              <div style={{ maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {rooms.filter(r => (r.name || '').toLowerCase().includes(searchR.toLowerCase())).map(r => (
                  <button key={r.id} onClick={() => loadNotes(r)} style={{
                    background: selectedRoom?.id === r.id ? 'rgba(192,90,0,0.15)' : 'rgba(255,248,225,0.6)',
                    border: `1px solid ${selectedRoom?.id === r.id ? 'rgba(192,90,0,0.5)' : 'rgba(200,155,80,0.25)'}`,
                    borderLeft: `3px solid ${selectedRoom?.id === r.id ? '#c05a00' : 'transparent'}`,
                    color: '#2d1a04', padding: '0.7rem 0.9rem', cursor: 'pointer',
                    textAlign: 'left', borderRadius: '8px', fontSize: '0.82rem', fontFamily: 'IBM Plex Mono, monospace',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <span style={{ color: '#c05a00' }}>›</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {!selectedRoom ? (
                <div style={{ ...glassSubtle, padding: '2rem', textAlign: 'center', color: 'rgba(80,50,15,0.45)', fontSize: '0.85rem' }}>
                  Raum auswählen um Notizen zu verwalten
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(80,50,15,0.5)', marginBottom: '0.75rem' }}>
                    NOTIZEN IN {selectedRoom.name?.toUpperCase()} ({notes.length})
                  </div>
                  {notes.length === 0 ? (
                    <div style={{ color: 'rgba(80,50,15,0.45)', fontSize: '0.85rem', padding: '1rem 0' }}>Keine Notizen.</div>
                  ) : notes.map(n => (
                    <div key={n.id} style={{
                      ...glassSubtle, padding: '1rem 1.25rem', marginBottom: '0.6rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.3rem', color: '#2d1a04' }}>{n.text}</div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(80,50,15,0.55)' }}>
                          von <strong>{n.authorName}</strong> · {new Date(n.createdAt).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <button onClick={() => deleteNote(n.id)} disabled={deleting === n.id} style={{
                        background: 'rgba(180,30,30,0.12)', border: '1px solid rgba(180,30,30,0.3)',
                        color: '#c0392b', padding: '0.35rem 0.7rem', fontSize: '0.68rem',
                        cursor: 'pointer', borderRadius: '6px', flexShrink: 0, fontFamily: 'IBM Plex Mono, monospace',
                      }}>
                        {deleting === n.id ? '...' : '✕ LÖSCHEN'}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
