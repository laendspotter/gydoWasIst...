'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { path: '/dashboard', label: 'ÜBERSICHT', exact: true },
  { path: '/dashboard/stundenplan', label: 'STUNDENPLAN' },
  { path: '/dashboard/hausaufgaben', label: 'HAUSAUFGABEN' },
  { path: '/dashboard/termine', label: 'TERMINE' },
  { path: '/dashboard/tracker', label: 'TRACKER' },
  { path: '/dashboard/lehrer', label: 'LEHRER & RÄUME' },
]

export default function DashNav({ username, clock }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = () => {
    sessionStorage.clear()
    router.push('/')
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Gydo<span style={{ color: 'var(--red)' }}>Helper</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>GYDO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {clock && (
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--red)', letterSpacing: '0.05em' }}>
              {clock}
            </span>
          )}
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{username}</span>
          <button onClick={logout} style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            padding: '0.4rem 0.8rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}>LOGOUT</button>
        </div>
      </div>

      {/* tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '0 2rem',
        gap: '0',
      }}>
        {TABS.map(tab => {
          const active = tab.exact ? pathname === tab.path : pathname.startsWith(tab.path)
          return (
            <Link key={tab.path} href={tab.path} style={{
              padding: '0.9rem 1.25rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: active ? 'var(--text)' : 'var(--muted)',
              borderBottom: active ? '2px solid var(--red)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            }}>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
