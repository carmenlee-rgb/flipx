'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LearnPage() {
  const router = useRouter()
  const { id } = useParams()
  const [cards, setCards] = useState([])
  const [module, setModule] = useState(null)
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [xp, setXp] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: mod } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .single()
      setModule(mod)

      const { data: cardData } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', mod.deck_id)
        .order('order_index')
      setCards(cardData || [])
      setLoading(false)
    }
    load()
  }, [id])

async function handleGrade(grade) {
    const earned = grade === 'easy' ? 20 : grade === 'good' ? 15 : grade === 'hard' ? 10 : 5
    const newXp = xp + earned
    setXp(newXp)

    const { data: { user } } = await supabase.auth.getUser()

    // Save to xp_log
    await supabase.from('xp_log').insert({
      user_id: user.id,
      amount: earned,
      reason: `Graded card: ${grade}`
    })

    if (current + 1 >= cards.length) {
      // Update total XP on profile
      await supabase.rpc('increment_xp', { user_id_input: user.id, amount_input: newXp })
      setDone(true)
    } else {
      setCurrent(prev => prev + 1)
      setFlipped(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', color:'#f5c200', fontFamily:'DM Sans,sans-serif' }}>
      Loading...
    </div>
  )

  if (done) return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', color:'#f5f5f5', flexDirection:'column', gap:'16px' }}>
      <div style={{ fontSize:'64px' }}>🏆</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'32px', fontWeight:800 }}>Module Complete!</div>
      <div style={{ color:'#f5c200', fontSize:'20px', fontWeight:600 }}>+{xp} XP earned</div>
      <button onClick={() => router.push('/dashboard')} style={{ marginTop:'16px', background:'#f5c200', color:'#080808', border:'none', borderRadius:'10px', padding:'12px 28px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
        Back to Dashboard
      </button>
    </div>
  )

  const card = cards[current]

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:'DM Sans,sans-serif', color:'#f5f5f5' }}>
      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'rgba(8,8,8,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid #2c2c2c' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'1px solid #2c2c2c', color:'#888', borderRadius:'8px', padding:'6px 14px', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
          ← Back
        </button>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'15px' }}>{module?.title}</div>
        <div style={{ color:'#f5c200', fontWeight:600, fontSize:'13px' }}>⚡ {xp} XP</div>
      </nav>

      <div style={{ padding:'40px 24px', maxWidth:'600px', margin:'0 auto' }}>
        {/* PROGRESS */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'32px' }}>
          <div style={{ flex:1, height:'6px', background:'#1f1f1f', borderRadius:'99px', overflow:'hidden' }}>
            <div style={{ width:`${((current) / cards.length) * 100}%`, height:'100%', background:'linear-gradient(90deg,#f5c200,#ffd93d)', borderRadius:'99px', transition:'width 0.3s' }}></div>
          </div>
          <div style={{ fontSize:'12px', color:'#888', flexShrink:0 }}>{current + 1} / {cards.length}</div>
        </div>

        {/* CARD */}
        <div onClick={() => setFlipped(!flipped)} style={{
          width:'100%', minHeight:'280px', borderRadius:'24px', cursor:'pointer',
          background: flipped ? 'rgba(245,194,0,0.08)' : '#171717',
          border: `1px solid ${flipped ? 'rgba(245,194,0,0.3)' : '#2c2c2c'}`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'40px 32px', textAlign:'center', transition:'all 0.3s', marginBottom:'24px'
        }}>
          <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'2px', color: flipped ? '#f5c200' : '#888', marginBottom:'16px', textTransform:'uppercase' }}>
            {flipped ? 'Answer' : 'Question'}
          </div>
          <div style={{ fontSize:'20px', fontWeight: flipped ? 400 : 700, lineHeight:1.5, color: flipped ? '#f5f5f5' : '#f5f5f5' }}>
            {flipped ? card.back : card.front}
          </div>
          {!flipped && (
            <div style={{ marginTop:'24px', fontSize:'12px', color:'#555' }}>tap to reveal answer</div>
          )}
        </div>

        {/* GRADE BUTTONS */}
        {flipped && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
            {[
              { label:'Again', color:'#ff3b5c', bg:'rgba(255,59,92,0.1)', grade:'again', xp:5 },
              { label:'Hard', color:'#f5c200', bg:'rgba(245,194,0,0.1)', grade:'hard', xp:10 },
              { label:'Good', color:'#3b82f6', bg:'rgba(59,130,246,0.1)', grade:'good', xp:15 },
              { label:'Easy', color:'#00c97a', bg:'rgba(0,201,122,0.1)', grade:'easy', xp:20 },
            ].map(btn => (
              <button key={btn.grade} onClick={() => handleGrade(btn.grade)} style={{
                background: btn.bg, border:`1px solid ${btn.color}33`, color: btn.color,
                borderRadius:'12px', padding:'12px 8px', fontSize:'13px', fontWeight:600,
                cursor:'pointer', fontFamily:'DM Sans,sans-serif', display:'flex',
                flexDirection:'column', alignItems:'center', gap:'4px'
              }}>
                {btn.label}
                <span style={{ fontSize:'10px', opacity:0.7 }}>+{btn.xp} XP</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}