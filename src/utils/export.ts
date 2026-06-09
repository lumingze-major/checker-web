import type { CompareReport } from '../types'
import { getTemplateById, buildMetricRows } from '../data/mock'

const categoryDataInfo: Record<string, { token: string; link: string }> = {
  '打扫卫生': { token: 'tok_cleaning_20260607_a1b2c3', link: 's3://perception-data/scenes/cleaning/20260607/' },
  '拉窗帘': { token: 'tok_curtain_20260608_d4e5f6', link: 's3://perception-data/scenes/curtain/20260608/' },
  '握持': { token: 'tok_hold_20260609_g7h8i9', link: 's3://perception-data/scenes/hold/20260609/' },
  '抓取': { token: 'tok_pick_20260610_j0k1l2', link: 's3://perception-data/scenes/pick/20260610/' },
  '放置': { token: 'tok_place_20260608_m3n4o5', link: 's3://perception-data/scenes/place/20260608/' },
  '全量': { token: 'tok_full_20260610_p6q7r8', link: 's3://perception-data/scenes/full/20260610/' },
}

export function exportCSV(report: CompareReport) {
  const rows: string[][] = []

  const tpl = getTemplateById(report.templateId)
  if (!tpl) return
  const metricRows = buildMetricRows(tpl)
  const isPct = (m: string) => m !== 'MPJPE'

  const header = ['token', '数据链接', '数据集']
  for (const mr of metricRows) {
    header.push(`${mr.name}(当前)`)
    header.push(`${mr.name}(变化)`)
  }
  rows.push(header)

  for (const cat of tpl.categories) {
    const info = categoryDataInfo[cat.name] ?? { token: '', link: '' }
    const row: string[] = [info.token, info.link, cat.name]
    for (const mr of metricRows) {
      const v = mr.values[cat.id]
      const d = mr.diffs[cat.id]
      row.push(isPct(mr.name) ? `${v.toFixed(1)}%` : v.toFixed(2))
      row.push(`${d > 0 ? '+' : ''}${d.toFixed(1)}${isPct(mr.name) ? '%' : ''}`)
    }
    rows.push(row)
  }

  const sumRow: string[] = ['', '', '汇总']
  for (const mr of metricRows) {
    sumRow.push(isPct(mr.name) ? `${mr.summary.toFixed(1)}%` : mr.summary.toFixed(2))
    sumRow.push(`${mr.summaryDiff > 0 ? '+' : ''}${mr.summaryDiff.toFixed(1)}${isPct(mr.name) ? '%' : ''}`)
  }
  rows.push(sumRow)

  const csv = rows.map(r => r.join(',')).join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${report.currentVersion}_vs_${report.baselineVersion}_${report.name.replace(/[/\\?%*:|"<>]/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
