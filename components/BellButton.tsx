'use client'
import { useState, useTransition } from 'react'
import { Bell, BellOff } from 'lucide-react'

interface Props {
  courseId: number
  initialSubscribed: boolean
}

export default function BellButton({ courseId, initialSubscribed }: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    startTransition(async () => {
      const endpoint = subscribed ? '/api/unsubscribe' : '/api/subscribe'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) setSubscribed((s) => !s)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={subscribed ? 'Unsubscribe from newsletter' : 'Subscribe to newsletter'}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 border"
      style={
        subscribed
          ? {
              borderColor: 'var(--color-brand)',
              backgroundColor: 'var(--color-brand-light)',
              color: 'var(--color-brand)',
            }
          : {
              borderColor: 'var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-ink-muted)',
            }
      }
    >
      {isPending ? (
        <span
          className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
          style={{ display: 'inline-block' }}
        />
      ) : subscribed ? (
        <Bell className="w-3.5 h-3.5 fill-current" />
      ) : (
        <BellOff className="w-3.5 h-3.5" />
      )}
      <span>{isPending ? '…' : subscribed ? 'Subscribed' : 'Subscribe'}</span>
    </button>
  )
}
