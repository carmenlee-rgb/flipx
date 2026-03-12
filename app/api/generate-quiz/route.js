import { NextResponse } from 'next/server'

export async function POST(request) {
  const { cards, moduleId } = await request.json()

  const cardContent = cards.map((c, i) => `Card ${i+1}:\nQ: ${c.front}\nA: ${c.back}`).join('\n\n')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a quiz generator. Based on these flashcards, generate a quiz with mixed question types.

${cardContent}

Generate exactly ${Math.min(cards.length, 5)} questions. Mix between: mcq (4 options), truefalse, fillintheblank.

Respond ONLY with a valid JSON array, no other text:
[
  {
    "question": "question text",
    "question_type": "mcq",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A"
  },
  {
    "question": "True or False: statement",
    "question_type": "truefalse",
    "options": ["True", "False"],
    "correct_answer": "True"
  },
  {
    "question": "Fill in the blank: ___",
    "question_type": "fillintheblank",
    "options": null,
    "correct_answer": "answer"
  }
]`
      }]
    })
  })

  const data = await response.json()
  const text = data.content[0].text.trim()

  let questions
  try {
    questions = JSON.parse(text)
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    questions = match ? JSON.parse(match[0]) : []
  }

  return NextResponse.json({ questions })
}
