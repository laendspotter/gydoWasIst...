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
    background: 'rgba(255,248,228,0.78)',
    borderBottom: '1px solid rgba(200,150,80,0.3)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 20px rgba(120,60,10,0.1)',
  }

  return (
    <>
      {/* seasonal bg rendered behind everything */}
      <SeasonalBackground />

      <nav style={navStyle}>
        {/* top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1.75rem',
          borderBottom: '1px solid rgba(200,150,80,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a0e02' }}>
              Gydo<span style={{ color: '#c05a00' }}>Helper</span>
            </span>
            <span style={{ fontSize: '0.6rem', color: 'rgba(80,50,15,0.5)', letterSpacing: '0.12em' }}>GYDO</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            {clock && (
              <span style={{
                fontSize: '1.25rem', fontWeight: 700,
                color: '#c05a00', letterSpacing: '0.06em',
                fontVariantNumeric: 'tabular-nums',
              }}>{clock}</span>
            )}
            <span style={{ fontSize: '0.72rem', color: 'rgba(60,35,10,0.6)' }}>{username}</span>
            <button onClick={logout} style={{
              background: 'rgba(200,150,80,0.15)',
              border: '1px solid rgba(200,150,80,0.35)',
              color: 'rgba(80,45,10,0.7)',
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
                color: active ? '#c05a00' : 'rgba(70,42,12,0.55)',
                borderBottom: active ? '2px solid #c05a00' : '2px solid transparent',
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
