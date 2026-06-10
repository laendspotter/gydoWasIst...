'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'
import { parseUntisDate, parseUntisTime, isCancelled, dayLabel } from '../../../lib/untis'
import { normalizeRoom, lookupRoom, getNavFromEntrance, ROOMS } from '../../../lib/rooms'
import { glass, glassSubtle } from '../../../lib/styles'

const mono = { fontFamily: 'IBM Plex Mono, monospace' }

// ── SVG-Grundrisse ──────────────────────────────────────────────────────────

// Räume als {id, x, y, w, h} in einem 620×400 Koordinatensystem
const EG_ROOMS = [
  // Nord-Flügel oben
  { id: '018', x: 8,   y: 8,   w: 98,  h: 88  },
  { id: '015', x: 148, y: 8,   w: 78,  h: 68  },
  { id: '011', x: 270, y: 8,   w: 78,  h: 68  },
  { id: '026', x: 352, y: 8,   w: 78,  h: 68  },
  { id: '025', x: 434, y: 8,   w: 78,  h: 68  },
  { id: '024', x: 512, y: 8,   w: 100, h: 68  },
  // WC
  { id: 'WC1', x: 228, y: 8,   w: 40,  h: 44, special: 'WC',  color: '#3a74d0', label: 'WC' },
  // Linker Flügel
  { id: '016', x: 8,   y: 104, w: 98,  h: 88  },
  { id: '017', x: 8,   y: 196, w: 98,  h: 78  },
  // Mitte
  { id: '010', x: 148, y: 104, w: 122, h: 106 },
  { id: '021', x: 278, y: 104, w: 84,  h: 88  },
  { id: '022', x: 366, y: 104, w: 84,  h: 88  },
  { id: '023', x: 454, y: 104, w: 158, h: 88  },
  // Keller Bereich
  { id: 'WC2', x: 8,   y: 282, w: 68,  h: 82, special: 'WC',  color: '#3a74d0', label: 'WC' },
  { id: 'MENSA', x: 80, y: 282, w: 120, h: 82, special: true, color: '#7a7a8a', label: 'Mensa' },
  // Eingang-Flur + Süd-Zimmer
  { id: '001', x: 148, y: 310, w: 80,  h: 82  },
  { id: '002', x: 232, y: 310, w: 80,  h: 82  },
  { id: '003', x: 316, y: 310, w: 80,  h: 82  },
  { id: '004', x: 400, y: 310, w: 80,  h: 82  },
]

const OG1_ROOMS = [
  // Linker Flügel oben
  { id: '115', x: 8,   y: 8,   w: 98,  h: 110 },
  { id: '114', x: 118, y: 28,  w: 78,  h: 80  },
  { id: '113', x: 200, y: 28,  w: 78,  h: 80  },
  { id: '126', x: 282, y: 28,  w: 78,  h: 80  },
  { id: '125', x: 364, y: 28,  w: 78,  h: 80  },
  { id: '124', x: 446, y: 28,  w: 166, h: 80  },
  // Linker Flügel mitte
  { id: '116', x: 8,   y: 122, w: 98,  h: 88  },
  // WC + 112 Bereich
  { id: 'WC1', x: 118, y: 122, w: 48,  h: 80, special: 'WC', color: '#3a74d0', label: 'WC' },
  { id: '112', x: 170, y: 122, w: 108, h: 80  },
  { id: '121', x: 282, y: 122, w: 84,  h: 80  },
  { id: '122', x: 370, y: 122, w: 84,  h: 80  },
  { id: '123', x: 458, y: 122, w: 154, h: 80  },
  // Linker Flügel unten
  { id: '117', x: 8,   y: 214, w: 98,  h: 82  },
  { id: '118', x: 8,   y: 300, w: 60,  h: 62  },
  { id: '119', x: 72,  y: 300, w: 68,  h: 72  },
  // WC unten links
  { id: 'WC2', x: 8,   y: 344, w: 50,  h: 60, special: 'WC', color: '#3a74d0', label: 'WC' },
  // Süd-Korridor Zimmer
  { id: '101', x: 62,  y: 332, w: 60,  h: 70  },
  { id: '102', x: 126, y: 332, w: 60,  h: 70  },
  { id: '103', x: 190, y: 332, w: 60,  h: 70  },
  { id: '104', x: 254, y: 332, w: 100, h: 70  },
  { id: '105', x: 358, y: 332, w: 60,  h: 70  },
  { id: '106', x: 422, y: 332, w: 72,  h: 70  },
  { id: '107', x: 498, y: 332, w: 72,  h: 70  },
  { id: '108', x: 500, y: 250, w: 112, h: 78  },
  { id: '109', x: 538, y: 332, w: 74,  h: 70  },
]

