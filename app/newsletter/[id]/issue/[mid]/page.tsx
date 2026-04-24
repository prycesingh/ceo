import { notFound } from 'next/navigation'
import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { getCourseContents, getCourses } from '@/lib/moodle'
import VideoPlayer from '@/components/VideoPlayer'
import FileDownload from '@/components/FileDownload'
import ReactionBar from '@/components/ReactionBar'
import PortalShell from '@/components/PortalShell'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import type { MoodleContent } from '@/lib/definitions'

const allowedIds = (process.env.MOODLE_COURSE_IDS ?? '')
  .split(',')
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean)

const MOODLE_TOKEN = process.env.MOODLE_TOKEN ?? ''

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#1B4FD8 0%,#3B82F6 100%)',
  'linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)',
  'linear-gradient(135deg,#059669 0%,#34D399 100%)',
  'linear-gradient(135deg,#D97706 0%,#FCD34D 100%)',
]

function isVideoUrl(url?: string) {
  return !!(url && (url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo')))
}

function isVideoFile(mime?: string) {
  return !!mime?.startsWith('video/')
}

function appendToken(url: string) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}token=${MOODLE_TOKEN}`
}

async function fetchPageHtml(fileurl: string): Promise<string> {
  try {
    const res = await fetch(appendToken(fileurl), { cache: 'no-store' })
    if (!res.ok) return ''
    const html = await res.text()
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    return bodyMatch ? bodyMatch[1] : html
  } catch {
    return ''
  }
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(ts: number): string {
  if (!ts) return ''
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

type ContentBlock =
  | { type: 'video'; url: string; title: string }
  | { type: 'html'; html: string }
  | { type: 'file'; content: MoodleContent }

export default async function IssuePage({ params }: { params: Promise<{ id: string; mid: string }> }) {
  const { id, mid } = await params
  const courseId = parseInt(id, 10)
  const sectionId = parseInt(mid, 10)

  if (!allowedIds.includes(courseId)) notFound()

  await verifySession()

  const [courses, sections] = await Promise.all([
    getCourses([courseId]),
    getCourseContents(courseId),
  ])

  const course = courses[0]
  const section = sections.find((s) => s.id === sectionId)
  if (!course || !section) notFound()

  const blocks: ContentBlock[] = []
  const downloadFiles: MoodleContent[] = []

  if (section.summary?.trim() && section.summary.replace(/<[^>]+>/g, '').trim()) {
    blocks.push({ type: 'html', html: section.summary })
  }

  for (const mod of section.modules) {
    if (!mod.uservisible) continue
    if (mod.modname === 'url' && mod.url) {
      if (isVideoUrl(mod.url)) blocks.push({ type: 'video', url: mod.url, title: mod.name })
      continue
    }
    if (mod.modname === 'page') {
      const htmlFile = mod.contents?.find((c) => c.type === 'file' && (c.filename?.endsWith('.html') || c.mimetype?.includes('html')))
      if (htmlFile?.fileurl) {
        const html = await fetchPageHtml(htmlFile.fileurl)
        if (html) blocks.push({ type: 'html', html })
      } else if (mod.description?.trim()) {
        blocks.push({ type: 'html', html: mod.description })
      }
      continue
    }
    if (mod.modname === 'resource' && mod.contents) {
      for (const c of mod.contents) {
        if (c.type !== 'file') continue
        if (isVideoFile(c.mimetype) && c.fileurl) blocks.push({ type: 'video', url: appendToken(c.fileurl), title: mod.name })
        else downloadFiles.push(c)
      }
      continue
    }
    if (mod.modname === 'folder' && mod.contents) {
      for (const c of mod.contents) { if (c.type === 'file') downloadFiles.push(c) }
    }
  }

  const visibleSections = sections.filter((s) => s.name && s.name !== 'General' && s.modules.length > 0)
  const sectionIndex = visibleSections.findIndex((s) => s.id === sectionId)
  const issueNum = visibleSections.length - sectionIndex
  const ts = section.modules[0]?.dates?.[0]?.timestamp
  const htmlBlocks = blocks.filter((b) => b.type === 'html') as { type: 'html'; html: string }[]
  const totalHtml = htmlBlocks.map((b) => b.html).join(' ')
  const readMins = estimateReadTime(totalHtml)
  const coverGradient = COVER_GRADIENTS[courseId % COVER_GRADIENTS.length]

  return (
    <PortalShell>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href={`/newsletter/${courseId}`} className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--color-ink-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to {course.fullname}
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: coverGradient }}>
              Edition #{issueNum}
            </span>
            {ts && <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-ink-muted)' }}><Calendar className="w-3.5 h-3.5" />{formatDate(ts)}</span>}
            {totalHtml.length > 50 && <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-ink-muted)' }}><Clock className="w-3.5 h-3.5" />{readMins} min read</span>}
          </div>
          <h1 className="font-black leading-tight" style={{ fontFamily: 'var(--font-merriweather), Georgia, serif', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
            {section.name}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-ink-muted)' }}>{course.fullname}</p>
          <div className="mt-6 h-px" style={{ background: 'linear-gradient(90deg, var(--color-brand) 0%, transparent 100%)', opacity: 0.3 }} />
        </div>

        <div className="space-y-8">
          {blocks.map((block, i) => {
            if (block.type === 'video') return <VideoPlayer key={i} url={block.url} title={block.title} />
            if (block.type === 'html') return <div key={i} className="prose-newsletter" style={{ color: 'var(--color-ink)' }} dangerouslySetInnerHTML={{ __html: block.html }} />
            return null
          })}
        </div>

        {downloadFiles.length > 0 && <div className="mt-10"><FileDownload files={downloadFiles} moodleUrl="" token="" /></div>}

        {blocks.length === 0 && downloadFiles.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--color-ink-muted)' }}><p>This edition has no content yet.</p></div>
        )}

        <div className="mt-12"><ReactionBar issueId={`${courseId}-${sectionId}`} /></div>

        <div className="flex justify-between items-center mt-10 pt-8 border-t gap-4" style={{ borderColor: 'var(--color-border)' }}>
          {sectionIndex < visibleSections.length - 1 ? (
            <Link href={`/newsletter/${courseId}/issue/${visibleSections[sectionIndex + 1].id}`}
              className="group flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all hover:border-blue-300 hover:bg-blue-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand)' }}>
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span><span className="block text-xs text-gray-400 font-normal">Previous</span><span className="line-clamp-1 max-w-36">{visibleSections[sectionIndex + 1].name}</span></span>
            </Link>
          ) : <span />}
          {sectionIndex > 0 ? (
            <Link href={`/newsletter/${courseId}/issue/${visibleSections[sectionIndex - 1].id}`}
              className="group flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all hover:border-blue-300 hover:bg-blue-50 text-right"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand)' }}>
              <span><span className="block text-xs text-gray-400 font-normal">Next</span><span className="line-clamp-1 max-w-36">{visibleSections[sectionIndex - 1].name}</span></span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : <span />}
        </div>
      </div>
    </PortalShell>
  )
}
