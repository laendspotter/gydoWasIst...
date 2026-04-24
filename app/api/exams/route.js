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
    const in8weeks = new Date()
    in8weeks.setDate(today.getDate() + 56)

    // exams und homework separat wrappen damit einer nicht den anderen killt
    let exams = []
    let homework = []

    try {
      exams = await untis.getExamsForRange(today, in8weeks) || []
    } catch {
      // 403 von gydo ist normal, einfach leer lassen
    }

    try {
      homework = await untis.getHomeWorksFor(today) || []
      // webuntis gibt manchmal object statt array zurück
      if (homework && !Array.isArray(homework)) {
        homework = homework.homeworks || homework.data || []
      }
    } catch {
      // auch ok wenn das nicht geht
    }

    await untis.logout()
    return NextResponse.json({ exams, homework })
  } catch (e) {
    try { await untis?.logout() } catch {}
    return NextResponse.json({ error: e.message, exams: [], homework: [] }, { status: 500 })
  }
}
