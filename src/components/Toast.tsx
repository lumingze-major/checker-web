import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
}

const colors = {
  success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  loading: 'text-amber-600 bg-amber-50 border-amber-200',
}

let toastId = 0
let addToastFn: ((t: ToastItem) => void) | null = null
let removeToastFn: ((id: string) => void) | null = null

export function showToast(type: ToastType, message: string, duration = 3000) {
  const id = `toast-${++toastId}`
  addToastFn?.({ id, type, message })
  if (type !== 'loading') {
    setTimeout(() => removeToastFn?.(id), duration)
  }
}

export function dismissToast(id: string) {
  removeToastFn?.(id)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    addToastFn = (t) => setToasts(prev => [...prev, t])
    removeToastFn = (id) => setToasts(prev => prev.filter(p => p.id !== id))
    return () => { addToastFn = null; removeToastFn = null }
  }, [])

  const remove = (id: string) => {
    setToasts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type]
        const isLoad = t.type === 'loading'
        return (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium shadow-sm min-w-[260px] ${colors[t.type]} ${isLoad ? '' : 'animate-slide-up'}`}
          >
            <Icon size={14} className={isLoad ? 'animate-spin' : ''} />
            <span className="flex-1">{t.message}</span>
            {!isLoad && (
              <button onClick={() => remove(t.id)} className="rounded p-0.5 opacity-60 hover:opacity-100">
                <X size={12} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
