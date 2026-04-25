'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SeasonalBackground = dynamic(() => import('./SeasonalBackground'), { ssr: false })

const TABS = [
  { path: '/dashboard',              label: 'ÜBERSICHT',    exact: true },
  { path: '/dashboard/stundenplan',  label: 'STUNDENPLAN' },
  { path: '/dashboard/hausaufgaben', label: 'HAUSAUFGABEN' },
  { path: '/dashboard/termine',      label: 'TERMINE' },
  { path: '/dashboard/lehrer',       label: 'LEHRER & RÄUME' },
  { path: '/dashboard/karte',        label: 'KARTE' },
  { path: '/dashboard/zitate',       label: 'TOP ZITATE' },
  { path: '/dashboard/tracker',      label: 'TRACKER' },
]

const ADMIN_USERS = ['joshua.bohat', 'benjamin.kuebler']

export default function DashNav({ username, clock }) {
  const pathname = usePathname()
  const router   = useRouter()
  const isAdmin  = ADMIN_USERS.includes(username)

  const tabs = isAdmin
    ? [...TABS, { path: '/dashboard/admin', label: '⚙ ADMIN' }]
    : TABS

  const logout = () => { sessionStorage.clear(); router.push('/') }

  const navStyle = {
    background: 'rgba(13,13,15,0.82)',
    borderBottom: '1px solid rgba(255,107,53,0.2)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
  }

  return (
    <>
      <SeasonalBackground />

      <nav style={navStyle}>
        {/* top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1.75rem',
          borderBottom: '1px solid rgba(255,107,53,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
              Gydo<span style={{ color: 'var(--accent)' }}>Helper</span>
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.12em' }}>GYDO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            {clock && (
              <span style={{
                fontSize: '1.25rem', fontWeight: 700,
                color: 'var(--accent)', letterSpacing: '0.06em',
                fontVariantNumeric: 'tabular-nums',
              }}>{clock}</span>
            )}
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{username}</span>
            <button onClick={logout} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--muted)',
              padding: '0.3rem 0.75rem',
              fontSize: '0.65rem', cursor: 'pointer',
              letterSpacing: '0.1em', borderRadius: '6px',
              transition: 'all 0.15s',
            }}>LOGOUT</button>
          </div>
        </div>

        {/* tab bar */}
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 1.25rem' }}>
          {tabs.map(tab => {
            const active = tab.exact ? pathname === tab.path : pathname.startsWith(tab.path)
            return (
              <Link key={tab.path} href={tab.path} style={{
                padding: '0.7rem 0.9rem',
                fontSize: '0.65rem', letterSpacing: '0.09em',
                color: active ? 'var(--accent)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                whiteSpace: 'nowrap', transition: 'color 0.15s',
                fontWeight: active ? 700 : 400,
              }}>
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
