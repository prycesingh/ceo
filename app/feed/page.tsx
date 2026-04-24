import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { getCourses, getUserEnrolledCourseIds } from '@/lib/moodle'
import BellButton from '@/components/BellButton'
import PortalShell from '@/components/PortalShell'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'

const courseIds = (process.env.MOODLE_COURSE_IDS ?? '')
  .split(',')
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean)

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#1B4FD8 0%,#3B82F6 100%)',
  'linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)',
  'linear-gradient(135deg,#059669 0%,#34D399 100%)',
  'linear-gradient(135deg,#D97706 0%,#FCD34D 100%)',
]

export default async function FeedPage() {
  const session = await verifySession()

  let courses: Awaited<ReturnType<typeof getCourses>> = []
  let enrolledIds: number[] = []

  try {
    ;[courses, enrolledIds] = await Promise.all([
      getCourses(courseIds),
      getUserEnrolledCourseIds(session.userId),
    ])
  } catch {
    // handled below
  }

  const subscribedCourses = courses.filter((c) => enrolledIds.includes(c.id))
  const otherCourses = courses.filter((c) => !enrolledIds.includes(c.id))

  return (
    <PortalShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1B4FD8,#3B82F6)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-brand)' }}>Your feed</p>
          </div>
          <h1 className="font-black text-3xl md:text-4xl mb-2" style={{ fontFamily: 'var(--font-merriweather), Georgia, serif', color: 'var(--color-ink)' }}>
            Welcome back, {session.name.split(' ')[0]}
          </h1>
          <p className="text-base" style={{ color: 'var(--color-ink-muted)' }}>
            Manage your newsletter subscriptions and catch up on the latest editions.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-ink)' }} />
            <p className="text-xl font-bold mb-1" style={{ color: 'var(--color-ink)' }}>No newsletters yet</p>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Check back soon — new content is on the way.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {subscribedCourses.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-ink-muted)' }}>
                  Subscribed ({subscribedCourses.length})
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {subscribedCourses.map((course, i) => (
                    <NewsletterCard key={course.id} course={course} isSubscribed coverGradient={COVER_GRADIENTS[i % COVER_GRADIENTS.length]} />
                  ))}
                </div>
              </div>
            )}
            {otherCourses.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-ink-muted)' }}>
                  {subscribedCourses.length > 0 ? 'Discover more' : 'Available newsletters'} ({otherCourses.length})
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {otherCourses.map((course, i) => (
                    <NewsletterCard key={course.id} course={course} isSubscribed={false} coverGradient={COVER_GRADIENTS[(i + subscribedCourses.length) % COVER_GRADIENTS.length]} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalShell>
  )
}

function NewsletterCard({ course, isSubscribed, coverGradient }: { course: { id: number; fullname: string; summary?: string }; isSubscribed: boolean; coverGradient: string }) {
  return (
    <div className="group rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="h-24 relative overflow-hidden flex items-center justify-center" style={{ background: coverGradient }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        {isSubscribed && (
          <div className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
            ✓ Subscribed
          </div>
        )}
        <BookOpen className="w-8 h-8 text-white opacity-30" />
      </div>
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-lg leading-snug mb-1.5" style={{ fontFamily: 'var(--font-merriweather), Georgia, serif', color: 'var(--color-ink)' }}>
            {course.fullname}
          </h3>
          {course.summary && (
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--color-ink-muted)' }}
              dangerouslySetInnerHTML={{ __html: course.summary.replace(/<[^>]+>/g, '') }} />
          )}
        </div>
        <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <BellButton courseId={course.id} initialSubscribed={isSubscribed} />
          <Link href={`/newsletter/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all" style={{ backgroundColor: 'var(--color-brand)', color: 'white' }}>
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
