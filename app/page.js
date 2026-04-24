'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const SeasonalBackground = dynamic(() => import('../../components/SeasonalBackground'), { ssr: false })

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [needs2FA, setNeeds2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    if (!username || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, otp: otp || undefined })
      })
      const data = await res.json()
      if (data.ok) {
        sessionStorage.setItem('untis_user', username)
        sessionStorage.setItem('untis_pass', password)
        if (otp) sessionStorage.setItem('untis_otp', otp)
        router.push('/dashboard')
      } else if (data.needs2FA) {
        setNeeds2FA(true)
        setError('2FA-Code aus deiner App eingeben:')
      } else {
        setError(data.error || 'Login fehlgeschlagen — Credentials prüfen.')
      }
    } catch {
      setError('Verbindungsfehler.')
    }
    setLoading(false)
  }

  const inp = {
    width: '100%',
    background: 'rgba(255,245,220,0.55)',
    border: '1px solid rgba(200,150,80,0.3)',
    color: '#2d1a04',
    padding: '0.9rem 1.1rem',
    fontSize: '0.95rem',
    marginBottom: '0.75rem',
    outline: 'none',
    borderRadius: '8px',
    transition: 'border-color 0.15s',
    fontFamily: 'IBM Plex Mono, monospace',
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#c8e6f0' }}>
      <SeasonalBackground />

      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.68rem', letterSpacing: '0.3em',
            color: 'rgba(80,45,10,0.8)', marginBottom: '0.6rem',
            fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace',
          }}>
            GYDO // SCHULBOARD
          </div>
          <div style={{
            fontSize: '3rem', fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.02em', color: '#1a0e02',
            textShadow: '0 2px 16px rgba(255,255,255,0.5)',
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
            Gydo<span style={{ color: '#c05a00' }}>Helper</span>
          </div>
          <div style={{
            fontSize: '0.82rem', color: 'rgba(50,28,5,0.65)',
            marginTop: '0.5rem', fontFamily: 'IBM Plex Mono, monospace',
          }}>
            Stundenplan · Hausaufgaben · Zitate · Tracker
          </div>
        </div>

        <div style={{
          width: '100%', maxWidth: '400px',
          background: 'rgba(255, 248, 232, 0.78)',
          border: '1px solid rgba(255,220,160,0.7)',
          padding: '2rem', borderRadius: '18px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(120,70,10,0.18), 0 1px 0 rgba(255,255,255,0.6) inset',
        }}>
          <div style={{
            fontSize: '0.62rem', letterSpacing: '0.22em',
            color: 'rgba(120,70,15,0.65)', marginBottom: '1.5rem',
            fontFamily: 'IBM Plex Mono, monospace',
          }}>
            WEBUNTIS LOGIN
          </div>

          <input type="text" placeholder="Benutzername" value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => !needs2FA && e.key === 'Enter' && !password && null}
            style={inp} />
          <input type="password" placeholder="Passwort" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => !needs2FA && e.key === 'Enter' && handleLogin()}
            style={inp} />

          {needs2FA && (
            <input type="text" placeholder="2FA-Code (6-stellig)" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ ...inp, borderColor: '#c05a00' }}
              autoFocus maxLength={6} />
          )}

          {error && (
            <div style={{
              color: needs2FA ? '#c05a00' : '#b91c1c',
              fontSize: '0.78rem', marginBottom: '0.75rem',
              borderLeft: `2px solid ${needs2FA ? '#c05a00' : '#b91c1c'}`,
              paddingLeft: '0.75rem', fontFamily: 'IBM Plex Mono, monospace',
            }}>{error}</div>
          )}

          <button onClick={handleLogin}
            disabled={loading || (needs2FA && otp.length < 6)}
            style={{
              width: '100%',
              background: loading ? 'rgba(160,100,30,0.4)' : 'linear-gradient(135deg, #b84d00 0%, #e07828 100%)',
              color: '#fff', border: 'none', padding: '0.9rem',
              fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(160,80,0,0.32)',
              transition: 'all 0.15s', fontFamily: 'IBM Plex Mono, monospace',
            }}>
            {loading ? 'VERBINDE...' : needs2FA ? '2FA BESTÄTIGEN →' : 'EINLOGGEN →'}
          </button>
        </div>

        <div style={{
          marginTop: '1.5rem', fontSize: '0.62rem',
          color: 'rgba(50,30,5,0.45)', letterSpacing: '0.1em',
          fontFamily: 'IBM Plex Mono, monospace',
        }}>
          gydo.webuntis.com
        </div>
      </div>
    </div>
  )
}
