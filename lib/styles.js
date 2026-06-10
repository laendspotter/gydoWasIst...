// shared dark glass styles for dashboard pages

export const glass = {
  background: 'var(--glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: '14px',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  boxShadow: 'var(--shadow)',
}

export const glassSubtle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
}

export const inp = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text)',
  padding: '0.75rem 1rem',
  fontSize: '0.88rem',
  outline: 'none',
  borderRadius: '8px',
  fontFamily: 'IBM Plex Mono, monospace',
  transition: 'border-color 0.15s',
}

export const btnPrimary = {
  background: 'linear-gradient(135deg, #c05200, #e07828)',
  color: '#fff',
  border: 'none',
  padding: '0.6rem 1.25rem',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.09em',
  cursor: 'pointer',
  borderRadius: '8px',
  boxShadow: '0 3px 12px rgba(255,107,53,0.3)',
  fontFamily: 'IBM Plex Mono, monospace',
  transition: 'all 0.15s',
}

export const btnSecondary = {
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--muted)',
  border: '1px solid rgba(255,255,255,0.12)',
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
  fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text)',
}

export const pageSub = {
  fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.75rem',
}
