import { FooterPlaceholderLinks } from './FooterPlaceholderLinks'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '2rem 1.5rem',
        background: 'white',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: '0.9rem',
            color: '#666',
            textAlign: 'center',
          }}
        >
          © {currentYear} Recipe-Kitchen-Share
        </div>
        <nav
          style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <FooterPlaceholderLinks />
        </nav>
      </div>
    </footer>
  )
}
