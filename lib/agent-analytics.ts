/**
 * FlowDesk — Agent Analytics API client
 * Connects to /api/agents/analytics and /api/agents/social/twitter
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function req<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? `API error ${res.status}`)
  }
  return res.json()
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface AgentDayPoint {
  date: string
  label: string      // MM-DD
  runs: number
  tasks: number
  metric: number     // primary KPI value (e.g. daily reach, tickets resolved)
}

export interface AgentAnalyticsSeries {
  name: string
  icon: string
  color: string
  metric_label: string   // e.g. "Daily Reach", "Tickets Resolved"
  total_runs: number
  series: AgentDayPoint[]
}

export interface AgentAnalyticsResponse {
  agents: Record<string, AgentAnalyticsSeries>
  daily_total: { date: string; label: string; runs: number }[]
}

export interface TwitterDayPoint {
  date: string
  label: string
  likes: number
  retweets: number
  replies: number
  impressions: number
  posts: number
  engagement: number    // likes + retweets + replies + quotes
}

export interface TwitterMetricsResponse {
  connected: boolean
  username?: string
  profile_metrics?: {
    followers_count?: number
    following_count?: number
    tweet_count?: number
    listed_count?: number
  }
  data: TwitterDayPoint[]
  error?: string
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * Returns 14-day run counts + primary KPI per agent, plus total daily runs.
 * Used by the agents analytics tab and the overview dashboard dropdown.
 */
export async function getAgentAnalytics(): Promise<AgentAnalyticsResponse> {
  return req<AgentAnalyticsResponse>('/api/agents/analytics')
}

/**
 * Fetches real Twitter/X engagement data when the twitter_x integration is
 * connected. Returns per-day likes, retweets, replies, and impressions for
 * the last 20 tweets.
 */
export async function getTwitterMetrics(): Promise<TwitterMetricsResponse> {
  return req<TwitterMetricsResponse>('/api/agents/social/twitter')
}
