import { WebUntis } from 'webuntis'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { username, password } = await req.json()
  try {
    const untis = new WebUntis('gydo', username, password, 'gydo.webuntis.com')
    await untis.login()

    const today = new Date()
    const in2weeks = new Date()
    in2weeks.setDate(today.getDate() + 14)

    const timetable = await untis.getOwnTimetableForRange(today, in2weeks)
    const news = await untis.getNewsWidget(today)

    await untis.logout()
    return NextResponse.json({ timetable, news })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
