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
      // Clear invalid token
      cookieStore.delete('token')
      return NextResponse.json({ user: null })
    }

    const user = await getUserById(userId)
    
    if (!user) {
      cookieStore.delete('token')
      return NextResponse.json({ user: null })
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
    // Clear token on error
    try {
      const cookieStore = await cookies()
      cookieStore.delete('token')
    } catch (e) {}
    return NextResponse.json({ user: null })
  }
}
