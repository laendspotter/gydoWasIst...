// shared glass/cozy styles for dashboard pages

export const glass = {
  background: 'rgba(255,250,235,0.78)',
  border: '1px solid rgba(220,175,100,0.45)',
  borderRadius: '14px',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  boxShadow: '0 4px 24px rgba(120,60,10,0.1), 0 1px 0 rgba(255,255,255,0.55) inset',
}

export const glassSubtle = {
  background: 'rgba(255,248,225,0.62)',
  border: '1px solid rgba(200,155,80,0.3)',
  borderRadius: '10px',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
}

export const inp = {
  width: '100%',
  background: 'rgba(255,245,215,0.6)',
  border: '1px solid rgba(190,140,60,0.3)',
  color: '#2d1a04',
  padding: '0.75rem 1rem',
  fontSize: '0.88rem',
  outline: 'none',
  borderRadius: '8px',
  fontFamily: 'IBM Plex Mono, monospace',
  transition: 'border-color 0.15s',
}

export const btnPrimary = {
  background: 'linear-gradient(135deg, #b84d00, #e07828)',
  color: '#fff',
  border: 'none',
  padding: '0.6rem 1.25rem',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.09em',
  cursor: 'pointer',
  borderRadius: '8px',
  boxShadow: '0 3px 12px rgba(160,80,0,0.28)',
  fontFamily: 'IBM Plex Mono, monospace',
  transition: 'all 0.15s',
}

export const btnSecondary = {
  background: 'rgba(200,150,80,0.15)',
  color: 'rgba(80,45,10,0.75)',
  border: '1px solid rgba(190,140,60,0.35)',
  padding: '0.55rem 1rem',
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  cursor: 'pointer',
  borderRadius: '7px',
  fontFamily: 'IBM Plex Mono, monospace',
}

// badge helper
export function badge(text, bg, fg = '#fff') {
  return { text, style: { background: bg, color: fg, fontSize: '0.6rem', fontWeight: 700, padding: '0.18rem 0.45rem', letterSpacing: '0.08em', borderRadius: '4px', whiteSpace: 'nowrap' } }
}

export const pageWrap = {
  position: 'relative', zIndex: 2,
  maxWidth: '1100px', margin: '0 auto', padding: '2rem',
}

export const pageTitle = {
  fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1a0e02',
}

export const pageSub = {
  fontSize: '0.78rem', color: 'rgba(60,35,10,0.55)', marginBottom: '1.75rem',
}
