'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, parseUntisTime, isCancelled, dayLabel } from '../../../lib/untis'

// Raum-Koordinaten für das gydo-schulgebäude (schätzung, anpassbar)
// x/y in % des Grundrisses, name = Raumname
const ROOM_POSITIONS = {
  // EG
  'A001': { x: 15, y: 75, floor: 'EG', label: 'A001' },
  'A002': { x: 25, y: 75, floor: 'EG', label: 'A002' },
  'A003': { x: 35, y: 75, floor: 'EG', label: 'A003' },
  'A004': { x: 45, y: 75, floor: 'EG', label: 'A004' },
  'B001': { x: 55, y: 75, floor: 'EG', label: 'B001' },
  'B002': { x: 65, y: 75, floor: 'EG', label: 'B002' },
  'TH': { x: 80, y: 80, floor: 'EG', label: 'Turnhalle' },
  'MENSA': { x: 80, y: 60, floor: 'EG', label: 'Mensa' },
  // OG1
  'A101': { x: 15, y: 30, floor: 'OG1', label: 'A101' },
  'A102': { x: 25, y: 30, floor: 'OG1', label: 'A102' },
  'A103': { x: 35, y: 30, floor: 'OG1', label: 'A103' },
  'A104': { x: 45, y: 30, floor: 'OG1', label: 'A104' },
  'B101': { x: 55, y: 30, floor: 'OG1', label: 'B101' },
  'B102': { x: 65, y: 30, floor: 'OG1', label: 'B102' },
  'B103': { x: 75, y: 30, floor: 'OG1', label: 'B103' },
  // OG2
  'A201': { x: 15, y: 30, floor: 'OG2', label: 'A201' },
  'A202': { x: 25, y: 30, floor: 'OG2', label: 'A202' },
  'B201': { x: 55, y: 30, floor: 'OG2', label: 'B201' },
  'B202': { x: 65, y: 30, floor: 'OG2', label: 'B202' },
}

function matchRoom(roomName) {
  if (!roomName) return null
  const upper = roomName.toUpperCase().replace(/\s/g, '')
  return ROOM_POSITIONS[upper] || null
}

