interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export default function Logo({ variant = 'light', size = 'md', showTagline = false }: LogoProps) {
  const inkColor = variant === 'dark' ? '#FFFFFF' : '#111827'
  const mutedColor = variant === 'dark' ? 'rgba(255,255,255,0.55)' : '#6B7280'

  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36
  const titleSize = size === 'sm' ? '0.9rem' : size === 'lg' ? '1.375rem' : '1.125rem'

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon mark */}
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #1B4FD8 0%, #3B82F6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(27,79,216,0.35)',
        }}
      >
        {/* Stylised "IT" monogram */}
        <svg
          width={iconSize * 0.62}
          height={iconSize * 0.62}
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* I */}
          <rect x="2" y="3" width="2.5" height="16" rx="1.25" fill="white" />
          {/* T */}
          <rect x="8" y="3" width="12" height="2.5" rx="1.25" fill="white" />
          <rect x="12.75" y="3" width="2.5" height="16" rx="1.25" fill="white" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="leading-none">
        <div
          style={{
            fontFamily: 'var(--font-merriweather), Georgia, serif',
            fontWeight: 700,
            fontSize: titleSize,
            color: inkColor,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          IT By Design
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: mutedColor,
            marginTop: '2px',
          }}
        >
          {showTagline ? 'Weekly CEO Insights' : 'Insider'}
        </div>
      </div>
    </div>
  )
}
