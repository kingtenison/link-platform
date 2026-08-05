import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { hashPassword, verifyToken, comparePassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { newPassword, currentPassword } = await request.json()

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in first.' },
        { status: 401 }
      )
    }

    const userId = await verifyToken(token)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      )
    }

    if (currentPassword) {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (fetchError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const isCurrentValid = await comparePassword(currentPassword, user.password_hash)
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await hashPassword(newPassword)

    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', userId)
      .select('id, email')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Password updated successfully',
      user: { id: data.id, email: data.email },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
