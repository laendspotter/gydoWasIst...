'use client'
import { useEffect, useState } from 'react'

function getSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return 'spring'
  if (m >= 6 && m <= 8) return 'summer'
  if (m >= 9 && m <= 11) return 'autumn'
  return 'winter'
}

// ── SUMMER ──────────────────────────────────────────────────────────────────
function SummerBg() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8e4f9" />
          <stop offset="100%" stopColor="#fde9c3" />
        </linearGradient>
        <linearGradient id="seaS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5bc0eb" />
          <stop offset="100%" stopColor="#2a7db5" />
        </linearGradient>
        <linearGradient id="sandS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d98a" />
          <stop offset="100%" stopColor="#e8c76a" />
        </linearGradient>
        <style>{`
          @keyframes sunPulse { 0%,100%{r:62} 50%{r:66} }
          @keyframes wave1 { 0%{d:path('M0 660 Q180 640 360 660 Q540 680 720 660 Q900 640 1080 660 Q1260 680 1440 660 L1440 900 L0 900Z')} 50%{d:path('M0 670 Q180 650 360 670 Q540 690 720 670 Q900 650 1080 670 Q1260 690 1440 670 L1440 900 L0 900Z')} 100%{d:path('M0 660 Q180 640 360 660 Q540 680 720 660 Q900 640 1080 660 Q1260 680 1440 660 L1440 900 L0 900Z')} }
          @keyframes wave2 { 0%{d:path('M0 690 Q180 670 360 690 Q540 710 720 690 Q900 670 1080 690 Q1260 710 1440 690 L1440 900 L0 900Z')} 50%{d:path('M0 680 Q180 700 360 680 Q540 660 720 680 Q900 700 1080 680 Q1260 660 1440 680 L1440 900 L0 900Z')} 100%{d:path('M0 690 Q180 670 360 690 Q540 710 720 690 Q900 670 1080 690 Q1260 710 1440 690 L1440 900 L0 900Z')} }
          @keyframes cloud1 { 0%{transform:translateX(0)} 100%{transform:translateX(1500px)} }
          @keyframes cloud2 { 0%{transform:translateX(-200px)} 100%{transform:translateX(1500px)} }
          @keyframes bird { 0%{transform:translateX(-60px) translateY(0)} 100%{transform:translateX(1500px) translateY(-30px)} }
          @keyframes palmSway { 0%,100%{transform-origin:50% 100%;transform:rotate(-2deg)} 50%{transform-origin:50% 100%;transform:rotate(2deg)} }
          @keyframes glitter { 0%,100%{opacity:0.2} 50%{opacity:0.8} }
        `}</style>
      </defs>

      {/* sky */}
      <rect width="1440" height="900" fill="url(#skyS)" />

      {/* sun */}
      <circle cx="1100" cy="140" fill="#fcd34d" opacity="0.95">
        <animate attributeName="r" values="62;66;62" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="1100" cy="140" r="80" fill="#fcd34d" opacity="0.2">
        <animate attributeName="r" values="80;90;80" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* cloud 1 */}
      <g style={{ animation: 'cloud1 38s linear infinite' }}>
        <ellipse cx="-800" cy="120" rx="90" ry="32" fill="white" opacity="0.85" />
        <ellipse cx="-760" cy="105" rx="55" ry="28" fill="white" opacity="0.85" />
        <ellipse cx="-840" cy="110" rx="45" ry="22" fill="white" opacity="0.85" />
      </g>
      {/* cloud 2 */}
      <g style={{ animation: 'cloud2 55s linear infinite' }}>
        <ellipse cx="-300" cy="190" rx="70" ry="25" fill="white" opacity="0.7" />
        <ellipse cx="-270" cy="178" rx="42" ry="22" fill="white" opacity="0.7" />
      </g>

      {/* bird */}
      <g style={{ animation: 'bird 22s linear infinite' }}>
        <path d="M-50 220 Q-44 215 -38 220" stroke="#555" strokeWidth="1.5" fill="none" />
        <path d="M-34 220 Q-28 215 -22 220" stroke="#555" strokeWidth="1.5" fill="none" />
      </g>

      {/* sea */}
      <path d="M0 680 Q180 660 360 680 Q540 700 720 680 Q900 660 1080 680 Q1260 700 1440 680 L1440 900 L0 900Z" fill="url(#seaS)">
        <animate attributeName="d"
          values="M0 680 Q180 660 360 680 Q540 700 720 680 Q900 660 1080 680 Q1260 700 1440 680 L1440 900 L0 900Z;M0 690 Q180 710 360 690 Q540 670 720 690 Q900 710 1080 690 Q1260 670 1440 690 L1440 900 L0 900Z;M0 680 Q180 660 360 680 Q540 700 720 680 Q900 660 1080 680 Q1260 700 1440 680 L1440 900 L0 900Z"
          dur="6s" repeatCount="indefinite" />
      </path>
      <path d="M0 710 Q180 695 360 710 Q540 725 720 710 Q900 695 1080 710 Q1260 725 1440 710 L1440 900 L0 900Z" fill="#3a9fd0" opacity="0.6">
        <animate attributeName="d"
          values="M0 710 Q180 695 360 710 Q540 725 720 710 Q900 695 1080 710 Q1260 725 1440 710 L1440 900 L0 900Z;M0 720 Q180 705 360 720 Q540 735 720 720 Q900 705 1080 720 Q1260 735 1440 720 L1440 900 L0 900Z;M0 710 Q180 695 360 710 Q540 725 720 710 Q900 695 1080 710 Q1260 725 1440 710 L1440 900 L0 900Z"
          dur="4s" repeatCount="indefinite" />
      </path>

      {/* sand */}
      <path d="M0 750 Q360 730 720 745 Q1080 760 1440 745 L1440 900 L0 900Z" fill="url(#sandS)" />

      {/* palm left */}
      <g style={{ animation: 'palmSway 3.5s ease-in-out infinite' }}>
        <rect x="118" y="620" width="10" height="130" fill="#a0785a" rx="4" />
        <ellipse cx="123" cy="622" rx="55" ry="18" fill="#5ab553" transform="rotate(-25 123 622)" />
        <ellipse cx="123" cy="622" rx="55" ry="18" fill="#4da646" transform="rotate(10 123 622)" />
        <ellipse cx="123" cy="622" rx="55" ry="18" fill="#5ab553" transform="rotate(40 123 622)" />
        <ellipse cx="123" cy="618" rx="18" ry="28" fill="#6dc463" />
      </g>

      {/* palm right */}
      <g style={{ animation: 'palmSway 4s ease-in-out infinite', animationDelay: '0.8s' }}>
        <rect x="1295" y="600" width="11" height="150" fill="#a0785a" rx="4" />
        <ellipse cx="1300" cy="602" rx="60" ry="19" fill="#5ab553" transform="rotate(-30 1300 602)" />
        <ellipse cx="1300" cy="602" rx="60" ry="19" fill="#4da646" transform="rotate(5 1300 602)" />
        <ellipse cx="1300" cy="602" rx="60" ry="19" fill="#5ab553" transform="rotate(38 1300 602)" />
        <ellipse cx="1300" cy="598" rx="20" ry="30" fill="#6dc463" />
      </g>

      {/* sea glitter */}
      {[200, 380, 560, 750, 920, 1100, 1280].map((x, i) => (
        <ellipse key={i} cx={x} cy={695 + (i % 3) * 8} rx="18" ry="4" fill="white" opacity="0.25">
          <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* beach umbrella */}
      <line x1="620" y1="755" x2="650" y2="810" stroke="#c0392b" strokeWidth="4" />
      <path d="M580 758 Q625 720 670 758" fill="#e74c3c" />
      <path d="M580 758 Q603 740 625 758" fill="#e67e22" />
    </svg>
  )
}

