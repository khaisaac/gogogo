import { NextResponse } from 'next/server'
import { verifyOtp, findOrCreateUser, signInUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    const isValid = await verifyOtp(email, token)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    const user = await findOrCreateUser(email)
    const sessionToken = await signInUser(user)

    return NextResponse.json({
      message: 'Verification successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      session: sessionToken,
    })
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
