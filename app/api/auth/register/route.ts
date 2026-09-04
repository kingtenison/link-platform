import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/service'

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

    const authClient = await createClient()

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (data.user) {
      // Upsert into public.users for app-specific data
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(
          {
            id: data.user.id,
            email: data.user.email!,
            name,
            plan_type: 'free',
            total_links: 0,
            total_clicks: 0,
          },
          { onConflict: 'id' }
        )

      if (upsertError) {
        console.error('Failed to upsert public.users:', upsertError)
      }
    }

    // Check if email confirmation is required
    const emailConfirmed = data.user?.email_confirmed_at != null

    return NextResponse.json({
      message: emailConfirmed
        ? 'User created successfully'
        : 'Account created. Please check your email to confirm your account.',
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            name,
          }
        : null,
      confirmation_required: !emailConfirmed,
    })
  } catch (error) {
    const err = error as { message?: string }
    console.error('Register error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
