'use client'
import { useState, useEffect } from 'react'

const REACTIONS = [
  { emoji: '👏', label: 'Insightful', color: '#3B82F6' },
  { emoji: '🔥', label: 'On fire', color: '#EF4444' },
  { emoji: '💡', label: 'Learned something', color: '#F59E0B' },
  { emoji: '❤️', label: 'Inspiring', color: '#EC4899' },
]

interface Props {
  issueId: string
}

export default function ReactionBar({ issueId }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [animating, setAnimating] = useState<string | null>(null)
  const storageKey = `itbd-reaction-${issueId}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setSelected(saved)
    } catch {
      // localStorage unavailable
    }
  }, [storageKey])

  const react = (emoji: string) => {
    const next = selected === emoji ? null : emoji
    setSelected(next)
    setAnimating(emoji)
    setTimeout(() => setAnimating(null), 400)
    try {
      if (next) {
        localStorage.setItem(storageKey, next)
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>
        What did you think of this edition?
      </p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r) => {
          const isSelected = selected === r.emoji
          const isAnimating = animating === r.emoji
          return (
            <button
              key={r.emoji}
              onClick={() => react(r.emoji)}
              title={r.label}
              style={{
                borderColor: isSelected ? r.color : 'var(--color-border)',
                backgroundColor: isSelected ? `${r.color}14` : 'transparent',
                transform: isAnimating ? 'scale(1.25)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium cursor-pointer"
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: isAnimating ? 'scale(1.4)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }}
              >
                {r.emoji}
              </span>
              <span style={{ color: isSelected ? r.color : 'var(--color-ink-muted)' }}>
                {r.label}
              </span>
            </button>
          )
        })}
      </div>
      {selected && (
        <p className="mt-3 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
          Thanks for your reaction! You can change it anytime.
        </p>
      )}
    </div>
  )
}
