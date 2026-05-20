export function AppLoadingSplash() {
  return (
    <div
      className="lumio-fade-up"
      style={{
        minHeight:      '100vh',
        background:     '#06040f',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            28,
      }}
    >
      <div
        style={{
          fontFamily:    'Syne, sans-serif',
          fontWeight:    900,
          fontSize:      36,
          letterSpacing: '-0.03em',
          background:    'linear-gradient(135deg, #C4B5FD, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
        }}
      >
        Lumio
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="lumio-dot-pulse"
            style={{
              display:      'block',
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:   '#7C3AED',
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
