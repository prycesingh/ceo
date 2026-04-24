import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { enrollUser } from '@/lib/moodle'

const allowedIds = (process.env.MOODLE_COURSE_IDS ?? '')
  .split(',')
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean)

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = await req.json()
  if (!allowedIds.includes(courseId)) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  try {
    await enrollUser(session.userId, courseId)
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to subscribe'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
