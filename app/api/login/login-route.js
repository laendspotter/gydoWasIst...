import { WebUntis } from 'webuntis'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { username, password } = await req.json()
  try {
    const untis = new WebUntis('gydo', username, password, 'gydo.webuntis.net')
    await untis.login()
    await untis.logout()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}
