import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password required' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Password updated successfully',
      user: { id: data.id, email: data.email }
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
