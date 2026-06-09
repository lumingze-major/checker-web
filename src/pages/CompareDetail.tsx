import { useMemo, useState } from 'react'
import { FileDown, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { getTemplateById, buildMetricRows } from '../data/mock'
import { exportCSV } from '../utils/export'
import type { CompareReport } from '../types'

interface CompareDetailProps {
  report: CompareReport
  onBack: () => void
}

function formatPct(v: number) { return `${v.toFixed(1)}%` }

function DiffCell({ value, diff, isPercentage = true, isDecreaseGood = false }: { value: number; diff: number; isPercentage?: boolean; isDecreaseGood?: boolean }) {
  const display = isPercentage ? formatPct(value) : value.toFixed(2)
  const isUp = diff > 0
  const isDown = diff < 0
  const good = isDecreaseGood ? diff < 0 : diff > 0
  const arrowColor = (isUp || isDown) ? (good ? 'text-emerald-600' : 'text-red-500') : 'text-muted'

  return (
    <td className="px-4 py-2 text-right">
      <div className="font-mono text-xs text-zinc-800">{display}</div>
      <div className={`inline-flex items-center gap-0.5 text-[10px] font-medium leading-tight mt-0.5 ${arrowColor}`}>
        {isUp && <span className="animate-hop-up">↑</span>}
        {isDown && <span className="animate-hop-down">↓</span>}
        {!isUp && !isDown && <span className="opacity-30">-</span>}
        {diff !== 0 && <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}{isPercentage ? '%' : ''}</span>}
      </div>
    </td>
  )
}

