import { FileText, LayoutTemplate, FileDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface LayoutProps {
  currentPage: string
  onNavigate: (page: 'reports' | 'templates') => void
  children: ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const navItems = [
    { key: 'reports' as const, label: '对比报告', icon: FileText },
    { key: 'templates' as const, label: '评测模板', icon: LayoutTemplate },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
                PE
              </div>
              <span className="text-sm font-semibold text-zinc-800">感知评测平台</span>
            </div>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = currentPage === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-accent-light text-accent'
                        : 'text-muted hover:bg-zinc-100 hover:text-zinc-700'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>具身智能 - 手部关键点</span>
            <span className="text-border">|</span>
            <FileDown size={14} className="text-muted" />
            <span className="text-muted">导出</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-5">{children}</main>
    </div>
  )
}
