'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.ok) {
        sessionStorage.setItem('untis_user', username)
        sessionStorage.setItem('untis_pass', password)
        router.push('/dashboard')
      } else {
        setError('Login fehlgeschlagen — Credentials prüfen.')
      }
    } catch {
      setError('Verbindungsfehler.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    padding: '1rem 1.25rem',
    fontSize: '1rem',
    marginBottom: '1rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--dark)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--red)', marginBottom: '0.75rem' }}>
          GYDO // SCHULBOARD
        </div>
        <div style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Gydo<span style={{ color: 'var(--red)' }}>Helper</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
          Stundenplan · Hausaufgaben · Lehrer · Tracker
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '2.5rem',
      }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '2rem' }}>
          WEBUNTIS LOGIN
        </div>

        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={inputStyle}
        />

        {error && (
          <div style={{
            color: 'var(--red)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            borderLeft: '2px solid var(--red)',
            paddingLeft: '0.75rem',
          }}>{error}</div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'var(--border)' : 'var(--red)',
            color: '#fff',
            border: 'none',
            padding: '1rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'VERBINDE...' : 'EINLOGGEN →'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--muted2)', letterSpacing: '0.1em' }}>
        gydo.webuntis.com
      </div>
    </div>
  )
}