// ── AUTUMN ──────────────────────────────────────────────────────────────────
function AutumnBg() {
  const leaves = Array.from({ length: 22 }, (_, i) => ({
    x: (i * 73 + 40) % 1400,
    delay: i * 0.6,
    dur: 7 + (i % 5) * 1.5,
    size: 10 + (i % 4) * 4,
    color: ['#e67e22', '#e74c3c', '#f39c12', '#c0392b', '#d35400'][i % 5],
    startY: -30 - (i % 4) * 20,
  }))

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c5b0" />
          <stop offset="60%" stopColor="#c4a882" />
          <stop offset="100%" stopColor="#b8956a" />
        </linearGradient>
        <linearGradient id="groundA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b6914" />
          <stop offset="100%" stopColor="#6b4f10" />
        </linearGradient>
        <style>{`
          @keyframes leafFall {
            0% { transform: translateY(0px) rotate(0deg) translateX(0px); opacity: 1; }
            25% { transform: translateY(200px) rotate(90deg) translateX(30px); }
            50% { transform: translateY(400px) rotate(180deg) translateX(-20px); }
            75% { transform: translateY(650px) rotate(270deg) translateX(25px); }
            100% { transform: translateY(950px) rotate(360deg) translateX(0px); opacity: 0.7; }
          }
          @keyframes leafPile { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.02)} }
          @keyframes cloudDrift { 0%{transform:translateX(0)} 100%{transform:translateX(80px)} }
        `}</style>
      </defs>

      {/* sky */}
      <rect width="1440" height="900" fill="url(#skyA)" />

      {/* sun (low, warm) */}
      <circle cx="280" cy="200" r="55" fill="#f39c12" opacity="0.7" />
      <circle cx="280" cy="200" r="75" fill="#f39c12" opacity="0.15" />

      {/* clouds (overcast) */}
      {[[200, 100, 110, 35], [500, 80, 90, 28], [850, 130, 130, 40], [1150, 90, 100, 32]].map(([cx, cy, rx, ry], i) => (
        <g key={i} style={{ animation: `cloudDrift ${20 + i * 5}s ease-in-out infinite alternate` }}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#c9b99a" opacity="0.8" />
          <ellipse cx={cx - 30} cy={cy + 10} rx={rx * 0.6} ry={ry * 0.8} fill="#c9b99a" opacity="0.7" />
        </g>
      ))}

      {/* ground */}
      <path d="M0 780 Q360 765 720 778 Q1080 791 1440 775 L1440 900 L0 900Z" fill="url(#groundA)" />
      <path d="M0 800 Q360 785 720 798 Q1080 811 1440 795 L1440 900 L0 900Z" fill="#7a5c10" opacity="0.7" />

      {/* bare trees */}
      {/* tree 1 */}
      <g>
        <rect x="160" y="550" width="14" height="230" fill="#5c3d11" rx="5" />
        <line x1="167" y1="590" x2="110" y2="530" stroke="#5c3d11" strokeWidth="7" strokeLinecap="round" />
        <line x1="167" y1="610" x2="230" y2="545" stroke="#5c3d11" strokeWidth="6" strokeLinecap="round" />
        <line x1="167" y1="580" x2="135" y2="510" stroke="#5c3d11" strokeWidth="5" strokeLinecap="round" />
        <line x1="167" y1="600" x2="200" y2="520" stroke="#5c3d11" strokeWidth="5" strokeLinecap="round" />
        <line x1="110" y1="530" x2="88" y2="500" stroke="#5c3d11" strokeWidth="4" strokeLinecap="round" />
        <line x1="110" y1="530" x2="95" y2="495" stroke="#5c3d11" strokeWidth="3" strokeLinecap="round" />
        <line x1="230" y1="545" x2="255" y2="510" stroke="#5c3d11" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* tree 2 */}
      <g>
        <rect x="1260" y="530" width="16" height="250" fill="#5c3d11" rx="5" />
        <line x1="1268" y1="565" x2="1200" y2="495" stroke="#5c3d11" strokeWidth="8" strokeLinecap="round" />
        <line x1="1268" y1="590" x2="1340" y2="525" stroke="#5c3d11" strokeWidth="7" strokeLinecap="round" />
        <line x1="1268" y1="555" x2="1235" y2="490" stroke="#5c3d11" strokeWidth="5" strokeLinecap="round" />
        <line x1="1268" y1="575" x2="1300" y2="495" stroke="#5c3d11" strokeWidth="5" strokeLinecap="round" />
        <line x1="1200" y1="495" x2="1175" y2="460" stroke="#5c3d11" strokeWidth="4" strokeLinecap="round" />
        <line x1="1340" y1="525" x2="1365" y2="490" stroke="#5c3d11" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* tree 3 small */}
      <g>
        <rect x="680" y="620" width="10" height="160" fill="#5c3d11" rx="3" />
        <line x1="685" y1="645" x2="645" y2="600" stroke="#5c3d11" strokeWidth="5" strokeLinecap="round" />
        <line x1="685" y1="660" x2="725" y2="615" stroke="#5c3d11" strokeWidth="5" strokeLinecap="round" />
        <line x1="685" y1="640" x2="660" y2="595" stroke="#5c3d11" strokeWidth="3" strokeLinecap="round" />
        <line x1="685" y1="655" x2="710" y2="600" stroke="#5c3d11" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* leaf piles on ground */}
      <ellipse cx="300" cy="800" rx="80" ry="20" fill="#c0392b" opacity="0.7">
        <animate attributeName="rx" values="80;84;80" dur="5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="300" cy="800" rx="60" ry="14" fill="#e67e22" opacity="0.6" />
      <ellipse cx="900" cy="795" rx="100" ry="22" fill="#e67e22" opacity="0.65" />
      <ellipse cx="900" cy="795" rx="75" ry="15" fill="#f39c12" opacity="0.55" />
      <ellipse cx="1200" cy="802" rx="70" ry="18" fill="#c0392b" opacity="0.6" />

      {/* falling leaves */}
      {leaves.map((l, i) => (
        <g key={i} style={{ animation: `leafFall ${l.dur}s ${l.delay}s linear infinite` }}>
          <ellipse cx={l.x} cy={l.startY} rx={l.size} ry={l.size * 0.6} fill={l.color} opacity="0.88" />
        </g>
      ))}
    </svg>
  )
}

