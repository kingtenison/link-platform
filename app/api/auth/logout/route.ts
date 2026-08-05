import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