export default function CompareDetail({ report, onBack }: CompareDetailProps) {
  const tpl = getTemplateById(report.templateId)
  const metricRows = useMemo(() => tpl ? buildMetricRows(tpl) : [], [tpl])
  const categories = tpl?.categories ?? []
  const metricNames = tpl?.metrics ?? []
  const [selectedMetric, setSelectedMetric] = useState(metricNames[0] ?? '')
  const [showMetricPicker, setShowMetricPicker] = useState(false)

  const precisionRow = metricRows.find(r => r.name === '精确率' || r.name === '综合准召率')
  const fprRow = metricRows.find(r => r.name === '误检率')
  const missRow = metricRows.find(r => r.name === '漏检率')
  const fpsRow = metricRows.find(r => r.name === '帧通过率')

  const summaryCards = [
    { label: '综合准召率', value: report.summaryPrecision, unit: '%', diff: precisionRow?.summaryDiff ?? 0, higherBetter: true },
    { label: '综合误检率', value: report.summaryFPR, unit: '%', diff: fprRow?.summaryDiff ?? 0, higherBetter: false },
    { label: '综合漏检率', value: report.summaryMiss, unit: '%', diff: missRow?.summaryDiff ?? 0, higherBetter: false },
    { label: '帧通过率', value: report.summaryFps, unit: '%', diff: fpsRow?.summaryDiff ?? 0, higherBetter: true },
  ]

  const selectedRow = metricRows.find(r => r.name === selectedMetric) ?? metricRows[0]

  const compareChartData = useMemo(() => {
    return categories.map(cat => {
      const v = selectedRow?.values[cat.id] ?? 0
      const d = selectedRow?.diffs[cat.id] ?? 0
      return {
        name: cat.name,
        current: v,
        baseline: +(v - d).toFixed(1),
        delta: d,
        frames: 0,
      }
    })
  }, [categories, selectedRow])

  const deltaChartData = useMemo(() => {
    return metricRows.map(row => {
      const isDecreaseGood = row.name === '误检率' || row.name === '漏检率' || row.name === 'MPJPE'
      const good = isDecreaseGood ? row.summaryDiff < 0 : row.summaryDiff > 0
      return {
        name: row.name,
        delta: row.summaryDiff,
        current: row.summary,
        baseline: +(row.summary - row.summaryDiff).toFixed(1),
        good,
        isPct: row.name !== 'MPJPE',
      }
    }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  }, [metricRows])

  const transposedRows = useMemo(() => {
    const result: { name: string; frames?: number; colValues: { metric: string; value: number; diff: number; isDecreaseGood: boolean }[] }[] = []
    const frameCounts: Record<string, number> = { '打扫卫生': 1240, '拉窗帘': 980, '握持': 760, '抓取': 540, '放置': 820 }
    for (const cat of categories) {
      const colValues = metricRows.map(row => ({
        metric: row.name,
        value: row.values[cat.id] ?? 0,
        diff: row.diffs[cat.id] ?? 0,
        isDecreaseGood: row.name === '误检率' || row.name === '漏检率' || row.name === 'MPJPE',
      }))
      result.push({ name: cat.name, frames: frameCounts[cat.name] ?? 0, colValues })
    }
    const summaryValues = metricRows.map(row => ({
      metric: row.name,
      value: row.summary,
      diff: row.summaryDiff,
      isDecreaseGood: row.name === '误检率' || row.name === '漏检率' || row.name === 'MPJPE',
    }))
    result.push({ name: '汇总', colValues: summaryValues })
    return result
  }, [categories, metricRows])

  if (report.status !== 'completed') {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2 text-xs">
          <button onClick={onBack} className="text-muted transition-colors hover:text-zinc-600">对比报告</button>
          <span className="text-muted">/</span>
          <span className="text-zinc-500">{report.name}</span>
        </div>
        <div className="flex flex-col items-center py-20 text-muted">
          <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm font-medium text-zinc-600">报告运行中</p>
          <p className="mt-1 text-xs text-muted">请稍候，评估完成后即可查看结果</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs">
        <button onClick={onBack} className="text-muted transition-colors hover:text-zinc-600">对比报告</button>
        <span className="text-muted">/</span>
        <span className="text-zinc-800 font-medium">{report.name}</span>
      </div>

      <div className="mb-5 rounded-lg border border-border bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-800">{report.name}</h1>
            <span className="text-muted">|</span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700">{report.currentVersion}</span>
              <span className="text-xs text-muted">vs</span>
              <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-700">{report.baselineVersion}</span>
            </div>
            <span className="text-xs text-muted">|</span>
            <span className="text-xs text-muted">模板: {report.templateName}</span>
            <span className="text-xs text-muted">|</span>
            <span className="text-xs font-mono text-muted">{report.createdAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportCSV(report)} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50">
              <FileDown size={13} />
              CSV
            </button>
            <button className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50">
              <FileDown size={13} />
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const trend = card.diff
          const isGood = card.higherBetter ? trend > 0 : trend < 0
          const arrowColor = isGood ? 'text-emerald-600' : 'text-red-500'
          const bgColor = isGood ? 'bg-emerald-50' : 'bg-red-50'
          return (
            <div key={card.label} className="rounded-lg border border-border bg-white px-4 py-3">
              <div className="text-xs text-muted">{card.label}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold tracking-tight text-zinc-800 font-mono">
                  {card.value.toFixed(1)}<span className="text-sm font-normal text-muted">{card.unit}</span>
                </span>
              </div>
              <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${bgColor} ${arrowColor}`}>
                {trend > 0 && <span className="animate-hop-up">↑</span>}
                {trend < 0 && <span className="animate-hop-down">↓</span>}
                {trend > 0 ? '+' : ''}{card.diff.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>

      <div className="mb-5 grid grid-cols-5 gap-3">
        <div className="col-span-3 rounded-lg border border-border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-700">数据集版本对比</h3>
            <div className="relative">
              <button
                onClick={() => setShowMetricPicker(!showMetricPicker)}
                className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-muted hover:bg-zinc-50"
              >
                {selectedMetric}
                <ChevronDown size={10} />
              </button>
              {showMetricPicker && (
                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-border bg-white p-1 shadow-sm">
                  {metricNames.map(m => (
                    <button
                      key={m}
                      onClick={() => { setSelectedMetric(m); setShowMetricPicker(false) }}
                      className={`w-full rounded px-2 py-1 text-left text-[11px] transition-colors ${m === selectedMetric ? 'bg-accent-light text-accent' : 'text-zinc-600 hover:bg-zinc-50'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-600" />
              {report.currentVersion}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-200" />
              {report.baselineVersion}
            </span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[80, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: 'none' }}
                />
                <Bar dataKey="baseline" fill="#93c5fd" radius={[2, 2, 0, 0]} maxBarSize={24} />
                <Bar dataKey="current" fill="#2563eb" radius={[2, 2, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 rounded-lg border border-border bg-white p-4">
          <h3 className="text-xs font-semibold text-zinc-700 mb-3">指标变化概览</h3>
          <div className="flex items-center gap-3 mb-3 text-[10px] text-muted">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />提升</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-400" />退步</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deltaChartData}
                layout="vertical"
                barCategoryGap="20%"
                margin={{ top: 4, right: 50, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11, boxShadow: 'none' }}
                />
                <Bar dataKey="delta" maxBarSize={14} radius={[0, 2, 2, 0]}>
                  {deltaChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.good ? '#34d399' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white">
        <div className="border-b border-border px-4 py-2.5">
          <h3 className="text-xs font-semibold text-zinc-700">
            评测指标交叉表
            <span className="ml-2 font-normal text-muted">行: 数据集分类 - 列: 指标</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-zinc-50">
                <th className="sticky left-0 z-10 bg-zinc-50 px-4 py-2.5 text-left font-medium text-muted min-w-[100px]">
                  数据集
                </th>
                {metricNames.map((m) => (
                  <th key={m} className="px-4 py-2.5 text-right font-medium text-muted">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transposedRows.map((row, idx) => (
                <tr key={row.name} className={`border-b border-border last:border-0 ${row.name === '汇总' ? 'bg-blue-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
                  <td className={`sticky left-0 z-10 px-4 py-2.5 text-xs border-r border-border ${row.name === '汇总' ? 'bg-blue-50/60 text-accent font-semibold' : 'bg-white text-zinc-700 font-medium'}`}>
                    <div>{row.name}</div>
                    {row.frames !== undefined && row.name !== '汇总' && (
                      <div className="text-[9px] text-muted font-normal mt-0.5">{row.frames} 帧</div>
                    )}
                  </td>
                  {row.colValues.map((cv) => {
                    const isPct = cv.metric !== 'MPJPE'
                    return <DiffCell key={cv.metric} value={cv.value} diff={cv.diff} isPercentage={isPct} isDecreaseGood={cv.isDecreaseGood} />
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
