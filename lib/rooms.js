// Raumdaten Gymnasium Dornstetten — basierend auf echtem Grundriss

export const ROOMS = {
  // ── EG ──────────────────────────────────────────────────────
  '001': { floor: 0, color: '#3aa8a8' }, '002': { floor: 0, color: '#3aa8a8' },
  '003': { floor: 0, color: '#3aa8a8' }, '004': { floor: 0, color: '#e09a00' },
  '010': { floor: 0, color: '#9b5fc0' }, '011': { floor: 0, color: '#1a5c5c' },
  '015': { floor: 0, color: '#d05040' }, '016': { floor: 0, color: '#d05040' },
  '017': { floor: 0, color: '#6aaa6a' }, '018': { floor: 0, color: '#1a5c5c' },
  '021': { floor: 0, color: '#3aa8a8' }, '022': { floor: 0, color: '#3aa8a8' },
  '023': { floor: 0, color: '#3aa8a8' }, '024': { floor: 0, color: '#d05040' },
  '025': { floor: 0, color: '#d05040' }, '026': { floor: 0, color: '#9b5fc0' },
  // ── 1.OG ────────────────────────────────────────────────────
  '101': { floor: 1, color: '#e09a00' }, '102': { floor: 1, color: '#e09a00' },
  '103': { floor: 1, color: '#e09a00' }, '104': { floor: 1, color: '#e09a00' },
  '105': { floor: 1, color: '#e09a00' }, '106': { floor: 1, color: '#3aa8a8' },
  '107': { floor: 1, color: '#3aa8a8' }, '108': { floor: 1, color: '#3aa8a8' },
  '109': { floor: 1, color: '#e09a00' }, '112': { floor: 1, color: '#3aa8a8' },
  '113': { floor: 1, color: '#3aa8a8' }, '114': { floor: 1, color: '#3aa8a8' },
  '115': { floor: 1, color: '#d05040' }, '116': { floor: 1, color: '#9b5fc0' },
  '117': { floor: 1, color: '#d05040' }, '118': { floor: 1, color: '#4080d0' },
  '119': { floor: 1, color: '#9b5fc0' }, '121': { floor: 1, color: '#3aa8a8' },
  '122': { floor: 1, color: '#3aa8a8' }, '123': { floor: 1, color: '#3aa8a8' },
  '124': { floor: 1, color: '#d05040' }, '125': { floor: 1, color: '#d05040' },
  '126': { floor: 1, color: '#d05040' },
  // ── 2.OG ────────────────────────────────────────────────────
  '200': { floor: 2, color: '#e09a00' }, '201': { floor: 2, color: '#3aa8a8' },
  '202': { floor: 2, color: '#3aa8a8' }, '204': { floor: 2, color: '#3aa8a8' },
  '205': { floor: 2, color: '#3aa8a8' }, '206': { floor: 2, color: '#3aa8a8' },
  '208': { floor: 2, color: '#e09a00' }, '209': { floor: 2, color: '#3aa8a8' },
}

const FLOOR_LABELS = { 0: 'EG', 1: '1.OG', 2: '2.OG' }

export function normalizeRoom(name) {
  if (!name) return null
  const digits = name.replace(/[^0-9]/g, '')
  if (!digits) return null
  // 3-stellig normalisieren (z.B. "1" → "001", "101" bleibt "101")
  return digits.padStart(3, '0').slice(-3)
}

export function lookupRoom(name) {
  const id = normalizeRoom(name)
  return id ? (ROOMS[id] ? { id, ...ROOMS[id] } : null) : null
}

export function getFloorLabel(floor) {
  return FLOOR_LABELS[floor] ?? `${floor}.OG`
}

