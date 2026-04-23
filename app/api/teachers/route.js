import { WebUntis } from 'webuntis'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { username, password } = await req.json()
  try {
    const untis = new WebUntis('gydo', username, password, 'gydo.webuntis.com')
    await untis.login()

    const teachers = await untis.getTeachers()
    const rooms = await untis.getRooms()

    await untis.logout()
    return NextResponse.json({ teachers, rooms })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
