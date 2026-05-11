import { NextResponse } from 'next/server'
import { createOtp } from '@/lib/auth'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const code = await createOtp(email)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: resendError } = await resend.emails.send({
      from: 'Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>',
      to: email,
      subject: 'Your Login Code - Trekking Mount Rinjani',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Please use the following 6-digit code to sign in:</p>
          <div style="background: #f4f4f4; padding: 12px 24px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">This code will expire in 10 minutes.</p>
        </div>
      `,
    })

    if (resendError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'OTP sent successfully. Check your email.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
