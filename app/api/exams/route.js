import { WebUntis } from 'webuntis'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { username, password } = await req.json()
  try {
    const untis = new WebUntis('gydo', username, password, 'gydo.webuntis.com')
    await untis.login()

    const today = new Date()
    const in8weeks = new Date()
    in8weeks.setDate(today.getDate() + 56)

    const exams = await untis.getExamsForRange(today, in8weeks)
    const homework = await untis.getHomeWorksFor(today)

    await untis.logout()
    return NextResponse.json({ exams, homework })
  } catch (e) {
    return NextResponse.json({ error: e.message, exams: [], homework: [] }, { status: 500 })
  }
}
