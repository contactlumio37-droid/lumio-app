interface NavItem {
  id:    string
  label: string
  icon:  string
}

interface Props {
  items:    NavItem[]
  activeTab: string
  onTabChange: (id: string) => void
  navBg:    string
  border:   string
}

export function BottomNav({ items, activeTab, onTabChange, navBg, border }: Props) {
  return (
    <div
      style={{
        position:      'fixed',
        left:          0,
        right:         0,
        bottom:        0,
        borderTop:     `1px solid ${border}`,
        background:    navBg,
        backdropFilter: 'blur(16px)',
        zIndex:        200,
      }}
    >
      <div
        style={{
          maxWidth:            460,
          margin:              '0 auto',
          padding:             'calc(8px) 10px calc(8px + env(safe-area-inset-bottom, 0px))',
          display:             'grid',
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          gap:                 6,
        }}
      >
        {items.map(item => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onTabChange(item.id)}
              style={{
                border:        'none',
                background:    active ? 'rgba(124,58,237,0.15)' : 'transparent',
                borderRadius:  14,
                padding:       '8px 4px',
                cursor:        'pointer',
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                gap:           4,
                position:      'relative',
              }}
            >
              {active && (
                <span
                  style={{
                    position:  'absolute',
                    top:       0,
                    left:      '50%',
                    transform: 'translateX(-50%)',
                    width:     28,
                    height:    3,
                    borderRadius: '0 0 4px 4px',
                    background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  }}
                />
              )}
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span
                style={{
                  fontSize:   11,
                  fontWeight: active ? 800 : 600,
                  fontFamily: 'Syne, sans-serif',
                  color:      active ? '#C4B5FD' : '#6B7280',
                  transition: 'color 200ms',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
