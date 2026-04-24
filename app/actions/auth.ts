'use server'
import { redirect } from 'next/navigation'
import { RegisterSchema, LoginSchema, type FormState } from '@/lib/definitions'
import { createSession, deleteSession } from '@/lib/session'
import {
  getUserByEmail,
  createMoodleUser,
  enrollUser,
  validateMoodleLogin,
} from '@/lib/moodle'

const courseIds = (process.env.MOODLE_COURSE_IDS ?? '')
  .split(',')
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean)

export async function register(state: FormState, formData: FormData): Promise<FormState> {
  const validated = RegisterSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { firstName, lastName, email, password } = validated.data

  try {
    let user = await getUserByEmail(email)

    if (!user) {
      user = await createMoodleUser(firstName, lastName, email, password)
    }

    for (const courseId of courseIds) {
      try {
        await enrollUser(user.id, courseId)
      } catch {
        // Already enrolled — safe to ignore
      }
    }

    await createSession(user.id, user.fullname || `${firstName} ${lastName}`, email)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
    return { message: msg }
  }

  redirect('/feed')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  try {
    const user = await validateMoodleLogin(email, password)
    if (!user) {
      return { message: 'Invalid email or password.' }
    }
    await createSession(user.id, user.fullname, email)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
    return { message: msg }
  }

  redirect('/feed')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}