export default function Karte() {
  const router = useRouter()
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState('OG1')
  const [hoveredLesson, setHoveredLesson] = useState(null)
  const [allRooms, setAllRooms] = useState([]) // alle räume aus webuntis

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    const p = sessionStorage.getItem('untis_pass')
    const otp = sessionStorage.getItem('untis_otp')
    if (!u || !p) { router.push('/'); return }
    setUsername(u)

    Promise.all([
      fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p, otp })
      }).then(r => r.json()),
      fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p, otp })
      }).then(r => r.json()),
    ]).then(([tt, tr]) => {
      setTimetable(tt.timetable || [])
      setAllRooms(tr.rooms || [])
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
  const dayLessons = activeDay?.lessons.filter(l => !isCancelled(l)) || []

  // jede stunde, die einen raum hat
  const lessonsWithRoom = dayLessons.filter(l => l.ro?.[0]?.name && l.ro[0].name !== '---')

  // aktuell laufende stunde
  const nowTime = parseInt(now.toTimeString().slice(0, 5).replace(':', ''))
  const currentLesson = lessonsWithRoom.find(l => l.startTime <= nowTime && l.endTime >= nowTime)

  const floors = ['EG', 'OG1', 'OG2']

  // räume auf der aktuellen etage die heute belegt sind
  const floorLessons = lessonsWithRoom.filter(l => {
    const pos = matchRoom(l.ro[0].name)
    return pos?.floor === selectedFloor
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Schulkarte</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '2rem' }}>
          interaktiv — welche stunde ist heute in welchem raum
        </div>

        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem', animation: 'pulse 1.5s infinite' }}>LADE...</div>
        ) : (
          <>
            {/* tag + etage auswahl */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
                {dayObjects.map(d => (
                  <button key={d.dateInt} onClick={() => setSelectedDay(d.dateInt)} style={{
                    padding: '0.45rem 0.9rem',
                    background: d.dateInt === activeDayInt ? 'var(--accent)' : 'var(--surface)',
                    border: `1px solid ${d.dateInt === activeDayInt ? 'var(--accent)' : 'var(--border)'}`,
                    color: d.dateInt === activeDayInt ? '#fff' : 'var(--muted)',
                    fontSize: '0.7rem', cursor: 'pointer', borderRadius: '2px',
                  }}>{dayLabel(d.date)}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {floors.map(f => (
                  <button key={f} onClick={() => setSelectedFloor(f)} style={{
                    padding: '0.45rem 0.9rem',
                    background: selectedFloor === f ? 'var(--surface3)' : 'var(--surface)',
                    border: `1px solid ${selectedFloor === f ? 'var(--accent)' : 'var(--border)'}`,
                    color: selectedFloor === f ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '0.7rem', cursor: 'pointer', borderRadius: '2px',
                  }}>{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
              {/* karte */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1rem', position: 'relative' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                  GRUNDRISS — {selectedFloor} — {lessonsWithRoom.length} STUNDEN HEUTE
                </div>

                {/* gebäude-grundriss (schematisch) */}
                <div style={{ position: 'relative', width: '100%', paddingBottom: '55%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: '2px', overflow: 'hidden' }}>
                  {/* flur */}
                  <div style={{ position: 'absolute', left: '8%', right: '8%', top: '45%', height: '10%', background: 'var(--surface3)', border: '1px solid var(--border)' }} />
                  {/* flur-label */}
                  <div style={{ position: 'absolute', left: '50%', top: '48%', transform: 'translateX(-50%)', fontSize: '0.55rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>FLUR</div>

                  {/* alle positionen für diese etage anzeigen */}
                  {Object.entries(ROOM_POSITIONS)
                    .filter(([, pos]) => pos.floor === selectedFloor)
                    .map(([key, pos]) => {
                      const lesson = floorLessons.find(l => {
                        const rname = l.ro[0].name.toUpperCase().replace(/\s/g, '')
                        return rname === key
                      })
                      const isCurrent = currentLesson && lesson && currentLesson.ro?.[0]?.name === lesson.ro?.[0]?.name
                      const isHovered = hoveredLesson?.ro?.[0]?.name === lesson?.ro?.[0]?.name

                      return (
                        <div key={key}
                          onMouseEnter={() => lesson && setHoveredLesson(lesson)}
                          onMouseLeave={() => setHoveredLesson(null)}
                          style={{
                            position: 'absolute',
                            left: `${pos.x}%`, top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            width: lesson ? '52px' : '38px',
                            height: lesson ? '36px' : '28px',
                            background: lesson
                              ? (isCurrent ? 'var(--accent)' : isHovered ? 'var(--surface3)' : 'var(--accent-dim)')
                              : 'var(--surface)',
                            border: `1px solid ${lesson ? (isCurrent ? 'var(--accent)' : 'var(--accent)') : 'var(--border2)'}`,
                            borderRadius: '2px',
                            cursor: lesson ? 'pointer' : 'default',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s', zIndex: lesson ? 2 : 1,
                            opacity: lesson ? 1 : 0.4,
                          }}>
                          <div style={{ fontSize: '0.55rem', fontWeight: 700, color: lesson ? (isCurrent ? '#fff' : 'var(--accent)') : 'var(--muted)' }}>
                            {pos.label}
                          </div>
                          {lesson && (
                            <div style={{ fontSize: '0.5rem', color: isCurrent ? '#fff' : 'var(--text)', fontWeight: 600, marginTop: '1px' }}>
                              {lesson.su?.[0]?.name || '?'}
                            </div>
                          )}
                        </div>
                      )
                    })}

                  {/* tooltip */}
                  {hoveredLesson && (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--surface)', border: '1px solid var(--accent)',
                      padding: '0.5rem 0.75rem', borderRadius: '3px', fontSize: '0.7rem',
                      whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
                    }}>
                      <strong>{hoveredLesson.su?.[0]?.longName || hoveredLesson.su?.[0]?.name}</strong>
                      {' · '}{parseUntisTime(hoveredLesson.startTime)}–{parseUntisTime(hoveredLesson.endTime)}
                      {hoveredLesson.te?.[0]?.name && ` · ${hoveredLesson.te[0].name}`}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.65rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--accent)', display: 'inline-block', borderRadius: '1px', opacity: 0.3 }} />
                    belegt heute
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--accent)', display: 'inline-block', borderRadius: '1px' }} />
                    jetzt aktiv
                  </span>
                </div>
              </div>

              {/* stunden-liste */}
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                  STUNDENPLAN HEUTE
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                  {dayLessons.length === 0 ? (
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Keine Stunden.</div>
                  ) : dayLessons.map((l, i) => {
                    const isCurrent = currentLesson && l.startTime === currentLesson.startTime
                    const roomName = l.ro?.[0]?.name
                    const pos = roomName ? matchRoom(roomName) : null
                    return (
                      <div key={i}
                        onMouseEnter={() => roomName && setHoveredLesson(l)}
                        onMouseLeave={() => setHoveredLesson(null)}
                        style={{
                          background: isCurrent ? 'var(--accent-dim)' : 'var(--surface)',
                          border: `1px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                          borderLeft: `3px solid ${isCurrent ? 'var(--accent)' : 'var(--border)'}`,
                          padding: '0.75rem 1rem', borderRadius: '2px', cursor: roomName ? 'pointer' : 'default',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                              {l.su?.[0]?.name || '—'}
                              {isCurrent && <span style={{ marginLeft: '0.4rem', fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 400 }}>● JETZT</span>}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                              {parseUntisTime(l.startTime)}–{parseUntisTime(l.endTime)}
                              {l.te?.[0]?.name && ` · ${l.te[0].name}`}
                            </div>
                          </div>
                          {roomName && (
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: pos ? 'var(--accent)' : 'var(--muted)' }}>
                                {roomName}
                              </div>
                              {pos && <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{pos.floor}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: 'var(--muted2)' }}>
              💡 Raumkoordinaten sind schematisch — passen nicht zum echten grundriss, zeigen aber welche räume belegt sind.
              Falls du den echten grundriss kennst, können die positionen in karte/page.js angepasst werden.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
