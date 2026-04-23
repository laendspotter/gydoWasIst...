'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashNav from '../../../components/DashNav'

// gydo: klasse 5-12, 8 schuljahre
// ca. 30 schulwochen/jahr, 5 tage/woche, 6 stunden/tag à 45min
const SCHULJAHR_START = new Date('2018-09-01') // approximiert, anpassbar
const STUNDEN_PRO_TAG = 6
const TAGE_PRO_WOCHE = 5
const WOCHEN_PRO_JAHR = 34
const MINUTEN_PRO_STUNDE = 45
const SCHULJAHRE = 9 // klasse 5-13 gymnasium bw

export default function Tracker() {
  const router = useRouter()
  const [clock, setClock] = useState('')
  const [username, setUsername] = useState('')
  const [now, setNow] = useState(new Date())
  const [startYear, setStartYear] = useState(2018)

  useEffect(() => {
    const u = sessionStorage.getItem('untis_user')
    if (!u) { router.push('/'); return }
    setUsername(u)

    const tick = setInterval(() => {
      setClock(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setNow(new Date())
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  const schulbeginn = new Date(`${startYear}-09-01`)
  const schulende = new Date(`${startYear + SCHULJAHRE}-07-31`)

  // vergangene schulzeit in ms (nur werkstage approx)
  const msTotal = now - schulbeginn
  const tageTotal = Math.max(0, Math.floor(msTotal / (1000 * 60 * 60 * 24)))
  const wochenTotal = tageTotal / 7
  const schulwochenTotal = wochenTotal * (TAGE_PRO_WOCHE / 7) * 0.85 // ~85% echte schulwochen (abzgl. ferien)
  const stundenTotal = Math.floor(schulwochenTotal * TAGE_PRO_WOCHE * STUNDEN_PRO_TAG)
  const minutenTotal = stundenTotal * MINUTEN_PRO_STUNDE
  const lebenszeitProzent = ((minutenTotal / 60) / (24 * 365 * 80) * 100)

  // verbleibende schulzeit
  const msLeft = schulende - now
  const tageLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)))
  const wochenLeft = Math.floor(tageLeft / 7)
  const stundenLeft = Math.floor(wochenLeft * 0.85 * TAGE_PRO_WOCHE * STUNDEN_PRO_TAG)

  // "heute" noch
  const heuteStd = STUNDEN_PRO_TAG
  const heuteMins = heuteStd * MINUTEN_PRO_STUNDE

  const fmt = (n) => n.toLocaleString('de-DE')

  const statCard = (label, value, sub, color = 'var(--text)') => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>{label}</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)' }}>
      <DashNav username={username} clock={clock} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Schulstunden-Tracker</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>wie viel lebenszeit du schon in der schule verbracht hast. deprimierend, aber wahr.</div>
        </div>

        {/* schuljahr konfigurieren */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>EINSCHULUNG:</span>
          {[2016, 2017, 2018, 2019, 2020].map(y => (
            <button key={y} onClick={() => setStartYear(y)} style={{
              padding: '0.4rem 0.8rem',
              background: startYear === y ? 'var(--red)' : 'var(--surface2)',
              border: `1px solid ${startYear === y ? 'var(--red)' : 'var(--border)'}`,
              color: startYear === y ? '#fff' : 'var(--muted)',
              fontSize: '0.75rem', cursor: 'pointer',
            }}>{y}</button>
          ))}
        </div>

        {/* main stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {statCard('SCHULSTUNDEN BISHER', fmt(stundenTotal), `= ${fmt(minutenTotal)} Minuten`, 'var(--red)')}
          {statCard('NOCH VOR DIR', fmt(stundenLeft), `≈ ${wochenLeft} Schulwochen`, 'var(--yellow)')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {statCard('TAGE IN DER SCHULE', fmt(Math.floor(schulwochenTotal * TAGE_PRO_WOCHE)), undefined, 'var(--text)')}
          {statCard('LEBENSZEIT VERBRAUCHT', `${lebenszeitProzent.toFixed(3)}%`, 'von 80 Jahren Lebenserwartung', 'var(--muted)')}
          {statCard('HEUTE NOCH', `${heuteStd}h`, `${heuteMins} Minuten`, 'var(--green)')}
        </div>

        {/* progress bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.75rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>SCHULZEIT GESAMT</span>
            <span>{Math.min(100, Math.round((stundenTotal / (stundenTotal + stundenLeft)) * 100))}% DURCH</span>
          </div>
          <div style={{ height: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (stundenTotal / (stundenTotal + stundenLeft)) * 100)}%`,
              background: 'var(--red)',
              transition: 'width 1s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
            <span>Klasse 5 ({startYear})</span>
            <span>Abitur ({startYear + SCHULJAHRE})</span>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted2)', textAlign: 'center', letterSpacing: '0.05em' }}>
          Berechnung basiert auf ~{STUNDEN_PRO_TAG} Stunden/Tag · {TAGE_PRO_WOCHE} Tage/Woche · {WOCHEN_PRO_JAHR} Schulwochen/Jahr · Gymnasium BW
        </div>
      </div>
    </div>
  )
}
