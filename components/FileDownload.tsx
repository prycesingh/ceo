import { Download, FileText, FileSpreadsheet, Presentation, File } from 'lucide-react'
import type { MoodleContent } from '@/lib/definitions'

interface Props {
  files: MoodleContent[]
  moodleUrl: string
  token: string
}

function getIcon(mime?: string) {
  if (!mime) return <File className="w-4 h-4" />
  if (mime.includes('pdf') || mime.includes('word')) return <FileText className="w-4 h-4" />
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return <FileSpreadsheet className="w-4 h-4" />
  if (mime.includes('presentation') || mime.includes('powerpoint')) return <Presentation className="w-4 h-4" />
  return <File className="w-4 h-4" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileDownload({ files }: Props) {
  if (!files.length) return null

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-ink-muted)' }}>
        Downloads
      </h3>
      <div className="space-y-2">
        {files.map((file, i) => {
          const downloadUrl = file.fileurl
            ? `/api/download?url=${encodeURIComponent(file.fileurl)}&name=${encodeURIComponent(file.filename ?? 'file')}`
            : '#'

          return (
            <a
              key={i}
              href={downloadUrl}
              download={file.filename}
              className="flex items-center gap-3 p-3.5 rounded-xl border group hover:shadow-sm transition-all"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'white' }}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-brand-light)', color: 'var(--color-brand)' }}>
                {getIcon(file.mimetype)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-ink)' }}>{file.filename}</p>
                {file.filesize > 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>{formatSize(file.filesize)}</p>
                )}
              </div>
              <Download className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-brand)' }} />
            </a>
          )
        })}
      </div>
    </div>
  )
}
