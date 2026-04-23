import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// GET /api/quotes?teacherId=123
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const teacherId = searchParams.get('teacherId')
  if (!teacherId) return NextResponse.json({ quotes: [] })

  try {
    const quotes = await kv.lrange(`quotes:${teacherId}`, 0, -1)
    const parsed = quotes.map(q => typeof q === 'string' ? JSON.parse(q) : q)
    return NextResponse.json({ quotes: parsed })
  } catch {
    return NextResponse.json({ quotes: [] })
  }
}

// POST /api/quotes — neues zitat
export async function POST(req) {
  try {
    const { teacherId, text, authorName } = await req.json()
    if (!teacherId || !text?.trim() || !authorName?.trim()) {
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
    }

    const quote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      text: text.trim().slice(0, 300),
      authorName: authorName.trim().slice(0, 30),
      createdAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
    }

    await kv.lpush(`quotes:${teacherId}`, JSON.stringify(quote))
    return NextResponse.json({ ok: true, quote })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/quotes — vote
export async function PATCH(req) {
  try {
    const { teacherId, quoteId, vote, username } = await req.json()
    if (!teacherId || !quoteId || !vote || !username) {
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
    }

    // check ob user schon gevoted hat
    const voteKey = `vote:${quoteId}:${username}`
    const existing = await kv.get(voteKey)
    if (existing) return NextResponse.json({ error: 'Bereits abgestimmt' }, { status: 409 })

    // find + update quote in list
    const quotes = await kv.lrange(`quotes:${teacherId}`, 0, -1)
    const parsed = quotes.map(q => typeof q === 'string' ? JSON.parse(q) : q)
    const idx = parsed.findIndex(q => q.id === quoteId)
    if (idx === -1) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

    parsed[idx][vote === 'up' ? 'upvotes' : 'downvotes']++

    // rebuild list (lset by index)
    await kv.lset(`quotes:${teacherId}`, idx, JSON.stringify(parsed[idx]))
    await kv.set(voteKey, vote, { ex: 60 * 60 * 24 * 30 }) // 30 tage

    return NextResponse.json({ ok: true, quote: parsed[idx] })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
