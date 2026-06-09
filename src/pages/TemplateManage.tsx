import { useState } from 'react'
import { Plus, X, Save, Trash2 } from 'lucide-react'
import { templates as initialTemplates } from '../data/mock'
import type { EvaluationTemplate } from '../types'
import { showToast } from '../components/Toast'

export default function TemplateManage() {
  const [list, setList] = useState<EvaluationTemplate[]>(initialTemplates)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedVersions, setSavedVersions] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    initialTemplates.forEach(t => { map[t.id] = JSON.stringify(t) })
    return map
  })

  const current = list.find(t => t.id === editingId) ?? list[0]
  const isDirty = editingId ? savedVersions[editingId] !== JSON.stringify(current) : false

  const handleUpdate = (updated: EvaluationTemplate) => {
    setList(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const handleSave = () => {
    if (!editingId) return
    setSavedVersions(prev => ({ ...prev, [editingId]: JSON.stringify(current) }))
    showToast('success', `模板「${current.name}」已保存`)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-800 tracking-tight">评测模板</h1>
          <p className="mt-0.5 text-xs text-muted">配置数据集分类和评估指标，用于创建对比报告</p>
        </div>
        <button
          onClick={() => {
            const newTpl: EvaluationTemplate = {
              id: `t${Date.now()}`,
              name: '新模板',
              categories: [{ id: `c${Date.now()}`, name: '新分类' }],
              metrics: ['新指标'],
            }
            setList(prev => [...prev, newTpl])
            setEditingId(newTpl.id)
            setSavedVersions(prev => ({ ...prev, [newTpl.id]: JSON.stringify(newTpl) }))
          }}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={14} />
          新建模板
        </button>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-5">
        <div className="rounded-lg border border-border bg-white">
          <div className="border-b border-border px-4 py-2.5">
            <span className="text-xs font-semibold text-zinc-700">模板列表</span>
          </div>
          <div className="divide-y divide-border">
            {list.map(t => {
              const dirty = savedVersions[t.id] !== JSON.stringify(t)
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isDirty) {
                      handleSave()
                    }
                    setEditingId(t.id)
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    editingId === t.id ? 'bg-accent-light' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${editingId === t.id ? 'text-accent' : 'text-zinc-700'}`}>
                    {t.name}
                    {dirty && <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted">
                    {t.categories.length} 个分类 - {t.metrics.length} 项指标
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              {editingId ? '编辑模板' : '选择模板'}
              {isDirty && <span className="inline-block h-2 w-2 rounded-full bg-blue-500" title="有未保存的更改" />}
            </h3>
            {editingId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setList(prev => prev.filter(t => t.id !== editingId))
                    setEditingId(null)
                  }}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={12} />
                  删除
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isDirty
                      ? 'bg-accent text-white hover:bg-blue-700'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <Save size={12} />
                  {isDirty ? '保存' : '已保存'}
                </button>
              </div>
            )}
          </div>

          {!editingId && (
            <p className="py-12 text-center text-xs text-muted">从左侧选择模板进行编辑，或新建模板</p>
          )}

          {editingId && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700">模板名称</label>
                <input
                  type="text"
                  value={current.name}
                  onChange={e => handleUpdate({ ...current, name: e.target.value })}
                  className="w-full rounded-md border border-border bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none focus:border-accent"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700">数据集分类</label>
                  <button
                    onClick={() => {
                      const newCat = { id: `c${Date.now()}`, name: '新分类' }
                      handleUpdate({ ...current, categories: [...current.categories, newCat] })
                    }}
                    className="flex items-center gap-0.5 text-xs text-accent transition-colors hover:text-blue-800"
                  >
                    <Plus size={12} />
                    添加分类
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.categories.map(cat => (
                    <span key={cat.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-zinc-700">
                      {cat.name}
                      <button
                        onClick={() => {
                          handleUpdate({
                            ...current,
                            categories: current.categories.filter(c => c.id !== cat.id),
                          })
                        }}
                        className="rounded p-0.5 text-muted transition-colors hover:bg-zinc-100"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700">评估指标</label>
                  <button
                    onClick={() => {
                      handleUpdate({ ...current, metrics: [...current.metrics, '新指标'] })
                    }}
                    className="flex items-center gap-0.5 text-xs text-accent transition-colors hover:text-blue-800"
                  >
                    <Plus size={12} />
                    添加指标
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.metrics.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs text-zinc-700">
                      {m}
                      <button
                        onClick={() => {
                          handleUpdate({
                            ...current,
                            metrics: current.metrics.filter((_, j) => j !== i),
                          })
                        }}
                        className="rounded p-0.5 text-muted transition-colors hover:bg-zinc-100"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