// Wegbeschreibung vom Haupteingang zu einem Raum
const NAV_FROM_ENTRANCE = {
  '001': 'Eingang rein → Flur rechts halten → 001 (linke Seite)',
  '002': 'Eingang rein → Flur rechts → 002 (linke Seite)',
  '003': 'Eingang rein → Flur rechts → 003 (linke Seite)',
  '004': 'Eingang rein → Flur ganz nach rechts → 004 (Ende rechts)',
  '010': 'Eingang rein → Flur geradeaus → großer Raum 010 links',
  '011': 'Eingang rein → Flur hoch → rechter Flügel → 011',
  '015': 'Eingang rein → linker Flügel hoch → 015',
  '016': 'Eingang rein → linker Flügel → 016',
  '017': 'Eingang rein → linker Flügel unten → 017',
  '018': 'Eingang rein → linker Flügel ganz hoch, links → 018',
  '021': 'Eingang rein → Flur hoch → rechte Seite → 021',
  '022': 'Eingang rein → Flur hoch → rechte Seite → 022',
  '023': 'Eingang rein → Flur hoch → rechte Seite → 023',
  '024': 'Eingang rein → Flur hoch, rechter Flügel ganz rechts → 024',
  '025': 'Eingang rein → Flur hoch, rechter Flügel → 025',
  '026': 'Eingang rein → Flur hoch, rechter Flügel → 026',
  '101': 'Eingang → Aufzug/Treppe → 1.OG → Flur links → 101',
  '102': 'Eingang → Aufzug/Treppe → 1.OG → Flur links → 102',
  '103': 'Eingang → Aufzug/Treppe → 1.OG → Flur links → 103',
  '104': 'Eingang → Aufzug/Treppe → 1.OG → Flur links → 104 (groß)',
  '105': 'Eingang → Aufzug/Treppe → 1.OG → Flur → 105',
  '106': 'Eingang → Aufzug/Treppe → 1.OG → Flur rechts → 106',
  '107': 'Eingang → Aufzug/Treppe → 1.OG → Flur rechts → 107',
  '108': 'Eingang → Aufzug/Treppe → 1.OG → Flur rechts → 108',
  '109': 'Eingang → Aufzug/Treppe → 1.OG → Flur ganz rechts → 109',
  '112': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel Mitte → 112',
  '113': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel → 113',
  '114': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel → 114',
  '115': 'Eingang → Aufzug/Treppe → 1.OG → linker Flügel oben → 115',
  '116': 'Eingang → Aufzug/Treppe → 1.OG → linker Flügel → 116',
  '117': 'Eingang → Aufzug/Treppe → 1.OG → linker Flügel → 117',
  '118': 'Eingang → Aufzug/Treppe → 1.OG → linker Flügel unten → 118',
  '119': 'Eingang → Aufzug/Treppe → 1.OG → linker Flügel unten → 119',
  '121': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel rechts → 121',
  '122': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel rechts → 122',
  '123': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel ganz rechts → 123',
  '124': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel ganz rechts → 124',
  '125': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel rechts → 125',
  '126': 'Eingang → Aufzug/Treppe → 1.OG → oberer Flügel → 126',
  '200': 'Eingang → Aufzug/Treppe → 2.OG → Flur ganz links → 200',
  '201': 'Eingang → Aufzug/Treppe → 2.OG → Flur links → 201',
  '202': 'Eingang → Aufzug/Treppe → 2.OG → Flur → 202',
  '204': 'Eingang → Aufzug/Treppe → 2.OG → Flur → 204',
  '205': 'Eingang → Aufzug/Treppe → 2.OG → Flur → 205',
  '206': 'Eingang → Aufzug/Treppe → 2.OG → Flur rechts → 206',
  '208': 'Eingang → Aufzug/Treppe → 2.OG → Flur ganz rechts → 208',
  '209': 'Eingang → Aufzug/Treppe → 2.OG → linker Bereich → 209',
}

export function getNavFromEntrance(roomName) {
  const id = normalizeRoom(roomName)
  if (!id) return null
  return NAV_FROM_ENTRANCE[id] ?? null
}

export function getNavBetween(fromName, toName) {
  const fromId = normalizeRoom(fromName)
  const toId = normalizeRoom(toName)
  if (!fromId || !toId) return null
  if (fromId === toId) return null
  const from = ROOMS[fromId]
  const to = ROOMS[toId]
  if (!from || !to) return null

  if (from.floor === to.floor) {
    return `${getFloorLabel(to.floor)} · gleiche Etage → ${toName}`
  }
  const diff = to.floor - from.floor
  const dir = diff > 0 ? `${diff} Stock${diff > 1 ? 'werke' : 'werk'} hoch` : `${Math.abs(diff)} Stock${Math.abs(diff) > 1 ? 'werke' : 'werk'} runter`
  return `Aufzug/Treppe → ${dir} → ${getFloorLabel(to.floor)} → ${toName}`
}
