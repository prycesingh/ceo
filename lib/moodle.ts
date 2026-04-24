import 'server-only'
import type { MoodleUser, MoodleCourse, MoodleSection } from './definitions'

const MOODLE_URL = process.env.MOODLE_URL!
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!
const BASE = `${MOODLE_URL}/webservice/rest/server.php`

async function moodleRequest<T>(wsfunction: string, params: Record<string, string> = {}): Promise<T> {
  const body = new URLSearchParams({
    wstoken: MOODLE_TOKEN,
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  })

  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Moodle HTTP error: ${res.status}`)

  const data = await res.json()
  if (data?.exception) throw new Error(data.message || data.exception)

  return data as T
}

export async function getUserByEmail(email: string): Promise<MoodleUser | null> {
  const res = await moodleRequest<MoodleUser[]>('core_user_get_users_by_field', {
    field: 'email',
    'values[0]': email,
  })
  return Array.isArray(res) ? (res[0] ?? null) : null
}

export async function createMoodleUser(
  firstname: string,
  lastname: string,
  email: string,
  password: string,
): Promise<MoodleUser> {
  const username = generateUsername(email)
  const users = await moodleRequest<MoodleUser[]>('core_user_create_users', {
    'users[0][username]': username,
    'users[0][password]': password,
    'users[0][firstname]': firstname,
    'users[0][lastname]': lastname,
    'users[0][email]': email,
    'users[0][auth]': 'manual',
  })
  return users[0]
}

export async function enrollUser(userId: number, courseId: number): Promise<void> {
  await moodleRequest('enrol_manual_enrol_users', {
    'enrolments[0][roleid]': '5',
    'enrolments[0][userid]': String(userId),
    'enrolments[0][courseid]': String(courseId),
  })
}

export async function unenrollUser(userId: number, courseId: number): Promise<void> {
  await moodleRequest('enrol_manual_unenrol_users', {
    'enrolments[0][userid]': String(userId),
    'enrolments[0][courseid]': String(courseId),
    'enrolments[0][roleid]': '5',
  })
}

export async function getCourses(courseIds: number[]): Promise<MoodleCourse[]> {
  const params: Record<string, string> = {}
  courseIds.forEach((id, i) => {
    params[`options[ids][${i}]`] = String(id)
  })
  return moodleRequest<MoodleCourse[]>('core_course_get_courses', params)
}

export async function getCourseContents(courseId: number): Promise<MoodleSection[]> {
  return moodleRequest<MoodleSection[]>('core_course_get_contents', {
    courseid: String(courseId),
  })
}

export async function getUserEnrolledCourseIds(userId: number): Promise<number[]> {
  const courses = await moodleRequest<MoodleCourse[]>('core_enrol_get_users_courses', {
    userid: String(userId),
  })
  return courses.map((c) => c.id)
}

export async function validateMoodleLogin(email: string, password: string): Promise<MoodleUser | null> {
  const user = await getUserByEmail(email)
  if (!user) return null

  try {
    const res = await fetch(
      `${MOODLE_URL}/login/token.php?username=${encodeURIComponent(user.username)}&password=${encodeURIComponent(password)}&service=moodle_mobile_app`,
      { method: 'GET', cache: 'no-store' },
    )
    const data = await res.json()
    if (data.token) return user
    return null
  } catch {
    return null
  }
}

function generateUsername(email: string): string {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  return `${base}${suffix}`
}
