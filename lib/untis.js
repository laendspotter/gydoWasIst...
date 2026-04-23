export function parseUntisDate(d) {
  const s = String(d)
  return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`)
}

export function parseUntisTime(t) {
  const s = String(t).padStart(4, '0')
  return `${s.slice(0,2)}:${s.slice(2,4)}`
}

export function formatDate(d) {
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

export function formatDateLong(d) {
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function isToday(d) {
  return d.toDateString() === new Date().toDateString()
}

export function isTomorrow(d) {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return d.toDateString() === t.toDateString()
}

export function isCancelled(l) {
  return l.code === 'cancelled'
}

export function isSubstitution(l) {
  return l.code === 'irregular' || (l.lstext && l.lstext.length > 0)
}

export function dayLabel(d) {
  if (isToday(d)) return 'HEUTE'
  if (isTomorrow(d)) return 'MORGEN'
  return formatDate(d)
}
