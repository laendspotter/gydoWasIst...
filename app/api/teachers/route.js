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
    const teachers = await untis.getTeachers()
    const rooms = await untis.getRooms()
    await untis.logout()
    return NextResponse.json({ teachers, rooms })
  } catch (e) {
    try { await untis?.logout() } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
