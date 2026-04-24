import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from './session'
import type { SessionPayload } from './definitions'

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  return session
})

export const getOptionalSession = cache(async (): Promise<SessionPayload | null> => {
  return getSession()
})
