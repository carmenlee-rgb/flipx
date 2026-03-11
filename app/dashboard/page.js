'use client'

export default function Dashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      color: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>🎉</div>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '32px',
          fontWeight: '800',
          marginBottom: '8px'
        }}>
          You're in, Flip<span style={{ color: '#f5c200' }}>X</span>!
        </div>
        <div style={{ color: '#888', fontSize: '16px' }}>
          Dashboard coming soon...
        </div>
      </div>
    </div>
  )
}