export interface DatasetCategory {
  id: string;
  name: string;
}

export interface MetricRow {
  id: string;
  name: string;
  values: Record<string, number>;
  diffs: Record<string, number>;
  summary: number;
  summaryDiff: number;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  categories: DatasetCategory[];
  metrics: string[];
}

export interface CompareReport {
  id: string;
  name: string;
  currentVersion: string;
  baselineVersion: string;
  templateId: string;
  templateName: string;
  summaryPrecision: number;
  summaryFPR: number;
  summaryMiss: number;
  summaryFps: number;
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
}
