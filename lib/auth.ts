import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-this'
)

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return token
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.userId as string
  } catch {
    return null
  }
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  
  if (error) {
    console.error('Error getting user by email:', error)
    return null
  }
  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  
  if (error) {
    console.error('Error getting user by id:', error)
    return null
  }
  return data
}

export async function createUser(email: string, password: string, name: string) {
  try {
    const hashedPassword = await hashPassword(password)
    
    console.log('>>> Creating user with hashed password:', { email, name })
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          name,
          plan_type: 'free',
          total_links: 0,
          total_clicks: 0
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('>>> Supabase insert error:', error)
      throw new Error(error.message)
    }
    
    console.log('>>> User created:', data.id)
    return data
  } catch (error) {
    console.error('>>> Create user error:', error)
    throw error
  }
}