const OG2_ROOMS = [
  // Aula-Bereich oben (unbenannt)
  { id: 'AULA', x: 148, y: 8,  w: 464, h: 90, special: true, color: '#e8e4d8', label: '' },
  { id: 'AULA2', x: 148, y: 102, w: 220, h: 80, special: true, color: '#e8e4d8', label: '' },
  // Linker Flügel
  { id: '209', x: 8,   y: 8,   w: 98,  h: 100 },
  // Aufzug-Bereich
  // Süd-Korridor
  { id: '200', x: 8,   y: 180, w: 80,  h: 80  },
  { id: '201', x: 92,  y: 180, w: 84,  h: 80  },
  { id: '202', x: 180, y: 180, w: 84,  h: 80  },
  { id: '204', x: 268, y: 180, w: 84,  h: 80  },
  { id: '205', x: 356, y: 180, w: 84,  h: 80  },
  { id: '206', x: 444, y: 180, w: 84,  h: 80  },
  { id: '208', x: 532, y: 180, w: 80,  h: 80  },
]

const FLOOR_DATA = {
  EG:   { rooms: EG_ROOMS,  vb: '0 0 620 405', label: 'EG · Erdgeschoss',   floorNum: 0 },
  '1OG': { rooms: OG1_ROOMS, vb: '0 0 620 415', label: '1.OG · Erstes OG',  floorNum: 1 },
  '2OG': { rooms: OG2_ROOMS, vb: '0 0 620 275', label: '2.OG · Zweites OG', floorNum: 2 },
}

const CORRIDOR_COLOR = '#b8d4a0'
const WALL_COLOR = '#2a1a08'

