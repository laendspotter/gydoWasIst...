import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_UNTIS_USER

// GET /api/quotes?teacherId=123
// GET /api/quotes?top=week  (beste der woche, alle lehrer)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const teacherId = searchParams.get('teacherId')
  const top = searchParams.get('top')

  try {
    if (top === 'week') {
      // alle teacher-keys holen
      const keys = await kv.keys('quotes:*')
      let allQuotes = []
      for (const key of keys) {
        const quotes = await kv.lrange(key, 0, -1)
        const parsed = quotes.map(q => typeof q === 'string' ? JSON.parse(q) : q)
        const teacherId = key.replace('quotes:', '')
        // teacher-name aus key nicht verfügbar, wird vom client ergänzt
        allQuotes.push(...parsed.map(q => ({ ...q, _teacherKey: teacherId })))
      }
      // nur quotes aus den letzten 7 tagen
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const weekQuotes = allQuotes
        .filter(q => q.createdAt > weekAgo)
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
        .slice(0, 20)
      return NextResponse.json({ quotes: weekQuotes })
    }

    if (!teacherId) return NextResponse.json({ quotes: [] })
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
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

    const voteKey = `vote:${quoteId}:${username}`
    const existing = await kv.get(voteKey)
    if (existing) return NextResponse.json({ error: 'Bereits abgestimmt' }, { status: 409 })

    const quotes = await kv.lrange(`quotes:${teacherId}`, 0, -1)
    const parsed = quotes.map(q => typeof q === 'string' ? JSON.parse(q) : q)
    const idx = parsed.findIndex(q => q.id === quoteId)
    if (idx === -1) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })

    parsed[idx][vote === 'up' ? 'upvotes' : 'downvotes']++
    await kv.lset(`quotes:${teacherId}`, idx, JSON.stringify(parsed[idx]))
    await kv.set(voteKey, vote, { ex: 60 * 60 * 24 * 30 })

    return NextResponse.json({ ok: true, quote: parsed[idx] })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/quotes — admin löscht quote
export async function DELETE(req) {
  try {
    const { teacherId, quoteId, adminUser } = await req.json()

    if (!ADMIN_USER || adminUser !== ADMIN_USER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const quotes = await kv.lrange(`quotes:${teacherId}`, 0, -1)
    const parsed = quotes.map(q => typeof q === 'string' ? JSON.parse(q) : q)
    const filtered = parsed.filter(q => q.id !== quoteId)

    // liste neu aufbauen
    await kv.del(`quotes:${teacherId}`)
    for (const q of [...filtered].reverse()) {
      await kv.lpush(`quotes:${teacherId}`, JSON.stringify(q))
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
