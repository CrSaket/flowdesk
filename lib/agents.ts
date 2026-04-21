/**
 * SmartBiz AI — Agent API client
 * Connects to FastAPI /api/agents/* endpoints
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? `API error ${res.status}`)
  }
  return res.json()
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface AgentStatus {
  id: string
  name: string
  icon: string
  color: string
  enabled: boolean
  tasks_today: number
  last_run: string
}

export interface AgentTask {
  title: string
  description: string
  output: string
  status: 'done' | 'pending' | 'error'
}

export interface AgentRunResult {
  agent_id: string
  agent_name: string
  icon: string
  color: string
  summary: string
  tasks: AgentTask[]
  insights: string[]
  action_required: boolean
  action_description: string | null
  ran_at: string
}

export interface AgentActivityEntry {
  id: string
  agent_id: string
  agent: string
  icon: string
  color: string
  action: string
  output: string
  status: string
  time: string
}

export interface AgentRunContext {
  goal?: string
  accuracy?: number
  training_rows?: number
  actual_rev?: number
  high_risk_count?: number
  customers_scored?: number
  top_feature?: string
}

// ── API calls ──────────────────────────────────────────────────────────────

/** Fetch all agent statuses and preferences from the backend. */
export async function getAgents(): Promise<AgentStatus[]> {
  return req<AgentStatus[]>('/api/agents')
}

/** Toggle an agent on or off. Persists to SQLite. */
export async function toggleAgent(agentId: string, enabled: boolean): Promise<void> {
  await req(`/api/agents/${agentId}/toggle`, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  })
}

/**
 * Run an agent task via Groq. Returns structured output with tasks + insights.
 * Context is optional model/business data to ground the agent's output.
 */
export async function runAgent(agentId: string, context?: AgentRunContext): Promise<AgentRunResult> {
  return req<AgentRunResult>(`/api/agents/${agentId}/run`, {
    method: 'POST',
    body: JSON.stringify({ context: context ?? null }),
  })
}

/** Fetch the most recent agent activity entries. */
export async function getAgentActivity(limit = 20): Promise<AgentActivityEntry[]> {
  return req<AgentActivityEntry[]>(`/api/agents/activity?limit=${limit}`)
}
