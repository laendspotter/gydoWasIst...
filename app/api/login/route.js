import { WebUntis, WebUntisQR } from 'webuntis'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { username, password, otp } = await req.json()
  try {
    let untis
    if (otp) {
      // 2FA login
      untis = new WebUntisQR('gydo', username, password, 'gydo.webuntis.com')
      await untis.login(otp)
    } else {
      untis = new WebUntis('gydo', username, password, 'gydo.webuntis.com')
      try {
        await untis.login()
      } catch (e) {
        // webuntis wirft manchmal spezifischen error für 2FA-required
        if (e.message?.includes('2FA') || e.message?.includes('OTP') || e.message?.includes('token')) {
          return NextResponse.json({ ok: false, needs2FA: true })
        }
        throw e
      }
    }
    await untis.logout()
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e.message?.includes('2FA') || e.message?.includes('OTP') || e.message?.includes('token')) {
      return NextResponse.json({ ok: false, needs2FA: true })
    }
    return NextResponse.json({ ok: false, error: e.message }, { status: 401 })
  }
}
