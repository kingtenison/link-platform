import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByEmail, comparePassword, createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('>>> Login attempt for:', email)

    if (!email || !password) {
      console.log('>>> Missing credentials')
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await getUserByEmail(email)
    
    if (!user) {
      console.log('>>> User not found:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('>>> User found:', { id: user.id, hasHash: !!user.password_hash })

    if (!user.password_hash) {
      console.log('>>> No password hash for user')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Compare passwords
    const isValid = await comparePassword(password, user.password_hash)
    
    console.log('>>> Password valid:', isValid)

    if (!isValid) {
      console.log('>>> Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create token
    const token = await createToken(user.id)
    console.log('>>> Token created')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    console.log('>>> Cookie set successfully')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('>>> Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
