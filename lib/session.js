import { getToken } from 'next-auth/jwt'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function getSessionUser(req) {
  const token = await getToken({ req, secret: authOptions.secret })
  if (!token) return null
  return { id: token.sub, ...token }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
