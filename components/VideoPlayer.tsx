'use client'
import { useState } from 'react'
import { PlayCircle } from 'lucide-react'

interface Props {
  url: string
  title?: string
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.hostname.includes('youtu.be')
        ? u.pathname.slice(1)
        : u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    // ignore
  }
  return null
}

export default function VideoPlayer({ url, title }: Props) {
  const [playing, setPlaying] = useState(false)
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    // Direct video file
    return (
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
        <video controls className="w-full" src={url} title={title} />
      </div>
    )
  }

  if (!playing) {
    return (
      <button
        onClick={() => setPlaying(true)}
        className="relative w-full rounded-2xl overflow-hidden border aspect-video flex items-center justify-center group"
        style={{ borderColor: 'var(--color-border)', backgroundColor: '#0a0a0a' }}
      >
        <PlayCircle className="w-16 h-16 text-white opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all" />
        {title && (
          <span className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium truncate text-left">{title}</span>
        )}
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border aspect-video" style={{ borderColor: 'var(--color-border)' }}>
      <iframe
        src={`${embedUrl}?autoplay=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
