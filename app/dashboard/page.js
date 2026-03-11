'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
const [totalXp, setTotalXp] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

const { data } = await supabase
  .from('modules')
  .select('*')
  .order('order_index')
setModules(data || [])

const { data: profile } = await supabase
  .from('profiles')
  .select('xp')
  .eq('id', user.id)
  .single()
setTotalXp(profile?.xp || 0)
setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', color:'#f5c200', fontFamily:'DM Sans,sans-serif', fontSize:'16px' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:'DM Sans,sans-serif', color:'#f5f5f5' }}>
      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'rgba(8,8,8,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid #2c2c2c' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'16px' }}>
          Flip<span style={{ color:'#f5c200' }}>X</span>
          <small style={{ fontSize:'10px', fontWeight:400, color:'#888', letterSpacing:'2px', marginLeft:'8px' }}>CLIMBX ACADEMY</small>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.2)', borderRadius:'99px', padding:'5px 14px', fontSize:'13px', fontWeight:600, color:'#f5c200' }}>
            ⚡ {totalXp} XP
          </div>
          <button onClick={handleLogout} style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'12px', cursor:'pointer', border:'1px solid #2c2c2c', background:'transparent', color:'#888', fontFamily:'DM Sans,sans-serif' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ padding:'28px 32px', maxWidth:'740px', margin:'0 auto' }}>
        <div style={{ marginBottom:'28px' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:'24px', fontWeight:800, marginBottom:'4px' }}>
            Your Learning Path 🚀
          </div>
          <div style={{ fontSize:'14px', color:'#888' }}>
            Complete modules to earn XP and level up
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'14px' }}>
            <div style={{ flex:1, height:'8px', background:'#1f1f1f', borderRadius:'99px', overflow:'hidden' }}>
              <div style={{ width:'0%', height:'100%', background:'linear-gradient(90deg,#f5c200,#ffd93d)', borderRadius:'99px' }}></div>
            </div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#f5c200' }}>0%</div>
          </div>
        </div>

        {/* MODULES */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0', position:'relative' }}>
          <div style={{ position:'absolute', left:'35px', top:'60px', bottom:'60px', width:'2px', background:'#2c2c2c', borderRadius:'99px', zIndex:0 }}></div>

          {modules.map((mod, i) => (
            <div key={mod.id} onClick={() => router.push(`/learn/${mod.id}`)}
              style={{ display:'flex', alignItems:'flex-start', gap:'20px', padding:'20px 0', position:'relative', zIndex:1, cursor:'pointer' }}>
              <div style={{
                width:'72px', height:'72px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'28px', flexShrink:0,
                background: i === 0 ? 'rgba(245,194,0,0.15)' : '#171717',
                border: `3px solid ${i === 0 ? '#f5c200' : '#2c2c2c'}`,
                boxShadow: i === 0 ? '0 0 0 6px rgba(245,194,0,0.12)' : 'none'
              }}>
                {mod.emoji}
              </div>
              <div style={{
                flex:1, background: i === 0 ? 'rgba(245,194,0,0.04)' : '#171717',
                border: `1px solid ${i === 0 ? 'rgba(245,194,0,0.3)' : '#2c2c2c'}`,
                borderRadius:'16px', padding:'18px 20px',
                transition:'all 0.2s'
              }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'16px', fontWeight:700, marginBottom:'4px' }}>{mod.title}</div>
                <div style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>{mod.description}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ flex:1, height:'4px', background:'#1f1f1f', borderRadius:'99px', overflow:'hidden', marginRight:'10px' }}>
                    <div style={{ width:'0%', height:'100%', background:'#f5c200', borderRadius:'99px' }}></div>
                  </div>
                  <span style={{ fontSize:'12px', color: i === 0 ? '#f5c200' : '#888', fontWeight:600 }}>
                    {i === 0 ? '▶ Start' : '🔒 Locked'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}