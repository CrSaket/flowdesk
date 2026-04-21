/**
 * FlowDesk — Integration API client
 * Connects to FastAPI /api/integrations/* endpoints
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? `API error ${res.status}`)
  }
  return res.json()
}

// ── Status ─────────────────────────────────────────────────────────────────

/** Returns the set of integration IDs that have stored credentials. */
export async function getConnectedIntegrations(): Promise<string[]> {
  const data = await req<{ connected: string[] }>('/api/integrations')
  return data.connected
}

// ── Connect / Disconnect ───────────────────────────────────────────────────

export async function connectIntegration(
  id: string,
  payload: { api_key?: string; extra?: Record<string, unknown> },
): Promise<void> {
  await req(`/api/integrations/${id}/connect`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function disconnectIntegration(id: string): Promise<void> {
  await req(`/api/integrations/${id}/disconnect`, { method: 'POST' })
}

// ── Nano Banana Pro (Gemini) ───────────────────────────────────────────────

export async function generateWithGemini(
  prompt: string,
  agentId?: string,
): Promise<{ content: string; model: string }> {
  return req('/api/integrations/gemini/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, agent_id: agentId }),
  })
}

// ── Excel Export ───────────────────────────────────────────────────────────

/**
 * Downloads model predictions as a formatted .xlsx file.
 * Triggers a browser file download automatically.
 */
export async function exportToExcel(modelId: string): Promise<void> {
  const res = await fetch(`${API}/api/integrations/excel/export?model_id=${modelId}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? 'Excel export failed')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  // Try to get filename from Content-Disposition header
  const cd = res.headers.get('Content-Disposition') ?? ''
  const match = cd.match(/filename="?([^"]+)"?/)
  a.download = match?.[1] ?? 'flowdesk_predictions.xlsx'
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Google Sheets Export ───────────────────────────────────────────────────

export interface SheetsExportResult {
  url: string
  spreadsheet_id: string
  sheet_name: string
  rows_written: number
}

/**
 * Pushes predictions to a Google Spreadsheet.
 * If spreadsheetId is omitted, creates a new sheet and returns its URL.
 */
export async function exportToSheets(
  modelId: string,
  spreadsheetId?: string,
  sheetName = 'FlowDesk Predictions',
): Promise<SheetsExportResult> {
  return req('/api/integrations/sheets/export', {
    method: 'POST',
    body: JSON.stringify({
      model_id: modelId,
      spreadsheet_id: spreadsheetId || null,
      sheet_name: sheetName,
    }),
  })
}

// ── Slack ──────────────────────────────────────────────────────────────────

export async function sendSlackMessage(text: string): Promise<void> {
  await req('/api/integrations/slack/send', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
