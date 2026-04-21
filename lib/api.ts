/**
 * ClearAI API client — connects Next.js frontend to FastAPI backend.
 * Set NEXT_PUBLIC_API_URL in .env.local to override (default: http://localhost:8000)
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Accept': 'application/json', ...opts?.headers },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? `API error ${res.status}`)
  }
  return res.json()
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ColumnProfile {
  name: string
  friendly_name: string
  type: 'numeric' | 'date' | 'categorical' | 'text'
  null_pct: number
  unique: number
  sample: string[]
}

export interface DatasetProfile {
  row_count: number
  column_count: number
  quality_score: number
  missing_pct: number
  duplicate_rows: number
  columns: ColumnProfile[]
  suggested_goals: string[]
  date_range: string | null
}

export interface UploadResult {
  dataset_id: string
  filename: string
  profile: DatasetProfile
}

export interface SHAPFeature {
  feature: string
  label: string
  importance: number
  raw: number
}

export interface ForecastPoint {
  date: string
  actual?: number | null
  predicted?: number | null
  upper?: number | null
  lower?: number | null
}

export interface LocalSHAP {
  feature: string
  label: string
  shap_value: number
  feature_value: number
}

export interface ChurnCustomer {
  id: string
  name: string
  risk: number
  revenue: number
  days_inactive: number
  local_shap: LocalSHAP[]
}

export interface TrainResult {
  model_id: string
  goal: string
  algorithm: string
  accuracy: number
  training_rows: number
  feature_count: number
  shap_global: SHAPFeature[]
  report_card: string
  // sales_forecast
  mae?: number
  rmse?: number
  r2?: number
  forecast_series?: ForecastPoint[]
  // churn_risk
  auc?: number
  customers_scored?: number
  high_risk_count?: number
  customers?: ChurnCustomer[]
}

export interface CounterfactualSuggestion {
  feature: string
  label: string
  action: string
  original_value: number
  new_value: number
  original_risk_pct: number
  new_risk_pct: number
  delta_pct: number
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function uploadCSV(file: File): Promise<UploadResult> {
  const fd = new FormData()
  fd.append('file', file)
  return req<UploadResult>('/api/data/upload', { method: 'POST', body: fd })
}

export async function trainModel(
  datasetId: string,
  goal: string,
  columnMapping: Record<string, string> = {}
): Promise<TrainResult> {
  return req<TrainResult>('/api/model/train', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataset_id: datasetId, goal, column_mapping: columnMapping }),
  })
}

export async function getModelPredictions(modelId: string): Promise<{
  goal: string
  forecast_series?: ForecastPoint[]
  customers?: ChurnCustomer[]
  shap_global: SHAPFeature[]
  accuracy?: number
  mae?: number
  rmse?: number
  r2?: number
  auc?: number
}> {
  return req(`/api/model/${modelId}/predictions`)
}

export async function getSHAPLocal(modelId: string, rowIndex: number): Promise<{
  row_index: number
  base_value: number
  prediction: number
  shap_waterfall: LocalSHAP[]
}> {
  return req('/api/xai/shap/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId, row_index: rowIndex }),
  })
}

export async function getLIMELocal(modelId: string, rowIndex: number): Promise<{
  row_index: number
  prediction: number
  lime_weights: { label: string; weight: number }[]
}> {
  return req('/api/xai/lime/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId, row_index: rowIndex }),
  })
}

export async function getCounterfactual(
  modelId: string,
  rowIndex: number
): Promise<{ original_risk: number; suggestions: CounterfactualSuggestion[] }> {
  return req('/api/xai/counterfactual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId, row_index: rowIndex }),
  })
}

export async function healthCheck(): Promise<boolean> {
  try {
    await req('/health')
    return true
  } catch {
    return false
  }
}

// ── New Phase 1 types ──────────────────────────────────────────────────────

export interface DriftFeature {
  feature: string
  label: string
  psi: number
  status: 'none' | 'mild' | 'moderate'
}

export interface ModelHealth {
  model_id: string
  goal: string
  algorithm: string
  accuracy: number
  auc: number | null
  mae: number | null
  r2: number | null
  drift_features: DriftFeature[]
  feature_count: number
  training_rows: number
}

export interface FairnessGroup {
  name: string
  rate: number
  count: number
}

export interface FairnessAttribute {
  attr: string
  score: number
  status: 'good' | 'warn'
  groups: FairnessGroup[]
  note: string
  recommendation: string | null
}

export interface ModelFairness {
  applicable: boolean
  overall_score: number
  attributes: FairnessAttribute[]
  history: Record<string, string | number>[]
  model_id?: string
  goal?: string
  message?: string
}

// ── New Phase 1 endpoints ──────────────────────────────────────────────────

export async function getModelHealth(modelId: string): Promise<ModelHealth> {
  return req(`/api/model/${modelId}/health`)
}

export async function getModelFairness(modelId: string): Promise<ModelFairness> {
  return req(`/api/model/${modelId}/fairness`)
}

export async function getModelSummary(modelId: string): Promise<{
  model_id: string
  goal: string
  accuracy: number | null
  shap_global: SHAPFeature[]
  forecast_series?: ForecastPoint[]
  customers?: ChurnCustomer[]
}> {
  return req(`/api/model/${modelId}`)
}

// ── Phase 2: Claude AI types & endpoints ───────────────────────────────────

export interface ReportInsight {
  title: string
  body: string
  driver: string
  sentiment: 'positive' | 'warning' | 'negative'
}

export interface GeneratedReport {
  headline: string
  summary: string
  insights: ReportInsight[]
  recommendations: string[]
  generated_at: string
  date_range: string
  audience: string
}

export async function getExplainSummary(modelId: string, rowIndex = 0): Promise<{ summary: string; goal: string }> {
  return req('/api/explain/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId, row_index: rowIndex }),
  })
}

export async function nlQuery(query: string, modelId?: string | null): Promise<{ answer: string }> {
  return req('/api/nl-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, model_id: modelId ?? null }),
  })
}

export async function generateReport(
  modelId: string,
  audience: string,
  dateRange: string
): Promise<GeneratedReport> {
  return req('/api/reports/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId, audience, date_range: dateRange }),
  })
}
