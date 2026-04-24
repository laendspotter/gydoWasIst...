import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_UNTIS_USER

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  if (!roomId) return NextResponse.json({ notes: [] })

  try {
    const notes = await kv.lrange(`room:${roomId}`, 0, -1)
    const parsed = notes.map(n => typeof n === 'string' ? JSON.parse(n) : n)
    return NextResponse.json({ notes: parsed })
  } catch {
    return NextResponse.json({ notes: [] })
  }
}

export async function POST(req) {
  try {
    const { roomId, text, authorName } = await req.json()
    if (!roomId || !text?.trim() || !authorName?.trim()) {
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 })
    }

    const note = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: text.trim().slice(0, 300),
      authorName: authorName.trim().slice(0, 30),
      createdAt: Date.now(),
    }

    await kv.lpush(`room:${roomId}`, JSON.stringify(note))
    await kv.ltrim(`room:${roomId}`, 0, 19)
    return NextResponse.json({ ok: true, note })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { roomId, noteId, adminUser } = await req.json()

    if (!ADMIN_USER || adminUser !== ADMIN_USER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const notes = await kv.lrange(`room:${roomId}`, 0, -1)
    const parsed = notes.map(n => typeof n === 'string' ? JSON.parse(n) : n)
    const filtered = parsed.filter(n => n.id !== noteId)

    await kv.del(`room:${roomId}`)
    for (const n of [...filtered].reverse()) {
      await kv.lpush(`room:${roomId}`, JSON.stringify(n))
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
