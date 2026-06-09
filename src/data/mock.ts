import type { CompareReport, EvaluationTemplate, MetricRow } from '../types';

export const templates: EvaluationTemplate[] = [
  {
    id: 't1',
    name: '全面评估模板',
    categories: [
      { id: 'c1', name: '打扫卫生' },
      { id: 'c2', name: '拉窗帘' },
      { id: 'c3', name: '握持' },
      { id: 'c4', name: '抓取' },
      { id: 'c5', name: '放置' },
    ],
    metrics: ['精确率', '召回率', 'F1 Score', '误检率', '漏检率', '帧通过率'],
  },
  {
    id: 't2',
    name: '手部关键点模板',
    categories: [
      { id: 'c1', name: '全量' },
    ],
    metrics: ['MPJPE', 'PCK@0.1', 'PCK@0.2', 'AUC'],
  },
  {
    id: 't3',
    name: '夹具检测模板',
    categories: [
      { id: 'c1', name: '抓取' },
      { id: 'c2', name: '握持' },
    ],
    metrics: ['精确率', '召回率', 'F1 Score', '误检率', '漏检率'],
  },
];

export function buildMetricRows(template: EvaluationTemplate): MetricRow[] {
  const categoryIds = template.categories.map(c => c.id);
  return template.metrics.map((name, idx) => {
    const values: Record<string, number> = {};
    const diffs: Record<string, number> = {};
    categoryIds.forEach((cid, ci) => {
      const seed = idx * 10 + ci;
      values[cid] = +(85 + (seed * 7 + 3) % 15 + (seed * 13 + 7) % 10 / 10).toFixed(1);
      diffs[cid] = +(-2 + (seed * 3 + 5) % 50 / 10).toFixed(1);
    });
    const sum = +(categoryIds.reduce((a, cid) => a + values[cid], 0) / categoryIds.length).toFixed(1);
    const diffSum = +(categoryIds.reduce((a, cid) => a + diffs[cid], 0) / categoryIds.length).toFixed(1);
    return { id: `m${idx}`, name, values, diffs, summary: sum, summaryDiff: diffSum };
  });
}

export function getTemplateById(id: string): EvaluationTemplate | undefined {
  return templates.find(t => t.id === id);
}

export const reports: CompareReport[] = [
  {
    id: 'r1',
    name: 'v2.1.0 全场景回归验证',
    currentVersion: 'v2.1.0',
    baselineVersion: 'v2.0.0',
    templateId: 't1',
    templateName: '全面评估模板',
    summaryPrecision: 96.3,
    summaryFPR: 3.2,
    summaryMiss: 3.9,
    summaryFps: 98.7,
    status: 'completed',
    createdAt: '2026-06-10 14:30',
  },
  {
    id: 'r2',
    name: 'v2.0.1 手部关键点回归',
    currentVersion: 'v2.0.1',
    baselineVersion: 'v2.0.0',
    templateId: 't2',
    templateName: '手部关键点模板',
    summaryPrecision: 97.8,
    summaryFPR: 2.1,
    summaryMiss: 1.8,
    summaryFps: 99.2,
    status: 'completed',
    createdAt: '2026-06-09 10:15',
  },
  {
    id: 'r3',
    name: 'v2.1.0-beta 夹具检测对比',
    currentVersion: 'v2.1.0-beta',
    baselineVersion: 'v2.0.0',
    templateId: 't3',
    templateName: '夹具检测模板',
    summaryPrecision: 0,
    summaryFPR: 0,
    summaryMiss: 0,
    summaryFps: 0,
    status: 'running',
    createdAt: '2026-06-10 16:00',
  },
  {
    id: 'r4',
    name: 'v2.0.0 全场景基线验证',
    currentVersion: 'v2.0.0',
    baselineVersion: 'v1.9.0',
    templateId: 't1',
    templateName: '全面评估模板',
    summaryPrecision: 94.2,
    summaryFPR: 4.8,
    summaryMiss: 5.2,
    summaryFps: 97.5,
    status: 'completed',
    createdAt: '2026-06-08 16:45',
  },
  {
    id: 'r5',
    name: 'v2.1.0 单场景打扫专项',
    currentVersion: 'v2.1.0',
    baselineVersion: 'v2.0.0',
    templateId: 't1',
    templateName: '全面评估模板',
    summaryPrecision: 98.2,
    summaryFPR: 1.8,
    summaryMiss: 2.1,
    summaryFps: 99.4,
    status: 'completed',
    createdAt: '2026-06-07 09:00',
  },
  {
    id: 'r6',
    name: 'v1.9.1 nightly 回归',
    currentVersion: 'v1.9.1',
    baselineVersion: 'v1.9.0',
    templateId: 't1',
    templateName: '全面评估模板',
    summaryPrecision: 93.5,
    summaryFPR: 5.1,
    summaryMiss: 5.8,
    summaryFps: 96.8,
    status: 'failed',
    createdAt: '2026-06-06 22:00',
  },
  {
    id: 'r7',
    name: 'v2.0.1 场景覆盖验证',
    currentVersion: 'v2.0.1',
    baselineVersion: 'v2.0.0',
    templateId: 't1',
    templateName: '全面评估模板',
    summaryPrecision: 95.6,
    summaryFPR: 3.8,
    summaryMiss: 4.2,
    summaryFps: 98.1,
    status: 'completed',
    createdAt: '2026-06-05 11:20',
  },
  {
    id: 'r8',
    name: 'v2.1.0 夹具抓取专项',
    currentVersion: 'v2.1.0',
    baselineVersion: 'v2.0.1',
    templateId: 't3',
    templateName: '夹具检测模板',
    summaryPrecision: 97.2,
    summaryFPR: 2.5,
    summaryMiss: 2.8,
    summaryFps: 98.9,
    status: 'completed',
    createdAt: '2026-06-04 15:40',
  },
];

export const latestVersions = ['v2.1.0', 'v2.0.1', 'v2.1.0-beta', 'v2.0.0', 'v1.9.1', 'v1.9.0'];
