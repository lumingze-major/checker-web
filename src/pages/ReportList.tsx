import { useState, useMemo } from 'react'
import { Plus, Search, X, ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal, Edit3, Trash2, Filter, Check } from 'lucide-react'
import { templates, latestVersions } from '../data/mock'
import type { CompareReport } from '../types'
import { showToast } from '../components/Toast'

interface ReportListProps {
  reports: CompareReport[]
  onViewReport: (report: CompareReport) => void
  onAddReport: (report: CompareReport) => void
  onDeleteReport: (id: string) => void
  onRenameReport: (id: string, name: string) => void
}

type SortKey = 'name' | 'createdAt' | 'summaryPrecision' | 'summaryFPR'
type SortDir = 'asc' | 'desc'

const statusConfig = {
  completed: { label: '已完成', className: 'text-emerald-600 bg-emerald-50' },
  running: { label: '运行中', className: 'text-amber-600 bg-amber-50' },
  failed: { label: '失败', className: 'text-red-600 bg-red-50' },
}

const allStati = ['completed', 'running', 'failed'] as const

export default function ReportList({ reports, onViewReport, onAddReport, onDeleteReport, onRenameReport }: ReportListProps) {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set(allStati))
  const [filterTemplate, setFilterTemplate] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'createdAt' ? 'desc' : 'asc')
    }
  }

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => {
    const active = sortKey === k
    const Icon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
    return (
      <button onClick={() => handleSort(k)} className={`inline-flex items-center gap-0.5 font-medium transition-colors ${active ? 'text-accent' : 'text-muted hover:text-zinc-600'}`}>
        {label}
        <Icon size={11} />
      </button>
    )
  }

  const filtered = useMemo(() => {
    let list = [...reports]

    if (search) {
      list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    }

    list = list.filter(r => filterStatus.has(r.status))

    if (filterTemplate) {
      list = list.filter(r => r.templateId === filterTemplate)
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'summaryPrecision') cmp = a.summaryPrecision - b.summaryPrecision
      else if (sortKey === 'summaryFPR') cmp = a.summaryFPR - b.summaryFPR
      else cmp = a.createdAt.localeCompare(b.createdAt)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [reports, search, sortKey, sortDir, filterStatus, filterTemplate])

  const activeFilterCount = (filterStatus.size < 3 ? 1 : 0) + (filterTemplate ? 1 : 0)

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-800 tracking-tight">对比报告</h1>
          <p className="mt-0.5 text-xs text-muted">共 {reports.length} 条报告</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={14} />
          新建对比报告
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="搜索报告名称..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-700 placeholder:text-muted outline-none focus:border-accent"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors ${activeFilterCount > 0 ? 'border-accent text-accent bg-accent-light' : 'border-border text-muted hover:bg-zinc-50'}`}
          >
            <Filter size={12} />
            筛选
            {activeFilterCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">{activeFilterCount}</span>}
          </button>
          {showFilters && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-white p-3 shadow-sm" onClick={e => e.stopPropagation()}>
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-muted uppercase">报告状态</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {allStati.map(s => {
                  const active = filterStatus.has(s)
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        const next = new Set(filterStatus)
                        if (active && filterStatus.size > 1) next.delete(s)
                        else if (!active) next.add(s)
                        setFilterStatus(next)
                      }}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${active ? 'bg-accent text-white' : 'bg-zinc-100 text-zinc-600'}`}
                    >
                      {statusConfig[s].label}
                    </button>
                  )
                })}
              </div>
              <div className="mb-2">
                <span className="text-[10px] font-semibold text-muted uppercase">评测模板</span>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setFilterTemplate(null)}
                  className={`block w-full rounded px-2 py-1 text-left text-[11px] transition-colors ${!filterTemplate ? 'bg-accent-light text-accent' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                  全部
                </button>
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterTemplate(t.id)}
                    className={`block w-full rounded px-2 py-1 text-left text-[11px] transition-colors ${filterTemplate === t.id ? 'bg-accent-light text-accent' : 'text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={() => { setFilterStatus(new Set(allStati)); setFilterTemplate(null) }} className="flex items-center gap-0.5 text-xs text-muted hover:text-zinc-600">
            <X size={12} />
            清除
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-zinc-50">
              <th className="px-4 py-2.5 text-left font-medium"><SortHeader k="name" label="报告名称" /></th>
              <th className="px-4 py-2.5 text-left font-medium text-muted">对比版本</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted">评测模板</th>
              <th className="px-4 py-2.5 text-right font-medium"><SortHeader k="summaryPrecision" label="综合准召" /></th>
              <th className="px-4 py-2.5 text-right font-medium"><SortHeader k="summaryFPR" label="综合误检" /></th>
              <th className="px-4 py-2.5 text-center font-medium text-muted">状态</th>
              <th className="px-4 py-2.5 text-right font-medium"><SortHeader k="createdAt" label="创建时间" /></th>
              <th className="px-4 py-2.5 text-center font-medium text-muted w-[60px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const st = statusConfig[r.status]
              return (
                <tr key={r.id} className="border-b border-border last:border-0 transition-colors hover:bg-zinc-50/80 group">
                  <td className="px-4 py-3">
                    {renameId === r.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              onRenameReport(r.id, renameValue)
                              setRenameId(null)
                            }
                            if (e.key === 'Escape') setRenameId(null)
                          }}
                          className="w-full rounded border border-accent px-2 py-0.5 text-xs outline-none"
                          autoFocus
                        />
                        <button onClick={() => { onRenameReport(r.id, renameValue); setRenameId(null) }} className="rounded bg-accent p-0.5 text-white"><Check size={12} /></button>
                        <button onClick={() => setRenameId(null)} className="rounded p-0.5 text-muted"><X size={12} /></button>
                      </div>
                    ) : (
                      <span className="font-medium text-zinc-800">{r.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700">{r.currentVersion}</span>
                      <span className="text-muted">vs</span>
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-700">{r.baselineVersion}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{r.templateName}</td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'completed' ? (
                      <div>
                        <span className="font-mono text-xs font-medium text-zinc-800">{r.summaryPrecision.toFixed(1)}%</span>
                      </div>
                    ) : <span className="text-muted">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'completed' ? (
                      <span className="font-mono text-xs text-zinc-800">{r.summaryFPR.toFixed(1)}%</span>
                    ) : <span className="text-muted">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${r.status === 'completed' ? 'bg-emerald-500' : r.status === 'running' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted">{r.createdAt}</td>
                  <td className="px-4 py-3 text-center relative">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewReport(r)}
                        disabled={r.status !== 'completed'}
                        className={`text-xs font-medium transition-colors ${
                          r.status === 'completed'
                            ? 'text-accent hover:text-blue-800'
                            : 'text-zinc-300 cursor-not-allowed'
                        }`}
                      >
                        查看
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                          className="rounded p-1 text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-100"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                        {menuOpenId === r.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-28 rounded-lg border border-border bg-white py-1 shadow-sm">
                            <button
                              onClick={() => { setRenameId(r.id); setRenameValue(r.name); setMenuOpenId(null) }}
                              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[11px] text-zinc-700 transition-colors hover:bg-zinc-50"
                            >
                              <Edit3 size={11} />
                              重命名
                            </button>
                            <button
                              onClick={() => { onDeleteReport(r.id); setMenuOpenId(null) }}
                              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[11px] text-red-600 transition-colors hover:bg-red-50"
                            >
                              <Trash2 size={11} />
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted">
            <Search size={24} className="mb-2 opacity-30" />
            <p className="text-xs">{reports.length === 0 ? '暂无对比报告' : '未找到匹配的报告'}</p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateReportDialog onClose={() => setShowCreate(false)} onCreated={onAddReport} />
      )}
    </div>
  )
}

function CreateReportDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (r: CompareReport) => void }) {
  const [name, setName] = useState('')
  const [currentVer, setCurrentVer] = useState(latestVersions[0])
  const [baselineVer, setBaselineVer] = useState(latestVersions[3])
  const [template, setTemplate] = useState(templates[0])
  const [showTplOptions, setShowTplOptions] = useState(false)
  const [showCurrentOpts, setShowCurrentOpts] = useState(false)
  const [showBaselineOpts, setShowBaselineOpts] = useState(false)

  const handleCreate = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`

    const newReport: CompareReport = {
      id: `r-${Date.now()}`,
      name: name || `${currentVer} vs ${baselineVer} 对比`,
      currentVersion: currentVer,
      baselineVersion: baselineVer,
      templateId: template.id,
      templateName: template.name,
      summaryPrecision: 0,
      summaryFPR: 0,
      summaryMiss: 0,
      summaryFps: 0,
      status: 'running',
      createdAt: ts,
    }

    onCreated(newReport)
    showToast('info', '对比报告已提交，正在评估中...')
    onClose()

    setTimeout(() => {
      onCreated({
        ...newReport,
        status: 'completed' as const,
        summaryPrecision: +(85 + Math.random() * 13).toFixed(1),
        summaryFPR: +(1 + Math.random() * 6).toFixed(1),
        summaryMiss: +(1 + Math.random() * 6).toFixed(1),
        summaryFps: +(96 + Math.random() * 3.5).toFixed(1),
      })
      showToast('success', `「${newReport.name}」评估完成`)
    }, 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-white shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-zinc-800">新建对比报告</h2>
          <button onClick={onClose} className="rounded p-0.5 text-muted transition-colors hover:bg-zinc-100">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-700">报告名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入报告名称..."
              className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-muted outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">当前版本</label>
              <button
                onClick={() => { setShowCurrentOpts(!showCurrentOpts); setShowBaselineOpts(false); setShowTplOptions(false) }}
                className="flex w-full items-center justify-between rounded-md border border-border bg-white px-3 py-1.5 text-xs text-zinc-800"
              >
                {currentVer}
                <ChevronDown size={12} className="text-muted" />
              </button>
              {showCurrentOpts && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-white py-1 shadow-sm">
                  {latestVersions.map(v => (
                    <button key={v} onClick={() => { setCurrentVer(v); setShowCurrentOpts(false) }} className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-50 ${v === currentVer ? 'text-accent' : 'text-zinc-700'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">基准版本</label>
              <button
                onClick={() => { setShowBaselineOpts(!showBaselineOpts); setShowCurrentOpts(false); setShowTplOptions(false) }}
                className="flex w-full items-center justify-between rounded-md border border-border bg-white px-3 py-1.5 text-xs text-zinc-800"
              >
                {baselineVer}
                <ChevronDown size={12} className="text-muted" />
              </button>
              {showBaselineOpts && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-white py-1 shadow-sm">
                  {latestVersions.map(v => (
                    <button key={v} onClick={() => { setBaselineVer(v); setShowBaselineOpts(false) }} className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-50 ${v === baselineVer ? 'text-accent' : 'text-zinc-700'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium text-zinc-700">评测模板</label>
            <button
              onClick={() => { setShowTplOptions(!showTplOptions); setShowCurrentOpts(false); setShowBaselineOpts(false) }}
              className="flex w-full items-center justify-between rounded-md border border-border bg-white px-3 py-1.5 text-xs text-zinc-800"
            >
              {template.name}
              <ChevronDown size={12} className="text-muted" />
            </button>
            {showTplOptions && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-border bg-white py-1 shadow-sm">
                {templates.map(t => (
                  <button key={t.id} onClick={() => { setTemplate(t); setShowTplOptions(false) }} className={`w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-zinc-50 ${t.id === template.id ? 'text-accent' : 'text-zinc-700'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md border border-border bg-zinc-50 p-3">
            <div className="mb-2">
              <span className="text-xs font-medium text-zinc-600">数据集分类</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {template.categories.map(c => (
                  <span key={c.id} className="rounded bg-white px-2 py-0.5 text-xs text-zinc-600 border border-border">{c.name}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-600">评估指标</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {template.metrics.map(m => (
                  <span key={m} className="rounded bg-white px-2 py-0.5 text-xs text-zinc-600 border border-border">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-border px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
            取消
          </button>
          <button onClick={handleCreate} className="rounded-md bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
            创建并运行
          </button>
        </div>
      </div>
    </div>
  )
}
