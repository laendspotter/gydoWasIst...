import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const ADMIN_USER = process.env.ADMIN_UNTIS_USER

// POST /api/admin/reset — halbjahres-reset
// löscht alle quotes mit < 10 upvotes
export async function POST(req) {
  try {
    const { adminUser, action } = await req.json()

    if (!ADMIN_USER || adminUser !== ADMIN_USER) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    if (action === 'halbjahr_reset') {
      const keys = await kv.keys('quotes:*')
      let deletedCount = 0
      let keptCount = 0

      for (const key of keys) {
        const quotes = await kv.lrange(key, 0, -1)
        const parsed = quotes.map(q => typeof q === 'string' ? JSON.parse(q) : q)
        const keep = parsed.filter(q => q.upvotes >= 10)
        const del = parsed.length - keep.length

        deletedCount += del
        keptCount += keep.length

        await kv.del(key)
        for (const q of [...keep].reverse()) {
          await kv.lpush(key, JSON.stringify(q))
        }
      }

      // auch raumnotizen resetten
      const roomKeys = await kv.keys('room:*')
      for (const key of roomKeys) {
        await kv.del(key)
      }

      return NextResponse.json({
        ok: true,
        message: `Reset done: ${deletedCount} Zitate gelöscht, ${keptCount} behalten (≥10 Upvotes). ${roomKeys.length} Räume geleert.`
      })
    }

    return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
