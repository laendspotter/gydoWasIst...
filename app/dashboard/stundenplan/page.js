'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, parseUntisTime, isCancelled, isSubstitution, dayLabel } from '../../../lib/untis'
import { glass } from '../../../lib/styles'
import { getNavFromEntrance, getNavBetween, lookupRoom } from '../../../lib/rooms'

const mono = { fontFamily: 'IBM Plex Mono, monospace' }

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
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p, otp })
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
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#1a0e02', marginBottom: '0.4rem', ...mono }}>Stundenplan</div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(60,35,10,0.55)', marginBottom: '1.75rem', ...mono }}>
          inkl. Wegbeschreibungen vom Haupteingang
        </div>

        {loading ? (
          <div style={{ color: 'rgba(80,50,15,0.5)', textAlign: 'center', padding: '4rem', animation: 'pulse 1.5s infinite', ...mono }}>LADE...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
              {dayObjects.map(d => (
                <button key={d.dateInt} onClick={() => setSelectedDay(d.dateInt)} style={{
                  padding: '0.45rem 0.9rem',
                  background: d.dateInt === activeDayInt ? 'linear-gradient(135deg,#b84d00,#e07828)' : 'rgba(255,248,225,0.65)',
                  border: `1px solid ${d.dateInt === activeDayInt ? 'transparent' : 'rgba(200,155,80,0.3)'}`,
                  color: d.dateInt === activeDayInt ? '#fff' : 'rgba(70,42,12,0.65)',
                  fontSize: '0.68rem', cursor: 'pointer', whiteSpace: 'nowrap',
                  letterSpacing: '0.08em', borderRadius: '7px', ...mono,
                }}>{dayLabel(d.date)}</button>
              ))}
            </div>

            {!activeDay || activeDay.lessons.length === 0 ? (
              <div style={{ color: 'rgba(80,50,15,0.45)', fontSize: '1rem', padding: '2rem 0', ...mono }}>Keine Stunden an diesem Tag.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeDay.lessons.map((l, i) => {
                  const cancelled = isCancelled(l)
                  const sub = !cancelled && isSubstitution(l)
                  const roomName = l.ro?.[0]?.name && l.ro[0].name !== '---' ? l.ro[0].name : null
                  const roomInfo = roomName ? lookupRoom(roomName) : null
                  const navFromEntrance = roomName ? getNavFromEntrance(roomName) : null

                  // Navigation zur nächsten Stunde
                  const nextLesson = activeDay.lessons.slice(i + 1).find(n => !isCancelled(n))
                  const nextRoom = nextLesson?.ro?.[0]?.name && nextLesson.ro[0].name !== '---' ? nextLesson.ro[0].name : null
                  const navNext = (roomName && nextRoom) ? getNavBetween(roomName, nextRoom) : null

                  return (
                    <div key={i}>
                      <div style={{
                        ...glass,
                        borderLeft: `3px solid ${cancelled ? 'rgba(160,80,0,0.2)' : sub ? '#ca8a04' : '#c05a00'}`,
                        padding: '1rem 1.25rem',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', opacity: cancelled ? 0.5 : 1,
                        gap: '1rem', borderRadius: '10px',
                      }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flex: 1 }}>
                          <div style={{ textAlign: 'right', minWidth: '3.2rem', paddingTop: '0.1rem' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#c05a00', ...mono }}>{parseUntisTime(l.startTime)}</div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(70,42,12,0.5)', ...mono }}>{parseUntisTime(l.endTime)}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, textDecoration: cancelled ? 'line-through' : 'none', color: '#1a0e02', ...mono }}>
                              {l.su?.[0]?.longName || l.su?.[0]?.name || '—'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(70,42,12,0.55)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', ...mono }}>
                              {l.te?.[0]?.name && l.te[0].name !== '---' && <span>{l.te[0].name}</span>}
                              {roomName && (
                                <span style={{ color: '#b05000', fontWeight: 600 }}>
                                  {roomName}
                                  {roomInfo && <span style={{ fontWeight: 400, opacity: 0.7 }}> · {['EG','1.OG','2.OG'][roomInfo.floor]}</span>}
                                </span>
                              )}
                              {l.lstext && <span style={{ color: sub ? '#ca8a04' : 'rgba(70,42,12,0.5)' }}>{l.lstext}</span>}
                            </div>
                            {/* Wegbeschreibung vom Eingang */}
                            {navFromEntrance && !cancelled && (
                              <div style={{ marginTop: '0.45rem', fontSize: '0.65rem', color: 'rgba(70,42,12,0.5)', background: 'rgba(200,155,80,0.1)', padding: '0.3rem 0.55rem', borderRadius: '5px', ...mono }}>
                                🚶 {navFromEntrance}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, paddingTop: '0.15rem' }}>
                          {cancelled && <span style={{ background: '#c0392b', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.45rem', borderRadius: '4px', ...mono }}>ENTFALL</span>}
                          {sub && <span style={{ background: '#ca8a04', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.45rem', borderRadius: '4px', ...mono }}>VERTR.</span>}
                        </div>
                      </div>

                      {/* Navigation zur nächsten Stunde */}
                      {navNext && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 1.4rem', fontSize: '0.62rem', color: 'rgba(70,42,12,0.45)', ...mono }}>
                          <span>↓</span>
                          <span style={{ background: 'rgba(200,155,80,0.12)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                            {navNext}
                          </span>
                        </div>
                      )}
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
