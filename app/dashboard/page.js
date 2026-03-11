'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalXp, setTotalXp] = useState(0)
  const [moduleProgress, setModuleProgress] = useState({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: mods } = await supabase
        .from('modules')
        .select('*, decks(id)')
        .order('order_index')
      setModules(mods || [])

      const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', user.id)
        .single()
      setTotalXp(profile?.xp || 0)

      const { data: progressData } = await supabase
        .from('progress')
        .select('module_id, status')
        .eq('user_id', user.id)

      const { data: cardCounts } = await supabase
        .from('cards')
        .select('id, deck_id')

      const progressMap = {}
      mods?.forEach(mod => {
        const totalCards = cardCounts?.filter(c => c.deck_id === mod.deck_id).length || 0
        const doneCards = progressData?.filter(p => p.module_id === mod.id && p.status === 'done').length || 0
        progressMap[mod.id] = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0
      })
      setModuleProgress(progressMap)
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', color:'#f5c200', fontFamily:'DM Sans,sans-serif' }}>
      Loading...
    </div>
  )

  const overallProgress = modules.length > 0
    ? Math.round(Object.values(moduleProgress).reduce((a, b) => a + b, 0) / modules.length)
    : 0

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:'DM Sans,sans-serif', color:'#f5f5f5' }}>
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
              <div style={{ width:`${overallProgress}%`, height:'100%', background:'linear-gradient(90deg,#f5c200,#ffd93d)', borderRadius:'99px', transition:'width 0.5s' }}></div>
            </div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#f5c200' }}>{overallProgress}%</div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', position:'relative' }}>
          <div style={{ position:'absolute', left:'35px', top:'60px', bottom:'60px', width:'2px', background:'#2c2c2c', borderRadius:'99px', zIndex:0 }}></div>

          {modules.map((mod, i) => {
            const pct = moduleProgress[mod.id] || 0
            const prevPct = i > 0 ? (moduleProgress[modules[i-1].id] || 0) : 100
            const isUnlocked = prevPct === 100
            const isCompleted = pct === 100

            return (
              <div key={mod.id}
                onClick={() => isUnlocked && router.push(`/learn/${mod.id}`)}
                style={{ display:'flex', alignItems:'flex-start', gap:'20px', padding:'20px 0', position:'relative', zIndex:1, cursor: isUnlocked ? 'pointer' : 'not-allowed' }}>
                <div style={{
                  width:'72px', height:'72px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'28px', flexShrink:0,
                  background: isCompleted ? 'rgba(0,201,122,0.15)' : isUnlocked ? 'rgba(245,194,0,0.15)' : '#171717',
                  border: `3px solid ${isCompleted ? '#00c97a' : isUnlocked ? '#f5c200' : '#2c2c2c'}`,
                  boxShadow: isUnlocked && !isCompleted ? '0 0 0 6px rgba(245,194,0,0.12)' : 'none',
                  filter: isUnlocked ? 'none' : 'grayscale(1)',
                  opacity: isUnlocked ? 1 : 0.5
                }}>
                  {mod.emoji}
                </div>
                <div style={{
                  flex:1,
                  background: isCompleted ? 'rgba(0,201,122,0.04)' : isUnlocked ? 'rgba(245,194,0,0.04)' : '#171717',
                  border: `1px solid ${isCompleted ? 'rgba(0,201,122,0.3)' : isUnlocked ? 'rgba(245,194,0,0.3)' : '#2c2c2c'}`,
                  borderRadius:'16px', padding:'18px 20px',
                  opacity: isUnlocked ? 1 : 0.5
                }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'16px', fontWeight:700, marginBottom:'4px' }}>{mod.title}</div>
                  <div style={{ fontSize:'12px', color:'#888', marginBottom:'10px' }}>{mod.description}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ flex:1, height:'4px', background:'#1f1f1f', borderRadius:'99px', overflow:'hidden', marginRight:'10px' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: isCompleted ? '#00c97a' : '#f5c200', borderRadius:'99px', transition:'width 0.5s' }}></div>
                    </div>
                    <span style={{ fontSize:'12px', fontWeight:600, color: isCompleted ? '#00c97a' : isUnlocked ? '#f5c200' : '#888' }}>
                      {isCompleted ? '✓ Done' : isUnlocked ? `▶ ${pct > 0 ? 'Continue' : 'Start'}` : '🔒 Locked'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}