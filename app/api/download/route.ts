import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const MOODLE_TOKEN = process.env.MOODLE_TOKEN!

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const fileurl = req.nextUrl.searchParams.get('url')
  const filename = req.nextUrl.searchParams.get('name') ?? 'download'

  if (!fileurl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  // Only allow downloads from our Moodle instance
  const moodleUrl = process.env.MOODLE_URL ?? ''
  if (!fileurl.startsWith(moodleUrl)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const sep = fileurl.includes('?') ? '&' : '?'
  const authedUrl = `${fileurl}${sep}token=${MOODLE_TOKEN}&forcedownload=1`

  try {
    const upstream = await fetch(authedUrl, { cache: 'no-store' })
    if (!upstream.ok) {
      return new NextResponse('File not found', { status: 404 })
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': String(body.byteLength),
      },
    })
  } catch {
    return new NextResponse('Failed to fetch file', { status: 500 })
  }
}
