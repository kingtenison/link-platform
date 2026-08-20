import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()


    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email)
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(email, password, name)

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string; hint?: string }
    console.error('Register error details:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    })
    
    return NextResponse.json(
      { error: err.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
