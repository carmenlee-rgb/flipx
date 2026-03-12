'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('decks')
  const [decks, setDecks] = useState([])
  const [users, setUsers] = useState([])
  const [cards, setCards] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [selectedDeck, setSelectedDeck] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')
  const [newDeckCat, setNewDeckCat] = useState('Sales')
  const [newFront, setNewFront] = useState('')
  const [newBack, setNewBack] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard'); return }
      const { data: deckData } = await supabase.from('decks').select('*').order('created_at', { ascending: false })
      setDecks(deckData || [])
      const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setUsers(userData || [])
      const { data: modData } = await supabase.from('modules').select('*').order('order_index')
      setModules(modData || [])
      setLoading(false)
    }
    load()
  }, [])

  async function loadCards(deck) {
    setSelectedDeck(deck)
    setQuizzes([])
    setSelectedModule(null)
    const { data } = await supabase.from('cards').select('*').eq('deck_id', deck.id).order('order_index')
    setCards(data || [])
  }

  async function loadQuizzes(mod) {
    setSelectedModule(mod)
    const { data } = await supabase.from('quizzes').select('*').eq('module_id', mod.id)
    setQuizzes(data || [])
  }

  async function createDeck() {
    if (!newDeckName.trim()) return
    const { data } = await supabase.from('decks').insert({
      name: newDeckName, description: newDeckDesc, category: newDeckCat
    }).select().single()
    setDecks(prev => [data, ...prev])
    setNewDeckName(''); setNewDeckDesc('')
  }

  async function deleteDeck(id) {
    await supabase.from('decks').delete().eq('id', id)
    setDecks(prev => prev.filter(d => d.id !== id))
    if (selectedDeck?.id === id) { setSelectedDeck(null); setCards([]) }
  }

  async function addCard() {
    if (!newFront.trim() || !newBack.trim() || !selectedDeck) return
    const { data } = await supabase.from('cards').insert({
      deck_id: selectedDeck.id, front: newFront, back: newBack, order_index: cards.length + 1
    }).select().single()
    setCards(prev => [...prev, data])
    setNewFront(''); setNewBack('')
  }

  async function deleteCard(id) {
    await supabase.from('cards').delete().eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  async function generateQuiz() {
    if (!selectedDeck || !selectedModule || cards.length === 0) return
    setGeneratingQuiz(true)

    const cardContent = cards.map((c, i) => `Card ${i+1}:\nQ: ${c.front}\nA: ${c.back}`).join('\n\n')

const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards, moduleId: selectedModule.id })
    })

    const data = await response.json()
    const questions = data.questions || []

    // Delete old quizzes for this module
    await supabase.from('quizzes').delete().eq('module_id', selectedModule.id)

    // Save new questions
    const toInsert = questions.map(q => ({
      deck_id: selectedDeck.id,
      module_id: selectedModule.id,
      question: q.question,
      question_type: q.question_type,
      options: q.options,
      correct_answer: q.correct_answer
    }))

    const { data: saved } = await supabase.from('quizzes').insert(toInsert).select()
    setQuizzes(saved || [])
    setGeneratingQuiz(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center', color:'#f5c200', fontFamily:'DM Sans,sans-serif' }}>
      Loading...
    </div>
  )

  const tabStyle = (tab) => ({
    padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:600,
    cursor:'pointer', border:'none', fontFamily:'DM Sans,sans-serif',
    background: activeTab === tab ? 'rgba(245,194,0,0.15)' : 'transparent',
    color: activeTab === tab ? '#f5c200' : '#888'
  })

  const inputStyle = {
    width:'100%', background:'#171717', border:'1px solid #2c2c2c',
    borderRadius:'10px', padding:'10px 14px', color:'#f5f5f5',
    fontSize:'13px', outline:'none', fontFamily:'DM Sans,sans-serif', marginBottom:'8px'
  }

  const btnPrimary = {
    background:'#f5c200', color:'#080808', border:'none', borderRadius:'8px',
    padding:'10px 18px', fontSize:'13px', fontWeight:600, cursor:'pointer',
    fontFamily:'DM Sans,sans-serif'
  }

  const deckModules = modules.filter(m => m.deck_id === selectedDeck?.id)

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:'DM Sans,sans-serif', color:'#f5f5f5' }}>
      <nav style={{ position:'sticky', top:0, zIndex:100, height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'rgba(8,8,8,0.95)', backdropFilter:'blur(20px)', borderBottom:'1px solid #2c2c2c' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'16px' }}>Flip<span style={{ color:'#f5c200' }}>X</span></div>
          <span style={{ fontSize:'10px', padding:'3px 8px', borderRadius:'99px', background:'rgba(245,194,0,0.12)', color:'#f5c200', border:'1px solid rgba(245,194,0,0.2)', fontWeight:600 }}>ADMIN</span>
        </div>
        <div style={{ display:'flex', gap:'4px' }}>
          <button style={tabStyle('decks')} onClick={() => setActiveTab('decks')}>📚 Decks</button>
          <button style={tabStyle('quiz')} onClick={() => setActiveTab('quiz')}>🧠 Quiz Generator</button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👥 Users</button>
        </div>
        <button onClick={() => { supabase.auth.signOut(); router.push('/login') }}
          style={{ padding:'5px 12px', borderRadius:'7px', fontSize:'12px', cursor:'pointer', border:'1px solid #2c2c2c', background:'transparent', color:'#888', fontFamily:'DM Sans,sans-serif' }}>
          Logout
        </button>
      </nav>

      <div style={{ padding:'28px 32px', maxWidth:'1100px', margin:'0 auto' }}>

        {/* DECKS TAB */}
        {activeTab === 'decks' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:800, marginBottom:'16px' }}>Decks</div>
              <div style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', fontWeight:600, marginBottom:'12px', color:'#f5c200' }}>+ New Deck</div>
                <input style={inputStyle} placeholder="Deck name" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} />
                <input style={inputStyle} placeholder="Description" value={newDeckDesc} onChange={e => setNewDeckDesc(e.target.value)} />
                <select style={{...inputStyle, marginBottom:'12px'}} value={newDeckCat} onChange={e => setNewDeckCat(e.target.value)}>
                  <option>Sales</option><option>Marketing</option><option>Product</option><option>Operations</option>
                </select>
                <button style={btnPrimary} onClick={createDeck}>Create Deck</button>
              </div>
              {decks.map(deck => (
                <div key={deck.id} onClick={() => loadCards(deck)}
                  style={{ background: selectedDeck?.id === deck.id ? 'rgba(245,194,0,0.06)' : '#171717', border:`1px solid ${selectedDeck?.id === deck.id ? 'rgba(245,194,0,0.3)' : '#2c2c2c'}`, borderRadius:'12px', padding:'14px 16px', marginBottom:'8px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'14px' }}>{deck.name}</div>
                    <div style={{ fontSize:'11px', color:'#888', marginTop:'2px' }}>{deck.category} · {deck.description}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteDeck(deck.id) }}
                    style={{ background:'rgba(255,59,92,0.1)', border:'1px solid rgba(255,59,92,0.2)', color:'#ff3b5c', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:800, marginBottom:'16px' }}>
                {selectedDeck ? `Cards — ${selectedDeck.name}` : 'Select a deck to manage cards'}
              </div>
              {selectedDeck && (
                <>
                  <div style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                    <div style={{ fontSize:'13px', fontWeight:600, marginBottom:'12px', color:'#f5c200' }}>+ Add Card</div>
                    <textarea style={{...inputStyle, minHeight:'70px'}} placeholder="Front (question)" value={newFront} onChange={e => setNewFront(e.target.value)} />
                    <textarea style={{...inputStyle, minHeight:'70px'}} placeholder="Back (answer)" value={newBack} onChange={e => setNewBack(e.target.value)} />
                    <button style={btnPrimary} onClick={addCard}>Add Card</button>
                  </div>
                  {cards.map((card, i) => (
                    <div key={card.id} style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'12px', padding:'14px 16px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'12px', color:'#f5c200', fontWeight:600, marginBottom:'4px' }}>Q{i+1}</div>
                        <div style={{ fontSize:'13px', marginBottom:'6px' }}>{card.front}</div>
                        <div style={{ fontSize:'12px', color:'#888' }}>{card.back}</div>
                      </div>
                      <button onClick={() => deleteCard(card.id)}
                        style={{ background:'rgba(255,59,92,0.1)', border:'1px solid rgba(255,59,92,0.2)', color:'#ff3b5c', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', cursor:'pointer', fontFamily:'DM Sans,sans-serif', flexShrink:0 }}>
                        Delete
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* QUIZ GENERATOR TAB */}
        {activeTab === 'quiz' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:800, marginBottom:'16px' }}>🧠 Quiz Generator</div>
              <div style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                <div style={{ fontSize:'13px', color:'#888', marginBottom:'16px' }}>Select a deck and module to generate an AI quiz from the flashcards.</div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#888', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Deck</div>
                <select style={{...inputStyle, marginBottom:'12px'}} onChange={e => {
                  const deck = decks.find(d => d.id === e.target.value)
                  if (deck) loadCards(deck)
                }}>
                  <option value="">Select a deck...</option>
                  {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {selectedDeck && (
                  <>
                    <div style={{ fontSize:'11px', fontWeight:600, color:'#888', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Module</div>
                    <select style={{...inputStyle, marginBottom:'12px'}} onChange={e => {
                      const mod = deckModules.find(m => m.id === e.target.value)
                      if (mod) loadQuizzes(mod)
                    }}>
                      <option value="">Select a module...</option>
                      {deckModules.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.title}</option>)}
                    </select>
                  </>
                )}
                {selectedDeck && selectedModule && (
                  <button style={{...btnPrimary, opacity: generatingQuiz ? 0.6 : 1, width:'100%'}} onClick={generateQuiz} disabled={generatingQuiz}>
                    {generatingQuiz ? '🤖 Generating...' : '🤖 Generate AI Quiz'}
                  </button>
                )}
              </div>
              {selectedDeck && (
                <div style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'12px', padding:'14px 16px' }}>
                  <div style={{ fontSize:'12px', color:'#888', marginBottom:'8px' }}>Cards in deck: {cards.length}</div>
                  {cards.map((c, i) => (
                    <div key={c.id} style={{ fontSize:'12px', padding:'6px 0', borderBottom:'1px solid #2c2c2c', color:'#888' }}>
                      <span style={{ color:'#f5c200' }}>Q{i+1}:</span> {c.front}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:800, marginBottom:'16px' }}>
                {quizzes.length > 0 ? `Generated Quiz (${quizzes.length} questions)` : 'Quiz Preview'}
              </div>
              {quizzes.length === 0 ? (
                <div style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'16px', padding:'40px', textAlign:'center', color:'#888' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🤖</div>
                  <div style={{ fontSize:'14px' }}>Select a deck and module, then click Generate to create an AI quiz</div>
                </div>
              ) : (
                quizzes.map((q, i) => (
                  <div key={q.id} style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'12px', padding:'16px', marginBottom:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                      <span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'99px', background:'rgba(59,130,246,0.12)', color:'#3b82f6', fontWeight:600 }}>
                        {q.question_type === 'mcq' ? 'MCQ' : q.question_type === 'truefalse' ? 'True/False' : 'Fill in Blank'}
                      </span>
                      <span style={{ fontSize:'11px', color:'#888' }}>Q{i+1}</span>
                    </div>
                    <div style={{ fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>{q.question}</div>
                    {q.options && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginBottom:'8px' }}>
                        {q.options.map((opt, j) => (
                          <div key={j} style={{ fontSize:'12px', padding:'4px 8px', borderRadius:'6px', background: opt === q.correct_answer ? 'rgba(0,201,122,0.1)' : 'transparent', color: opt === q.correct_answer ? '#00c97a' : '#888', border: opt === q.correct_answer ? '1px solid rgba(0,201,122,0.2)' : '1px solid transparent' }}>
                            {opt === q.correct_answer ? '✓ ' : ''}{opt}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize:'11px', color:'#00c97a' }}>Answer: {q.correct_answer}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:800, marginBottom:'16px' }}>Users</div>
            <div style={{ background:'#171717', border:'1px solid #2c2c2c', borderRadius:'16px', overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #2c2c2c' }}>
                    {['Name', 'Email', 'Role', 'Department', 'XP'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:'10px', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:'#888' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom:'1px solid rgba(44,44,44,0.5)' }}>
                      <td style={{ padding:'13px 16px', fontSize:'13px', fontWeight:600 }}>{u.name}</td>
                      <td style={{ padding:'13px 16px', fontSize:'13px', color:'#888' }}>{u.email}</td>
                      <td style={{ padding:'13px 16px' }}>
                        <span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'99px', background: u.role === 'admin' ? 'rgba(245,194,0,0.12)' : 'rgba(59,130,246,0.12)', color: u.role === 'admin' ? '#f5c200' : '#3b82f6', fontWeight:600 }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding:'13px 16px', fontSize:'13px', color:'#888' }}>{u.department || '—'}</td>
                      <td style={{ padding:'13px 16px', fontSize:'13px', color:'#f5c200', fontWeight:600 }}>⚡ {u.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}