function FloorSVG({ floorKey, highlightIds = new Set(), onRoomClick }) {
  const { rooms, vb } = FLOOR_DATA[floorKey]
  return (
    <svg viewBox={vb} style={{ width: '100%', height: 'auto', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg">
      {/* background */}
      <rect width="2000" height="2000" fill="#f0ece4" />

      {/* corridors — approximated by floor */}
      {floorKey === 'EG' && <>
        <rect x="106" y="96"  width="506" height="16" fill={CORRIDOR_COLOR} />
        <rect x="106" y="296" width="380" height="16" fill={CORRIDOR_COLOR} />
        <rect x="106" y="96"  width="16"  height="216" fill={CORRIDOR_COLOR} />
      </>}
      {floorKey === '1OG' && <>
        <rect x="106" y="116" width="506" height="14" fill={CORRIDOR_COLOR} />
        <rect x="106" y="320" width="506" height="14" fill={CORRIDOR_COLOR} />
        <rect x="106" y="116" width="14"  height="206" fill={CORRIDOR_COLOR} />
      </>}
      {floorKey === '2OG' && <>
        <rect x="106" y="168" width="506" height="14" fill={CORRIDOR_COLOR} />
        <rect x="106" y="96"  width="14"  height="74"  fill={CORRIDOR_COLOR} />
      </>}

      {/* Eingang-Pfeil EG */}
      {floorKey === 'EG' && (
        <g>
          <polygon points="228,400 248,380 260,395 228,400" fill="#c0392b" opacity="0.8" />
          <text x="195" y="416" fontSize="10" fill="#c0392b" fontFamily="IBM Plex Mono, monospace" fontWeight="700">EINGANG</text>
        </g>
      )}

      {/* Aufzug-Symbol */}
      {(floorKey === 'EG' || floorKey === '1OG') && (
        <g>
          <rect x="112" y={floorKey === 'EG' ? 210 : 210} width="34" height="42" rx="3" fill="#1a5c40" opacity="0.85" />
          <text x="116" y={floorKey === 'EG' ? 234 : 234} fontSize="7" fill="white" fontFamily="IBM Plex Mono, monospace">Aufzug</text>
        </g>
      )}
      {floorKey === '2OG' && (
        <g>
          <rect x="112" y="112" width="34" height="42" rx="3" fill="#1a5c40" opacity="0.85" />
          <text x="116" y="136" fontSize="7" fill="white" fontFamily="IBM Plex Mono, monospace">Aufzug</text>
        </g>
      )}

      {/* Rooms */}
      {rooms.map(r => {
        const isHighlighted = highlightIds.has(r.id)
        const roomData = ROOMS[r.id]
        const color = r.color ?? roomData?.color ?? '#c8d4e0'
        const isSpecial = r.special
        const canClick = !isSpecial && roomData
        return (
          <g key={r.id} onClick={() => canClick && onRoomClick && onRoomClick(r.id)}
            style={{ cursor: canClick ? 'pointer' : 'default' }}>
            <rect
              x={r.x} y={r.y} width={r.w} height={r.h}
              rx="3"
              fill={isHighlighted ? '#ff6b35' : color}
              opacity={isHighlighted ? 1 : isSpecial ? 0.6 : 0.85}
              stroke={isHighlighted ? '#c04000' : WALL_COLOR}
              strokeWidth={isHighlighted ? 2.5 : 1.2}
            />
            <text
              x={r.x + r.w / 2} y={r.y + r.h / 2 + (isSpecial ? 4 : 5)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={r.w > 90 ? 13 : 11}
              fontWeight={isHighlighted ? '700' : '600'}
              fill={isHighlighted ? '#fff' : (isSpecial ? '#444' : '#fff')}
              fontFamily="IBM Plex Mono, monospace"
            >
              {r.label ?? r.id}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Hauptseite ──────────────────────────────────────────────────────────────

export default function Karte() {
  const router = useRouter()
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState('EG')
  const [selectedRoom, setSelectedRoom] = useState(null)

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
    lessons: timetable.filter(l => l.date === d && !isCancelled(l)).sort((a, b) => a.startTime - b.startTime)
  }))

  const now = new Date()
  const activeDayInt = selectedDay ?? (
    dayObjects.find(d => d.date.toDateString() === now.toDateString())?.dateInt ??
    dayObjects.find(d => d.date >= now)?.dateInt ??
    dayObjects[0]?.dateInt
  )
  const activeDay = dayObjects.find(d => d.dateInt === activeDayInt)
  const dayLessons = activeDay?.lessons.filter(l => l.ro?.[0]?.name && l.ro[0].name !== '---') || []

  // Raum-IDs die heute belegt sind (normalisiert)
  const todayRoomIds = new Set(dayLessons.map(l => normalizeRoom(l.ro?.[0]?.name)).filter(Boolean))

  const nowTime = parseInt(now.toTimeString().slice(0, 5).replace(':', ''))
  const currentLesson = dayLessons.find(l => l.startTime <= nowTime && l.endTime >= nowTime)
  const currentRoomId = currentLesson ? normalizeRoom(currentLesson.ro?.[0]?.name) : null

  // Alle Stunden mit Raum-Info für die Side-Liste
  const allDayLessons = activeDay?.lessons.filter(l => !isCancelled(l)) || []

  const floors = [
    { key: 'EG',  label: 'EG' },
    { key: '1OG', label: '1.OG' },
    { key: '2OG', label: '2.OG' },
  ]

  const selectedRoomLesson = selectedRoom
    ? dayLessons.find(l => normalizeRoom(l.ro?.[0]?.name) === selectedRoom)
    : null

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#1a0e02', ...mono }}>Schulkarte</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(60,35,10,0.55)', ...mono }}>echte Raumlagen — welche Stunde ist wo</div>
        </div>

        {loading ? (
          <div style={{ color: 'rgba(80,50,15,0.5)', textAlign: 'center', padding: '4rem', animation: 'pulse 1.5s infinite', ...mono }}>LADE...</div>
        ) : (
          <>
            {/* Tag + Etage Auswahl */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
                {dayObjects.map(d => (
                  <button key={d.dateInt} onClick={() => setSelectedDay(d.dateInt)} style={{
                    padding: '0.4rem 0.85rem',
                    background: d.dateInt === activeDayInt ? 'linear-gradient(135deg,#b84d00,#e07828)' : 'rgba(255,248,225,0.65)',
                    border: `1px solid ${d.dateInt === activeDayInt ? 'transparent' : 'rgba(200,155,80,0.3)'}`,
                    color: d.dateInt === activeDayInt ? '#fff' : 'rgba(70,42,12,0.65)',
                    fontSize: '0.68rem', cursor: 'pointer', borderRadius: '7px', ...mono,
                  }}>{dayLabel(d.date)}</button>
                ))}
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(200,155,80,0.3)' }} />
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {floors.map(f => (
                  <button key={f.key} onClick={() => setSelectedFloor(f.key)} style={{
                    padding: '0.4rem 0.85rem',
                    background: selectedFloor === f.key ? 'rgba(200,155,80,0.3)' : 'rgba(255,248,225,0.5)',
                    border: `1px solid ${selectedFloor === f.key ? 'rgba(180,120,40,0.6)' : 'rgba(200,155,80,0.25)'}`,
                    color: selectedFloor === f.key ? '#7a3500' : 'rgba(70,42,12,0.6)',
                    fontWeight: selectedFloor === f.key ? 700 : 400,
                    fontSize: '0.68rem', cursor: 'pointer', borderRadius: '7px', ...mono,
                  }}>{f.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>

              {/* SVG Grundriss */}
              <div style={{ ...glass, padding: '1rem', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(80,50,15,0.5)', marginBottom: '0.75rem', ...mono }}>
                  {FLOOR_DATA[selectedFloor].label.toUpperCase()} · {todayRoomIds.size} RÄUME HEUTE BELEGT
                </div>
                <FloorSVG
                  floorKey={selectedFloor}
                  highlightIds={todayRoomIds}
                  onRoomClick={id => setSelectedRoom(prev => prev === id ? null : id)}
                />
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1.25rem', fontSize: '0.62rem', color: 'rgba(80,50,15,0.5)', ...mono }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '10px', height: '10px', background: '#ff6b35', borderRadius: '2px', display: 'inline-block' }} />
                    heute belegt
                  </span>
                  <span>Raum anklicken für Navigation</span>
                </div>
              </div>

              {/* Side Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                {/* Angeklickter Raum */}
                {selectedRoom && (
                  <div style={{ ...glass, padding: '1.1rem', borderLeft: '3px solid #c05a00' }}>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(80,50,15,0.45)', marginBottom: '0.5rem', ...mono }}>RAUM</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a0e02', marginBottom: '0.5rem', ...mono }}>
                      {selectedRoom}
                      {selectedRoomLesson && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#c05a00', marginLeft: '0.5rem' }}>
                          {selectedRoomLesson.su?.[0]?.name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(70,42,12,0.7)', lineHeight: 1.6, ...mono }}>
                      {getNavFromEntrance(selectedRoom) ?? 'Wegbeschreibung nicht verfügbar'}
                    </div>
                    {selectedRoomLesson && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.68rem', color: 'rgba(70,42,12,0.55)', ...mono }}>
                        {parseUntisTime(selectedRoomLesson.startTime)}–{parseUntisTime(selectedRoomLesson.endTime)}
                        {selectedRoomLesson.te?.[0]?.name && ` · ${selectedRoomLesson.te[0].name}`}
                      </div>
                    )}
                  </div>
                )}

                {/* Stundenplan des Tages */}
                <div style={{ ...glass, padding: '1.1rem', flex: 1 }}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(80,50,15,0.45)', marginBottom: '0.85rem', ...mono }}>
                    STUNDENPLAN · {activeDay ? dayLabel(activeDay.date) : '—'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '480px', overflowY: 'auto' }}>
                    {allDayLessons.length === 0 ? (
                      <div style={{ color: 'rgba(80,50,15,0.4)', fontSize: '0.82rem', ...mono }}>Keine Stunden.</div>
                    ) : allDayLessons.map((l, i) => {
                      const roomName = l.ro?.[0]?.name
                      const roomId = normalizeRoom(roomName)
                      const room = roomId ? lookupRoom(roomName) : null
                      const isCurrent = currentLesson && l.startTime === currentLesson.startTime
                      const isThisFloor = room && (
                        (selectedFloor === 'EG' && room.floor === 0) ||
                        (selectedFloor === '1OG' && room.floor === 1) ||
                        (selectedFloor === '2OG' && room.floor === 2)
                      )
                      return (
                        <div key={i}
                          onClick={() => roomId && setSelectedRoom(prev => prev === roomId ? null : roomId)}
                          style={{
                            padding: '0.55rem 0.7rem',
                            background: isCurrent ? 'rgba(180,90,0,0.15)' : isThisFloor ? 'rgba(200,155,80,0.12)' : 'rgba(255,248,225,0.4)',
                            border: `1px solid ${isCurrent ? 'rgba(180,90,0,0.4)' : 'rgba(200,155,80,0.25)'}`,
                            borderLeft: `3px solid ${isCurrent ? '#c05a00' : roomName ? 'rgba(180,100,0,0.3)' : 'transparent'}`,
                            borderRadius: '7px',
                            cursor: roomId ? 'pointer' : 'default',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a0e02', ...mono }}>
                              {l.su?.[0]?.name || '—'}
                              {isCurrent && <span style={{ marginLeft: '0.4rem', fontSize: '0.58rem', color: '#c05a00' }}>● JETZT</span>}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(70,42,12,0.55)', marginTop: '0.1rem', ...mono }}>
                              {parseUntisTime(l.startTime)}–{parseUntisTime(l.endTime)}
                              {l.te?.[0]?.name && ` · ${l.te[0].name}`}
                            </div>
                          </div>
                          {roomName && (
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: room ? '#b05000' : 'rgba(70,42,12,0.4)', ...mono }}>{roomName}</div>
                              {room && <div style={{ fontSize: '0.58rem', color: 'rgba(70,42,12,0.45)', ...mono }}>
                                {['EG', '1.OG', '2.OG'][room.floor]}
                              </div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