// ── WINTER ──────────────────────────────────────────────────────────────────
function WinterBg() {
  const flakes = Array.from({ length: 35 }, (_, i) => ({
    x: (i * 44 + 10) % 1440,
    delay: i * 0.4,
    dur: 8 + (i % 6) * 1.2,
    size: 2 + (i % 4),
  }))

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="skyW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="40%" stopColor="#e8a87c" />
          <stop offset="70%" stopColor="#f4c891" />
          <stop offset="100%" stopColor="#fde8c8" />
        </linearGradient>
        <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0bec5" />
          <stop offset="100%" stopColor="#607d8b" />
        </linearGradient>
        <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90a4ae" />
          <stop offset="100%" stopColor="#546e7a" />
        </linearGradient>
        <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#dde8f0" />
        </linearGradient>
        <style>{`
          @keyframes snowfall {
            0% { transform: translateY(-20px) translateX(0px); opacity: 0.9; }
            50% { transform: translateY(450px) translateX(15px); opacity: 0.8; }
            100% { transform: translateY(950px) translateX(-10px); opacity: 0.4; }
          }
          @keyframes sunriseGlow {
            0%,100% { opacity: 0.7; r: 55; }
            50% { opacity: 0.9; r: 60; }
          }
          @keyframes starTwinkle { 0%,100%{opacity:0.8} 50%{opacity:0.2} }
        `}</style>
      </defs>

      {/* sky - sunrise */}
      <rect width="1440" height="900" fill="url(#skyW)" />

      {/* stars (top only) */}
      {[[100,40],[300,25],[500,55],[800,30],[1000,20],[1200,45],[1350,35]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="white">
          <animate attributeName="opacity" values="0.8;0.2;0.8" dur={`${2+i*0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* sunrise sun */}
      <circle cx="720" cy="450" r="55" fill="#f59e0b">
        <animate attributeName="r" values="55;60;55" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="720" cy="450" r="90" fill="#fbbf24" opacity="0.2">
        <animate attributeName="r" values="90;100;90" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="720" cy="450" r="130" fill="#fcd34d" opacity="0.08">
        <animate attributeName="r" values="130;145;130" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* mountains back */}
      <polygon points="200,700 500,250 800,700" fill="url(#mtn2)" opacity="0.85" />
      <polygon points="550,700 850,200 1150,700" fill="url(#mtn1)" />
      <polygon points="900,700 1150,320 1400,700" fill="url(#mtn2)" opacity="0.9" />
      <polygon points="0,700 200,380 400,700" fill="url(#mtn2)" opacity="0.7" />

      {/* snow caps */}
      <polygon points="500,250 470,310 530,310" fill="url(#snow)" />
      <polygon points="500,250 440,350 560,350" fill="url(#snow)" opacity="0.6" />

      <polygon points="850,200 815,270 885,270" fill="url(#snow)" />
      <polygon points="850,200 800,320 900,320" fill="url(#snow)" opacity="0.55" />

      <polygon points="1150,320 1118,380 1182,380" fill="url(#snow)" />
      <polygon points="1150,320 1108,420 1192,420" fill="url(#snow)" opacity="0.5" />

      {/* snowy ground */}
      <path d="M0 770 Q180 755 360 768 Q540 781 720 770 Q900 759 1080 770 Q1260 781 1440 768 L1440 900 L0 900Z" fill="#e8f0f7" />
      <path d="M0 800 Q360 785 720 798 Q1080 811 1440 795 L1440 900 L0 900Z" fill="#dde8f0" />

      {/* pine trees */}
      {[[80, 720], [220, 740], [1220, 730], [1360, 718]].map(([tx, ty], i) => (
        <g key={i}>
          <rect x={tx - 4} y={ty} width="8" height="60" fill="#5c3d11" />
          <polygon points={`${tx},${ty - 60} ${tx - 28},${ty + 10} ${tx + 28},${ty + 10}`} fill="#2d6a4f" />
          <polygon points={`${tx},${ty - 90} ${tx - 22},${ty - 30} ${tx + 22},${ty - 30}`} fill="#40916c" />
          <polygon points={`${tx},${ty - 115} ${tx - 16},${ty - 60} ${tx + 16},${ty - 60}`} fill="#52b788" />
          {/* snow on trees */}
          <polygon points={`${tx},${ty - 60} ${tx - 20},${ty + 5} ${tx + 20},${ty + 5}`} fill="#e8f0f7" opacity="0.7" />
          <polygon points={`${tx},${ty - 90} ${tx - 15},${ty - 35} ${tx + 15},${ty - 35}`} fill="#e8f0f7" opacity="0.6" />
          <polygon points={`${tx},${ty - 115} ${tx - 11},${ty - 65} ${tx + 11},${ty - 65}`} fill="#e8f0f7" opacity="0.7" />
        </g>
      ))}

      {/* snowflakes */}
      {flakes.map((f, i) => (
        <circle key={i} cx={f.x} cy={-20} r={f.size} fill="white" opacity="0.85"
          style={{ animation: `snowfall ${f.dur}s ${f.delay}s linear infinite` }} />
      ))}
    </svg>
  )
}

// ── SPRING ──────────────────────────────────────────────────────────────────
function SpringBg() {
  const petals = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 85 + 30) % 1380,
    delay: i * 0.7,
    dur: 10 + (i % 5) * 1.5,
    color: ['#f9a8d4', '#fbcfe8', '#fce7f3', '#f0abfc', '#e9d5ff'][i % 5],
  }))

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="skySp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="grassSp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
        <style>{`
          @keyframes petalFall {
            0% { transform: translateY(-30px) rotate(0deg) translateX(0); opacity:1; }
            30% { transform: translateY(250px) rotate(120deg) translateX(25px); opacity:0.9; }
            60% { transform: translateY(520px) rotate(240deg) translateX(-15px); opacity:0.8; }
            100% { transform: translateY(950px) rotate(360deg) translateX(10px); opacity:0.5; }
          }
          @keyframes birdSpring { 0%{transform:translateX(-80px)} 100%{transform:translateX(1550px)} }
          @keyframes butterfly {
            0%,100% { transform: translateX(0) translateY(0) scaleX(1); }
            25% { transform: translateX(60px) translateY(-30px) scaleX(-1); }
            50% { transform: translateX(120px) translateY(10px) scaleX(1); }
            75% { transform: translateX(60px) translateY(-15px) scaleX(-1); }
          }
          @keyframes treeWave { 0%,100%{transform-origin:50% 100%;transform:rotate(-1deg)} 50%{transform-origin:50% 100%;transform:rotate(1deg)} }
          @keyframes flowerSway { 0%,100%{transform-origin:50% 100%;transform:rotate(-3deg)} 50%{transform-origin:50% 100%;transform:rotate(3deg)} }
        `}</style>
      </defs>

      {/* sky */}
      <rect width="1440" height="900" fill="url(#skySp)" />

      {/* sun */}
      <circle cx="1100" cy="130" r="58" fill="#fde047" opacity="0.95">
        <animate attributeName="r" values="58;63;58" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="1100" cy="130" r="85" fill="#fde047" opacity="0.18">
        <animate attributeName="r" values="85;95;85" dur="5s" repeatCount="indefinite" />
      </circle>

      {/* clouds */}
      {[[180, 100, 100, 34], [550, 70, 80, 26], [950, 110, 115, 36]].map(([cx, cy, rx, ry], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white" opacity="0.9" />
          <ellipse cx={cx - 30} cy={cy + 8} rx={rx * 0.65} ry={ry * 0.85} fill="white" opacity="0.85" />
          <ellipse cx={cx + 30} cy={cy + 5} rx={rx * 0.55} ry={ry * 0.8} fill="white" opacity="0.85" />
        </g>
      ))}

      {/* hills */}
      <ellipse cx="300" cy="820" rx="380" ry="180" fill="#86efac" />
      <ellipse cx="900" cy="840" rx="420" ry="160" fill="#6ee7b7" />
      <ellipse cx="1300" cy="825" rx="350" ry="170" fill="#86efac" />

      {/* ground */}
      <path d="M0 800 Q360 780 720 795 Q1080 810 1440 795 L1440 900 L0 900Z" fill="url(#grassSp)" />
      <path d="M0 830 Q360 815 720 828 Q1080 841 1440 825 L1440 900 L0 900Z" fill="#4ade80" opacity="0.7" />

      {/* trees */}
      {[[140, 650], [380, 630], [1050, 640], [1300, 655]].map(([tx, ty], i) => (
        <g key={i} style={{ animation: 'treeWave 4s ease-in-out infinite', animationDelay: `${i * 0.8}s` }}>
          <rect x={tx - 6} y={ty} width="12" height="150" fill="#92400e" rx="4" />
          {/* canopy layers */}
          <ellipse cx={tx} cy={ty - 10} rx="55" ry="45" fill="#22c55e" />
          <ellipse cx={tx - 20} cy={ty + 10} rx="45" ry="38" fill="#16a34a" />
          <ellipse cx={tx + 20} cy={ty + 5} rx="48" ry="40" fill="#15803d" />
          <ellipse cx={tx} cy={ty - 30} rx="40" ry="32" fill="#4ade80" />
          {/* blossom dots */}
          {[[-20, -30], [15, -45], [-30, 0], [25, -15], [0, -55]].map(([dx, dy], j) => (
            <circle key={j} cx={tx + dx} cy={ty + dy} r="7" fill="#f9a8d4" opacity="0.85" />
          ))}
        </g>
      ))}

      {/* flowers on ground */}
      {[[250, 815], [450, 825], [650, 810], [850, 820], [1050, 812], [1200, 828], [1380, 816]].map(([fx, fy], i) => (
        <g key={i} style={{ animation: 'flowerSway 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>
          <line x1={fx} y1={fy} x2={fx} y2={fy + 30} stroke="#16a34a" strokeWidth="2" />
          <circle cx={fx} cy={fy} r="6" fill={['#fbbf24', '#f9a8d4', '#a78bfa', '#34d399'][i % 4]} />
          {[0, 60, 120, 180, 240, 300].map((angle, j) => (
            <ellipse key={j} cx={fx + Math.cos(angle * Math.PI / 180) * 6} cy={fy + Math.sin(angle * Math.PI / 180) * 6}
              rx="4" ry="2.5" fill={['#fbbf24', '#f9a8d4', '#a78bfa', '#34d399'][i % 4]} opacity="0.75"
              transform={`rotate(${angle} ${fx + Math.cos(angle * Math.PI / 180) * 6} ${fy + Math.sin(angle * Math.PI / 180) * 6})`} />
          ))}
        </g>
      ))}

      {/* butterfly */}
      <g style={{ animation: 'butterfly 8s ease-in-out infinite' }}>
        <ellipse cx="600" cy="450" rx="16" ry="10" fill="#f0abfc" opacity="0.85" transform="rotate(-30 600 450)" />
        <ellipse cx="616" cy="448" rx="16" ry="10" fill="#e879f9" opacity="0.85" transform="rotate(30 616 448)" />
        <line x1="608" y1="447" x2="608" y2="455" stroke="#6b21a8" strokeWidth="1" />
      </g>

      {/* birds */}
      <g style={{ animation: 'birdSpring 20s linear infinite' }}>
        {[[-50, 180], [-70, 195], [-38, 200]].map(([bx, by], i) => (
          <g key={i}>
            <path d={`M${bx} ${by} Q${bx + 7} ${by - 5} ${bx + 14} ${by}`} stroke="#555" strokeWidth="1.5" fill="none" />
            <path d={`M${bx + 14} ${by} Q${bx + 21} ${by - 5} ${bx + 28} ${by}`} stroke="#555" strokeWidth="1.5" fill="none" />
          </g>
        ))}
      </g>

      {/* falling petals */}
      {petals.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={-30} rx="8" ry="5" fill={p.color} opacity="0.85"
          style={{ animation: `petalFall ${p.dur}s ${p.delay}s linear infinite` }} />
      ))}
    </svg>
  )
}

// ── EXPORT ───────────────────────────────────────────────────────────────────
export default function SeasonalBackground() {
  const [season, setSeason] = useState(null)
  useEffect(() => { setSeason(getSeason()) }, [])
  if (!season) return null
  if (season === 'summer') return <SummerBg />
  if (season === 'autumn') return <AutumnBg />
  if (season === 'winter') return <WinterBg />
  return <SpringBg />
}
