import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    console.log('Registration attempt:', { email, name })

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
  } catch (error: any) {
    console.error('Register error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
