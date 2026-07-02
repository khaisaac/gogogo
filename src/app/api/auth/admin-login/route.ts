import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signInUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.role !== 'admin' || !user.password_hash) {
      return NextResponse.json(
        { error: 'Email atau password salah / akun bukan admin.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    const sessionToken = await signInUser({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      session: sessionToken,
    });
  } catch (err: any) {
    console.error('Admin login API error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mencoba login.' },
      { status: 500 }
    );
  }
}
