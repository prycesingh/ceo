import Link from 'next/link'
import { verifySession } from '@/lib/dal'
import { logout } from '@/app/actions/auth'
import { LogOut, ChevronDown } from 'lucide-react'
import Logo from '@/components/Logo'

export default async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  const initials = session.name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-cream)' }}>

      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/feed">
            <Logo variant="light" size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-cream)' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#1B4FD8,#3B82F6)' }}
              >
                {initials}
              </div>
              <span className="text-sm font-medium max-w-32 truncate" style={{ color: 'var(--color-ink)' }}>
                {session.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-ink-muted)' }} />
            </div>

            <div
              className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#1B4FD8,#3B82F6)' }}
            >
              {initials}
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors hover:bg-red-50"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-muted)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8 mt-auto" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo variant="light" size="sm" />
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
            © {new Date().getFullYear()} IT By Design. All rights reserved.
          </p>
          <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--color-ink-muted)' }}>
            Visit homepage
          </Link>
        </div>
      </footer>
    </div>
  )
}
