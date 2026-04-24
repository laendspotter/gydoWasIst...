import { WebUntis, WebUntisQR } from 'webuntis'
import { NextResponse } from 'next/server'

async function getUntis(username, password, otp) {
  if (otp) {
    const u = new WebUntisQR('gydo', username, password, 'gydo.webuntis.com')
    await u.login(otp)
    return u
  }
  const u = new WebUntis('gydo', username, password, 'gydo.webuntis.com')
  await u.login()
  return u
}

export async function POST(req) {
  const { username, password, otp } = await req.json()
  let untis
  try {
    untis = await getUntis(username, password, otp)

    const today = new Date()
    const in2weeks = new Date()
    in2weeks.setDate(today.getDate() + 14)

    const timetable = await untis.getOwnTimetableForRange(today, in2weeks)
    const news = await untis.getNewsWidget(today)

    // schuljahr-startdatum holen für tracker
    let schoolYearStart = null
    let schoolYearEnd = null
    try {
      const schoolYears = await untis.getSchoolyears()
      if (schoolYears?.length) {
        // neuestes schuljahr (aktuelles)
        const current = schoolYears[schoolYears.length - 1]
        schoolYearStart = current.startDate
        schoolYearEnd = current.endDate
      }
    } catch {}

    await untis.logout()
    return NextResponse.json({ timetable, news, schoolYearStart, schoolYearEnd })
  } catch (e) {
    try { await untis?.logout() } catch {}
    return NextResponse.json({ error: e.message, timetable: [], news: null }, { status: 500 })
  }
}
