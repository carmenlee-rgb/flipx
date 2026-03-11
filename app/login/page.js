'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#101010',
        border: '1px solid #2c2c2c',
        borderRadius: '24px',
        padding: '48px 40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: '#f5c200',
            borderRadius: '16px',
            fontSize: '26px',
            fontWeight: '800',
            color: '#080808',
            marginBottom: '14px'
          }}>F</div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>
            Flip<span style={{ color: '#f5c200' }}>X</span>
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            ClimbX Academy
          </div>
        </div>

        <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
          Welcome back
        </div>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>
          Sign in to continue learning
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '600',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%',
                background: '#171717',
                border: '1px solid #2c2c2c',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#f5f5f5',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '600',
              color: '#888',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: '#171717',
                border: '1px solid #2c2c2c',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#f5f5f5',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,59,92,0.1)',
              border: '1px solid rgba(255,59,92,0.2)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#ff3b5c',
              marginBottom: '16px'
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#f5c200',
              color: '#080808',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}