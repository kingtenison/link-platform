import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, getUserById } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const userId = await verifyToken(token)
    
    if (!userId) {
      const response = NextResponse.json({ user: null })
      response.cookies.set('token', '', { maxAge: 0, path: '/' })
      return response
    }

    const user = await getUserById(userId)
    
    if (!user) {
      const response = NextResponse.json({ user: null })
      response.cookies.set('token', '', { maxAge: 0, path: '/' })
      return response
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Me API error:', error)
    return NextResponse.json({ user: null })
  }
}
