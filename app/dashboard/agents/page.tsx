'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Bot, Play, Pause, Zap, CheckCircle, X, AlertTriangle, ArrowRight,
  Loader2, Sparkles, ChevronDown, ChevronUp, Plug, Link2, Link2Off,
  Globe, CreditCard, FileSpreadsheet, Palette, Share2, Cpu, Eye, EyeOff,
  BarChart2, TrendingUp, Folder, Mail, Calendar, Users,
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  getAgents, toggleAgent, runAgent,
  type AgentStatus, type AgentRunResult, type AgentRunContext,
} from '@/lib/agents'
import {
  getConnectedIntegrations, connectIntegration, disconnectIntegration,
} from '@/lib/integrations'
import {
  getAgentAnalytics, getTwitterMetrics,
  type AgentAnalyticsSeries, type TwitterMetricsResponse,
} from '@/lib/agent-analytics'
import { RevealCardContainer, IdentityCardBody } from '@/components/ui/animated-profile-card'
import SystemMonitor from '@/components/ui/system-monitor'
import CinematicSwitch from '@/components/ui/cinematic-glow-toggle'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Image from 'next/image'

// ── Brand logo map ────────────────────────────────────────────────────────────
const BRAND_LOGO: Record<string, string> = {
  // Creative AI
  nano_banana_pro: '/logos/gemini_icon-logo_brandlogos.net_aacx5.png',
  canva:           '/logos/Canva-icon.png',
  midjourney:      '/logos/midjourney-logo-png.jpg',
  figma:           '/logos/Figma-logo.svg.png',
  adobe_express:   '/logos/Adobe_Express_2026_icon.svg.png',
  // Social
  twitter:         '/logos/X_(formerly_Twitter)_logo_late_2025.svg.png',
  instagram:       '/logos/Instagram_logo_2016.svg.png',
  linkedin:        '/logos/LinkedIn_icon.svg.png',
  tiktok:          '/logos/tiktok.png',
  facebook:        '/logos/Facebook_Logo_(2019).png',
  pinterest:       '/logos/Pinterest-logo.png',
  // Payments
  stripe:          '/logos/stripe.png',
  paypal:          '/logos/paypal.png',
  square:          '/logos/Square,_Inc_-_Square_Logo.jpg',
  shopify:         '/logos/png-clipart-shopify-logo-e-commerce-business-super-sale-angle-text.png',
  quickbooks:      '/logos/kisspng-quickbooks-accounting-software-intuit-computer-sof-tax-planner-pro-small-business-tax-planning-soft-5bae404d240a84.8074409915381463811476.jpg',
  brex:            '/logos/654389c7995efe8aa0a2c56d_brex-icon.png',
  // Spreadsheets
  google_sheets:   '/logos/googlesheets.png',
  excel_online:    '/logos/Microsoft_Excel-Logo.wine.png',
  airtable:        '/logos/airtable-logo-icon-png-svg.png',
  notion:          '/logos/Notion-Logo-Vector-300x300.png',
  smartsheet:      '/logos/smartsheet.png',
  // MCPs
  mcp_slack:       '/logos/Slack_icon_2019.svg.png',
  mcp_github:      '/logos/github.png',
}

function BrandLogoIcon({ id, size = 30 }: { id: string; size?: number }) {
  const src = BRAND_LOGO[id]
  if (!src) return null
  return (
    <Image
      src={src}
      alt={id}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
      unoptimized
    />
  )
}

// ── Lucide icon fallbacks for integrations without brand logos ────────────────
const LUCIDE_INTEGRATION_ICONS: Record<string, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  mcp_filesystem: ({ size = 16, style }) => <Folder size={size} style={style} />,
  mcp_browser:    ({ size = 16, style }) => <Globe size={size} style={style} />,
  mcp_email:      ({ size = 16, style }) => <Mail size={size} style={style} />,
  mcp_calendar:   ({ size = 16, style }) => <Calendar size={size} style={style} />,
  facebook:       ({ size = 16, style }) => <Users size={size} style={style} />,
}

function IntegrationFallbackIcon({ id, size, color }: { id: string; size: number; color: string }) {
  const LucideIcon = LUCIDE_INTEGRATION_ICONS[id]
  if (!LucideIcon) return null
  return <LucideIcon size={size} style={{ color }} />
}

// ── Logo container background rules ──────────────────────────────────────────
// transparent (no box): logos that already have their own background/shape
const LOGO_BG_NONE = new Set([
  'instagram', 'linkedin', 'facebook', 'pinterest',
  'nano_banana_pro', 'canva', 'figma', 'adobe_express', 'airtable',
])
// solid purple (Stripe brand #635BFF)
const LOGO_BG_PURPLE = new Set(['stripe'])
// solid white
const LOGO_BG_WHITE = new Set([
  'twitter',
  'paypal', 'square', 'shopify', 'quickbooks', 'brex',
  'notion', 'smartsheet', 'google_sheets', 'midjourney',
])

function getLogoBoxStyle(
  id: string,
  color: string,
  connected: boolean,
  hovered: boolean,
): React.CSSProperties {
  if (LOGO_BG_NONE.has(id)) {
    return { background: 'transparent', border: 'none', boxShadow: 'none', padding: 2 }
  }
  if (LOGO_BG_PURPLE.has(id)) {
    return {
      background: '#635BFF',
      border: '1px solid #5249E5',
      boxShadow: connected && hovered ? '0 0 14px #635BFF55' : 'none',
      padding: 6,
    }
  }
  if (LOGO_BG_WHITE.has(id)) {
    return {
      background: '#FFFFFF',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: connected && hovered ? `0 0 14px ${color}30` : 'none',
      padding: 5,
    }
  }
  // Brand logo with color tint (twitter, tiktok, slack, github, excel, etc.)
  if (BRAND_LOGO[id]) {
    return {
      background: connected ? `${color}20` : 'rgba(255,255,255,0.05)',
      border: `1px solid ${connected ? `${color}35` : 'rgba(255,255,255,0.08)'}`,
      boxShadow: connected && hovered ? `0 0 14px ${color}30` : 'none',
      padding: 4,
    }
  }
  // Emoji fallback
  return {
    background: connected ? `${color}20` : 'rgba(255,255,255,0.05)',
    border: `1px solid ${connected ? `${color}35` : 'rgba(255,255,255,0.08)'}`,
    boxShadow: connected && hovered ? `0 0 14px ${color}30` : 'none',
    padding: 0,
  }
}

// ── Integration definitions ──────────────────────────────────────────────────

interface Integration {
  id: string
  name: string
  icon: string
  description: string
  category: 'mcp' | 'social' | 'payments' | 'spreadsheets' | 'creative'
  agents: string[]
  connected: boolean
  featured?: boolean
  badge?: string
  color: string
}

// Credential form spec per integration
type CredForm =
  | { type: 'api_key';         label: string; placeholder: string; help: string }
  | { type: 'webhook';         label: string; placeholder: string; help: string }
  | { type: 'service_account'; help: string }
  | { type: 'multi';           fields: { key: string; label: string; placeholder: string }[]; help: string }
  | { type: 'oauth';           provider: string; help: string }

const CRED_FORMS: Record<string, CredForm> = {
  nano_banana_pro:  { type: 'api_key',         label: 'Gemini API Key',        placeholder: 'AIzaSy...',        help: 'Get a free key at aistudio.google.com → API keys' },
  twitter:          { type: 'multi', fields: [{ key: 'api_key', label: 'Bearer Token', placeholder: 'AAAA...' }, { key: 'username', label: 'Twitter Username', placeholder: 'myhandle (no @)' }], help: 'developer.twitter.com → Your App → Keys and Tokens → Bearer Token. Username is needed to fetch your tweet metrics.' },
  instagram:        { type: 'oauth',           provider: 'Meta',               help: 'Set up a Meta Business app at developers.facebook.com and paste the access token.' },
  linkedin:         { type: 'api_key',         label: 'Access Token',          placeholder: 'AQV...',           help: 'linkedin.com/developers → Your App → Auth → Access Token' },
  tiktok:           { type: 'api_key',         label: 'API Key',               placeholder: 'tiktok_...',       help: 'developers.tiktok.com → App Management → API Key' },
  facebook:         { type: 'oauth',           provider: 'Meta',               help: 'Set up a Meta Business app at developers.facebook.com and paste your page access token.' },
  pinterest:        { type: 'api_key',         label: 'Access Token',          placeholder: 'pina_...',         help: 'developers.pinterest.com → Apps → Access Token' },
  stripe:           { type: 'api_key',         label: 'Secret Key',            placeholder: 'sk_live_...',      help: 'dashboard.stripe.com → Developers → API keys → Secret key' },
  paypal:           { type: 'multi',           fields: [{ key: 'client_id', label: 'Client ID', placeholder: 'AX...' }, { key: 'client_secret', label: 'Client Secret', placeholder: 'EL...' }], help: 'developer.paypal.com → My Apps & Credentials → Create App' },
  square:           { type: 'api_key',         label: 'Access Token',          placeholder: 'EAAAl...',         help: 'developer.squareup.com → Applications → Access Token' },
  shopify:          { type: 'multi',           fields: [{ key: 'shop_url', label: 'Shop URL', placeholder: 'mystore.myshopify.com' }, { key: 'api_key', label: 'Admin API Token', placeholder: 'shpat_...' }], help: 'Shopify Admin → Apps → Develop Apps → Create API token' },
  quickbooks:       { type: 'oauth',           provider: 'Intuit',             help: 'developer.intuit.com → Create App → Connect to QuickBooks → OAuth 2.0' },
  brex:             { type: 'api_key',         label: 'API Token',             placeholder: 'brex_...',         help: 'dashboard.brex.com → Developer → API Tokens → Create token' },
  google_sheets:    { type: 'service_account', help: 'Google Cloud Console → IAM & Admin → Service Accounts → Create → Add Key (JSON). Enable the Sheets API and Drive API in your project. Paste the full JSON below.' },
  excel_online:     { type: 'oauth',           provider: 'Microsoft',          help: 'Microsoft 365 requires OAuth. Go to portal.azure.com → App registrations → create an app, then paste the access token.' },
  airtable:         { type: 'api_key',         label: 'Personal Access Token', placeholder: 'pat...',           help: 'airtable.com/account → Personal access tokens → Create token' },
  notion:           { type: 'api_key',         label: 'Integration Token',     placeholder: 'secret_...',       help: 'notion.so/my-integrations → New integration → Internal Integration Token' },
  smartsheet:       { type: 'api_key',         label: 'API Access Token',      placeholder: 'sm_...',           help: 'app.smartsheet.com → Account → Personal Settings → API Access → Generate token' },
  mcp_filesystem:   { type: 'api_key',         label: 'Root Path',             placeholder: '/Users/you/data',  help: 'The local directory path the File System MCP can read/write.' },
  mcp_browser:      { type: 'api_key',         label: 'API Key',               placeholder: 'bb_...',           help: 'For Browserbase (browserbase.com) or leave any value to use local Chrome.' },
  mcp_slack:        { type: 'webhook',         label: 'Incoming Webhook URL',  placeholder: 'https://hooks.slack.com/services/...', help: 'Slack Admin → Apps → Incoming Webhooks → Add to Slack → Copy URL' },
  mcp_github:       { type: 'api_key',         label: 'Personal Access Token', placeholder: 'ghp_...',          help: 'github.com → Settings → Developer settings → Personal access tokens → Classic' },
  mcp_email:        { type: 'oauth',           provider: 'Google / Microsoft',  help: 'Requires OAuth with Gmail or Outlook. Paste your OAuth access token below.' },
  mcp_calendar:     { type: 'service_account', help: 'Google Cloud Console → Service Accounts → Create Key (JSON). Enable Calendar API. Paste the JSON below.' },
  canva:            { type: 'api_key',         label: 'API Key',               placeholder: 'canva_...',        help: 'canva.com/developers → Apps → Create App → API key (beta)' },
  midjourney:       { type: 'api_key',         label: 'API Key',               placeholder: 'mj_...',           help: 'Use the unofficial Midjourney API via useapi.net or your own proxy.' },
  figma:            { type: 'api_key',         label: 'Personal Access Token', placeholder: 'figd_...',         help: 'figma.com → Account Settings → Personal Access Tokens → Generate' },
  adobe_express:    { type: 'api_key',         label: 'API Key',               placeholder: 'adobe_...',        help: 'developer.adobe.com → Create Project → Add Adobe Express API → Generate key' },
}

const DEFAULT_CRED_FORM: CredForm = {
  type: 'api_key', label: 'API Key', placeholder: 'Enter your API key...', help: 'Paste the API key or access token from your provider dashboard.',
}

const INTEGRATIONS_META: Omit<Integration, 'connected'>[] = [
  { id: 'mcp_filesystem', name: 'File System MCP',   icon: '📁', description: 'Read, write, and manage local files and documents autonomously.',                                         category: 'mcp',         agents: ['ops','comms','hr'],                    color: '#4F46FF' },
  { id: 'mcp_browser',    name: 'Browser MCP',        icon: '🌐', description: 'Headless web browsing, scraping, and form automation.',                                                    category: 'mcp',         agents: ['seo','marketing','reputation'],         color: '#4F46FF' },
  { id: 'mcp_slack',      name: 'Slack MCP',          icon: '💬', description: 'Send messages, read channels, and triage Slack threads in real time.',                                     category: 'mcp',         agents: ['comms','ops','hr'],                    color: '#4F46FF' },
  { id: 'mcp_github',     name: 'GitHub MCP',         icon: '🐙', description: 'Read repos, open PRs, and manage issues programmatically.',                                                category: 'mcp',         agents: ['ops','compliance'],                    color: '#4F46FF' },
  { id: 'mcp_email',      name: 'Email MCP',          icon: '📧', description: 'Send, receive, and organize email across Gmail and Outlook.',                                              category: 'mcp',         agents: ['comms','sales','cx','hr'],             color: '#4F46FF' },
  { id: 'mcp_calendar',   name: 'Calendar MCP',       icon: '📅', description: 'Schedule, update, and cancel meetings across Google Calendar.',                                            category: 'mcp',         agents: ['hr','sales','cx'],                     color: '#4F46FF' },

  { id: 'twitter',        name: 'X / Twitter',        icon: '𝕏',  description: 'Post tweets, monitor brand mentions, and run thread campaigns.',                                           category: 'social',      agents: ['marketing','reputation','comms'],      color: '#1DA1F2' },
  { id: 'instagram',      name: 'Instagram',          icon: '📸', description: 'Publish posts, stories, and reels; track engagement metrics.',                                             category: 'social',      agents: ['marketing','reputation'],              color: '#E1306C' },
  { id: 'linkedin',       name: 'LinkedIn',           icon: '💼', description: 'B2B content publishing, company page management, and lead gen.',                                           category: 'social',      agents: ['marketing','sales','hr'],              color: '#0A66C2' },
  { id: 'tiktok',         name: 'TikTok',             icon: '🎵', description: 'Short-form video scheduling and trend-based content creation.',                                            category: 'social',      agents: ['marketing'],                          color: '#FF0050' },
  { id: 'facebook',       name: 'Facebook',           icon: '👍', description: 'Manage pages, run ads, and monitor comments at scale.',                                                   category: 'social',      agents: ['marketing','reputation'],              color: '#1877F2' },
  { id: 'pinterest',      name: 'Pinterest',          icon: '📌', description: 'Create pins, boards, and product catalogs automatically.',                                                 category: 'social',      agents: ['marketing','seo'],                     color: '#E60023' },

  { id: 'stripe',         name: 'Stripe',             icon: '💳', description: 'Payment processing, subscriptions, invoices, and refunds.',                                               category: 'payments',    agents: ['finance','sales'],                     color: '#635BFF' },
  { id: 'paypal',         name: 'PayPal',             icon: '🅿️', description: 'Online payments, bulk payouts, and invoice automation.',                                                  category: 'payments',    agents: ['finance'],                            color: '#003087' },
  { id: 'square',         name: 'Square',             icon: '⬛', description: 'POS transactions, inventory sync, and sales reporting.',                                                  category: 'payments',    agents: ['finance','inventory'],                 color: '#00D4AA' },
  { id: 'shopify',        name: 'Shopify',            icon: '🛍️', description: 'E-commerce orders, products, customers, and payouts.',                                                   category: 'payments',    agents: ['finance','inventory','marketing'],      color: '#96BF48' },
  { id: 'quickbooks',     name: 'QuickBooks',         icon: '📒', description: 'Bookkeeping, tax prep, and real-time financial reporting.',                                                category: 'payments',    agents: ['finance','compliance'],                color: '#2CA01C' },
  { id: 'brex',           name: 'Brex',               icon: '💰', description: 'Corporate cards, spend management, and reimbursements.',                                                  category: 'payments',    agents: ['finance','hr'],                        color: '#FF6B35' },

  { id: 'google_sheets',  name: 'Google Sheets',      icon: '📊', description: 'Bi-directional data sync — read live data, write agent reports and ML predictions directly to sheets.',  category: 'spreadsheets', agents: ['bi','finance','ops','hr'],             color: '#0F9D58' },
  { id: 'excel_online',   name: 'Excel Online',       icon: '📈', description: 'Microsoft Excel read/write for financial models and dashboards.',                                         category: 'spreadsheets', agents: ['bi','finance','ops'],                  color: '#217346' },
  { id: 'airtable',       name: 'Airtable',           icon: '🗃️', description: 'Structured databases, forms, and relational data management.',                                           category: 'spreadsheets', agents: ['ops','hr','inventory'],                color: '#F82B60' },
  { id: 'notion',         name: 'Notion',             icon: '📝', description: 'Docs, wikis, databases, and project pages.',                                                              category: 'spreadsheets', agents: ['ops','comms','hr'],                    color: '#000000' },
  { id: 'smartsheet',     name: 'Smartsheet',         icon: '📋', description: 'Project tracking, Gantt charts, and team workflows.',                                                    category: 'spreadsheets', agents: ['ops','hr','bi'],                       color: '#0073E6' },

  { id: 'nano_banana_pro', name: 'Nano Banana Pro',   icon: '🍌', description: 'Google Gemini–powered creative AI for artistic assets, campaign visuals, ad copy, brand storytelling, and social content. Auto-runs for marketing, SEO, reputation, and comms agents.', category: 'creative', agents: ['marketing','seo','reputation','comms'], color: '#FABC05', featured: true, badge: 'Google Gemini' },
  { id: 'canva',          name: 'Canva',              icon: '🎨', description: 'Design templates, brand kits, and auto-generated social graphics.',                                      category: 'creative',    agents: ['marketing','comms'],                   color: '#00C4CC' },
  { id: 'midjourney',     name: 'Midjourney',         icon: '🎭', description: 'Photorealistic and artistic AI image generation at scale.',                                               category: 'creative',    agents: ['marketing'],                          color: '#8B5CF6' },
  { id: 'figma',          name: 'Figma',              icon: '✏️', description: 'Design file access, component export, and brand asset sync.',                                            category: 'creative',    agents: ['marketing','comms'],                   color: '#F24E1E' },
  { id: 'adobe_express',  name: 'Adobe Express',      icon: '🅰️', description: 'Quick social graphics, PDFs, and video creation via Adobe AI.',                                         category: 'creative',    agents: ['marketing','reputation'],              color: '#FF0000' },
]

const INTEGRATION_CATEGORIES: { id: Integration['category']; label: string; icon: React.FC<any>; color: string }[] = [
  { id: 'mcp',          label: 'MCPs',          icon: Cpu,             color: '#4F46FF' },
  { id: 'social',       label: 'Social Media',  icon: Share2,          color: '#1DA1F2' },
  { id: 'payments',     label: 'Payments',      icon: CreditCard,      color: '#00E5A0' },
  { id: 'spreadsheets', label: 'Spreadsheets',  icon: FileSpreadsheet, color: '#0F9D58' },
  { id: 'creative',     label: 'Creative AI',   icon: Palette,         color: '#FABC05' },
]

// ── Static agent metadata ────────────────────────────────────────────────────
const AGENT_META: Record<string, { tagline: string; capabilities: string[]; category: string }> = {
  marketing:   { category: 'Growth',     tagline: 'Automates end-to-end marketing — content, campaigns, and performance.',         capabilities: ['Social media posts & scheduling', 'Email campaign drip sequences', 'A/B test & auto-promote winners', 'Google & Meta ad bid management'] },
  cx:          { category: 'Customer',   tagline: '24/7 AI-powered customer service across all channels without headcount.',        capabilities: ['Chat, email & SMS support', 'Autonomous issue resolution', 'CSAT feedback & sentiment', 'Appointment booking & reminders'] },
  sales:       { category: 'Growth',     tagline: 'Manages the full sales pipeline from lead capture to close.',                    capabilities: ['Lead scoring & qualification', 'Personalized follow-up sequences', 'Automatic CRM record updates', 'Pipeline reports & deal scoring'] },
  finance:     { category: 'Finance',    tagline: 'Automates financial operations, bookkeeping, and cash flow forecasting.',        capabilities: ['Transaction categorization', 'Real-time P&L statements', '30/60/90-day cash flow forecast', 'Invoice reminders & AR tracking'] },
  hr:          { category: 'Operations', tagline: 'Streamlines hiring, onboarding, scheduling, and employee management.',          capabilities: ['Applicant screening & ranking', 'Employee onboarding checklists', 'Shift scheduling & conflict detection', 'PTO & time-off automation'] },
  ops:         { category: 'Operations', tagline: 'Automates internal processes and cross-team workflow coordination.',             capabilities: ['Task assignment & deadline tracking', 'Bottleneck identification', 'Document generation from templates', 'Multi-agent pipeline orchestration'] },
  bi:          { category: 'Analytics',  tagline: 'Centralizes data across all systems and delivers real-time forecasts.',         capabilities: ['Natural language queries', 'Weekly auto-generated reports', 'Predictive revenue & churn forecasting', 'Industry benchmark comparisons'] },
  inventory:   { category: 'Operations', tagline: 'Keeps stock levels optimal and supply chains running smoothly.',                capabilities: ['Real-time inventory tracking', 'Auto purchase order generation', 'Demand spike forecasting', 'Slow-moving inventory alerts'] },
  reputation:  { category: 'Customer',   tagline: 'Protects and grows your online reputation across all review platforms.',        capabilities: ['Google, Yelp & G2 monitoring', 'Auto-draft review responses', 'NPS tracking over time', 'Instant 1–2 star review alerts'] },
  seo:         { category: 'Growth',     tagline: 'Drives organic traffic through automated keyword research and content.',        capabilities: ['Weekly keyword research', 'SEO health audits', 'AI-generated blog post drafts', 'Competitor content gap analysis'] },
  compliance:  { category: 'Compliance', tagline: 'Keeps the business compliant with regulations and data privacy laws.',         capabilities: ['Contract renewal monitoring', 'GDPR & CCPA compliance checks', 'Regulatory news alerts', 'Full AI action audit trail'] },
  comms:       { category: 'Operations', tagline: 'Manages inbound and outbound business communications intelligently.',          capabilities: ['Inbox triage & prioritization', 'Context-aware email drafts', 'Newsletter creation & delivery', 'Email thread summarization'] },
}
const AGENT_CATEGORIES = ['All', 'Growth', 'Customer', 'Finance', 'Operations', 'Analytics', 'Compliance']

// ── ConnectModal ─────────────────────────────────────────────────────────────
function ConnectModal({
  integration,
  onClose,
  onConnected,
}: {
  integration: Integration
  onClose: () => void
  onConnected: () => void
}) {
  const form = CRED_FORMS[integration.id] ?? DEFAULT_CRED_FORM
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [multiFields, setMultiFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(firstInputRef.current as any)?.focus?.()
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      let payload: { api_key?: string; extra?: Record<string, unknown> } = {}

      if (form.type === 'api_key') {
        if (!apiKey.trim()) throw new Error('API key is required.')
        payload.api_key = apiKey.trim()
      } else if (form.type === 'webhook') {
        if (!apiKey.trim()) throw new Error('Webhook URL is required.')
        payload.api_key = apiKey.trim()
      } else if (form.type === 'service_account') {
        if (!jsonText.trim()) throw new Error('Service account JSON is required.')
        try {
          const parsed = JSON.parse(jsonText)
          if (!parsed.type || !parsed.private_key) throw new Error('Incomplete service account JSON.')
          payload.extra = parsed
        } catch (e: unknown) {
          throw new Error(e instanceof Error ? e.message : 'Invalid JSON — paste the full service account key file.')
        }
      } else if (form.type === 'multi') {
        const missing = form.fields.filter(f => !multiFields[f.key]?.trim())
        if (missing.length) throw new Error(`Required: ${missing.map(f => f.label).join(', ')}`)
        // If one of the multi-fields is named 'api_key', promote it to the top-level
        const { api_key: promotedKey, ...rest } = multiFields
        if (promotedKey) {
          payload.api_key = promotedKey.trim()
          payload.extra = rest
        } else {
          payload.extra = multiFields
        }
      } else if (form.type === 'oauth') {
        if (!apiKey.trim()) throw new Error('Access token is required.')
        payload.api_key = apiKey.trim()
      }

      await connectIntegration(integration.id, payload)
      onConnected()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Connection failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--color-bg-base)', border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'var(--font-mono)',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 6, display: 'block',
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(9,7,26,0.72)', zIndex: 200, backdropFilter: 'blur(10px)' }}
      />

      {/* Centering shell */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 520, maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
            borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            pointerEvents: 'auto',
          }}
        >
        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxSizing: 'border-box', ...getLogoBoxStyle(integration.id, integration.color, false, false) }}>
            {BRAND_LOGO[integration.id]
              ? <BrandLogoIcon id={integration.id} size={integration.id === 'canva' ? 44 : 32} />
              : <IntegrationFallbackIcon id={integration.id} size={24} color={integration.color} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>Connect {integration.name}</span>
              {integration.badge && (
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: integration.color, background: `${integration.color}18`, border: `1px solid ${integration.color}30`, borderRadius: 4, padding: '2px 6px' }}>
                  {integration.badge}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.5 }}>{integration.description}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Help text */}
          <div style={{ padding: '10px 14px', background: `${integration.color}0C`, border: `1px solid ${integration.color}25`, borderRadius: 9, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {form.type === 'oauth' ? form.help : ('help' in form ? form.help : '')}
          </div>

          {/* API key / webhook form */}
          {(form.type === 'api_key' || form.type === 'webhook' || form.type === 'oauth') && (
            <div>
              <label style={labelStyle}>
                {form.type === 'webhook' ? form.label : form.type === 'oauth' ? 'Access Token' : form.label}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={firstInputRef as React.RefObject<HTMLInputElement>}
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={'placeholder' in form ? form.placeholder : 'Paste token here...'}
                  style={{ ...inputStyle, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2 }}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Service account JSON */}
          {form.type === 'service_account' && (
            <div>
              <label style={labelStyle}>Service Account JSON</label>
              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "...",\n  ...\n}'}
                rows={9}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 11 }}
              />
            </div>
          )}

          {/* Multi-field form */}
          {form.type === 'multi' && form.fields.map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={multiFields[f.key] ?? ''}
                  onChange={e => setMultiFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ ...inputStyle, paddingRight: 38 }}
                />
                <button type="button" onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2 }}>
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 13px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, fontSize: 12, color: '#FF6B6B', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', borderRadius: 9, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: integration.color, color: '#000', fontSize: 13, fontWeight: 800,
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
            }}
          >
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={14} />}
            {loading ? 'Connecting…' : `Connect ${integration.name}`}
          </button>
        </div>
        </motion.div>
      </div>
    </>
  )
}

// ── Run Result Panel ─────────────────────────────────────────────────────────
function RunPanel({ result, onClose }: { result: AgentRunResult; onClose: () => void }) {
  const [expandedTask, setExpandedTask] = useState<number | null>(0)
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, background: 'var(--color-bg-elevated)', borderLeft: '1px solid var(--color-border)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)', boxShadow: '-16px 0 48px rgba(0,0,0,0.4)' }}>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${result.color}18`, border: `1px solid ${result.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={20} style={{ color: result.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{result.agent_name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Run completed · {new Date(result.ran_at).toLocaleTimeString()}</div>
            {(result as any).gemini_powered && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(250,188,5,0.15)', border: '1px solid rgba(250,188,5,0.3)', color: '#FABC05' }}>Nano Banana Pro</span>
            )}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6 }}><X size={18} /></button>
      </div>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--color-border)', background: `${result.color}08` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <Sparkles size={13} style={{ color: result.color }} />
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: result.color }}>Run Summary</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {result.tasks.map((task, i) => (
          <div key={i} style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
            <button onClick={() => setExpandedTask(expandedTask === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#00E5A020', border: '1px solid #00E5A040', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={11} style={{ color: '#00E5A0' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 1 }}>{task.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>
              </div>
              {expandedTask === i ? <ChevronUp size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
            </button>
            {expandedTask === i && (
              <div style={{ padding: '0 13px 13px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 10, marginBottom: 6 }}>Output</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: 'var(--color-bg-elevated)', borderRadius: 7, padding: '10px 12px', border: '1px solid var(--color-border)' }}>{task.output}</div>
              </div>
            )}
          </div>
        ))}
        {result.insights && result.insights.length > 0 && (
          <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '13px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 9 }}>Key Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {result.insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: result.color, marginTop: 5, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{ins}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {result.action_required && result.action_description && (
          <div style={{ background: 'rgba(255,200,92,0.08)', border: '1px solid rgba(255,200,92,0.3)', borderRadius: 10, padding: '13px', display: 'flex', gap: 10 }}>
            <AlertTriangle size={14} style={{ color: '#FFC85C', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FFC85C', marginBottom: 4 }}>Action Required</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>{result.action_description}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Integration Card ─────────────────────────────────────────────────────────
function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  agentMap,
}: {
  integration: Integration
  onConnect: () => void
  onDisconnect: () => void
  agentMap: Record<string, AgentStatus>
}) {
  const [hovered, setHovered] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const agentNames = integration.agents.map(id => agentMap[id]?.name ?? id).slice(0, 3)
  const extra = Math.max(0, integration.agents.length - 3)

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try { await onDisconnect() } finally { setDisconnecting(false) }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(22,24,32,0.97)',
        border: `1px solid ${integration.connected && hovered ? `${integration.color}50` : integration.connected ? `${integration.color}28` : hovered ? 'rgba(255,255,255,0.12)' : 'var(--color-border)'}`,
        borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
        height: '100%', boxSizing: 'border-box',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: integration.featured && integration.connected ? `0 0 0 1px ${integration.color}20, 0 4px 20px ${integration.color}14` : hovered && integration.connected ? `0 8px 28px ${integration.color}18` : 'none',
        transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {integration.featured && integration.connected && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${integration.color}, transparent)` }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'box-shadow 0.2s', overflow: 'hidden', boxSizing: 'border-box', ...getLogoBoxStyle(integration.id, integration.color, integration.connected, hovered) }}>
          {BRAND_LOGO[integration.id]
            ? <BrandLogoIcon id={integration.id} size={integration.id === 'canva' ? 38 : 30} />
            : <IntegrationFallbackIcon id={integration.id} size={20} color={integration.color} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{integration.name}</span>
            {integration.badge && <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: integration.color, background: `${integration.color}18`, border: `1px solid ${integration.color}30`, borderRadius: 4, padding: '2px 6px' }}>{integration.badge}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: integration.connected ? '#00E5A0' : 'rgba(255,255,255,0.2)', boxShadow: integration.connected ? '0 0 5px #00E5A080' : 'none', animation: integration.connected ? 'dot-pulse 2s ease-in-out infinite' : 'none' }} />
            <span style={{ fontSize: 11, color: integration.connected ? '#00E5A0' : 'var(--color-text-muted)', fontWeight: 600 }}>{integration.connected ? 'Connected' : 'Not connected'}</span>
          </div>
        </div>
        {integration.connected ? (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)', color: '#FF6B6B', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.16)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
          >
            {disconnecting ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2Off size={11} />}
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: '1px solid rgba(79,70,255,0.4)', background: 'rgba(79,70,255,0.14)', color: '#7C74FF', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.26)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(79,70,255,0.14)')}
          >
            <Link2 size={11} /> Connect
          </button>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0, flex: 1, overflow: 'hidden' }}>{integration.description}</p>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 6 }}>Powers agents</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {agentNames.map(n => (
            <span key={n} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: integration.connected ? `${integration.color}14` : 'rgba(255,255,255,0.05)', border: `1px solid ${integration.connected ? `${integration.color}28` : 'rgba(255,255,255,0.08)'}`, color: integration.connected ? integration.color : 'var(--color-text-muted)' }}>{n}</span>
          ))}
          {extra > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-muted)' }}>+{extra} more</span>}
        </div>
      </div>
    </div>
  )
}

// ── Agent Card ────────────────────────────────────────────────────────────────
const AGENT_PURPLE = '#4F46FF'

function AgentCard({ agent, meta, onToggle, onRun, running, delay, activeIntegrations }: {
  agent: AgentStatus; meta: typeof AGENT_META[string]; onToggle: () => void; onRun: () => void
  running: boolean; delay: number; activeIntegrations: Integration[]
}) {
  const isLive = agent.enabled && agent.last_run !== 'never'
  const statusColor = !agent.enabled ? '#5C5E78' : isLive ? '#00E5A0' : '#FFC85C'
  const myIntegrations = activeIntegrations.filter(i => i.connected && i.agents.includes(agent.id)).slice(0, 4)

  return (
    <div style={{
      borderRadius: 14,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      background: 'rgba(22,24,32,0.97)',
      border: '1px solid var(--color-border)',
      opacity: agent.enabled ? 1 : 0.52,
      animation: `dash-enter 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(79,70,255,0.15)', border: '1px solid rgba(79,70,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={18} style={{ color: AGENT_PURPLE }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>{agent.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, boxShadow: isLive ? `0 0 5px ${statusColor}` : 'none', animation: isLive ? 'dot-pulse 2s ease-in-out infinite' : 'none', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: statusColor, fontWeight: 600 }}>{!agent.enabled ? 'Disabled' : isLive ? 'Active' : 'Idle'}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <CinematicSwitch checked={agent.enabled} onChange={() => onToggle()} />
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 }}>{meta.tagline}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {meta.capabilities.map((cap, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: AGENT_PURPLE, flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{cap}</span>
          </div>
        ))}
      </div>
      {myIntegrations.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
          <Plug size={10} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 2 }}>Via</span>
          {myIntegrations.map(intg => (
            <span key={intg.id} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${intg.color}18`, border: `1px solid ${intg.color}30`, color: intg.color, display: 'flex', alignItems: 'center', gap: 4 }}>
              {BRAND_LOGO[intg.id]
                ? <span style={{ display: 'flex', alignItems: 'center', width: 13, height: 13 }}><BrandLogoIcon id={intg.id} size={13} /></span>
                : <IntegrationFallbackIcon id={intg.id} size={11} color={intg.color} />}
              {intg.name}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div><div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>Tasks Today</div><div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{agent.enabled ? agent.tasks_today : '—'}</div></div>
          <div><div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>Last Run</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{agent.enabled ? agent.last_run : 'Disabled'}</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: AGENT_PURPLE, background: 'rgba(79,70,255,0.12)', border: '1px solid rgba(79,70,255,0.28)', borderRadius: 5, padding: '3px 8px' }}>{meta.category}</div>
          <button onClick={onRun} disabled={!agent.enabled || running} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, border: `1px solid ${agent.enabled ? 'rgba(79,70,255,0.4)' : 'rgba(255,255,255,0.08)'}`, background: agent.enabled ? 'rgba(79,70,255,0.12)' : 'transparent', color: agent.enabled ? AGENT_PURPLE : 'var(--color-text-muted)', fontSize: 11, fontWeight: 700, cursor: agent.enabled ? 'pointer' : 'not-allowed', opacity: running ? 0.7 : 1, transition: 'background 0.15s, transform 0.15s' }}
            onMouseEnter={e => { if (agent.enabled && !running) { e.currentTarget.style.background = 'rgba(79,70,255,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = agent.enabled ? 'rgba(79,70,255,0.12)' : 'transparent'; e.currentTarget.style.transform = 'none' }}
          >
            {running ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={11} />}
            {running ? 'Running…' : 'Run Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Agent Profile Showcase ────────────────────────────────────────────────────
const AGENT_PROFILE_CONFIG: Record<string, {
  initials: string; accent: string; textOnAccent: string; mutedOnAccent: string
}> = {
  marketing: { initials: 'MK', accent: '#4F46FF', textOnAccent: '#fff',     mutedOnAccent: 'rgba(255,255,255,0.72)' },
  sales:     { initials: 'SL', accent: '#00E5A0', textOnAccent: '#fff',     mutedOnAccent: 'rgba(255,255,255,0.72)' },
  cx:        { initials: 'CX', accent: '#FFC85C', textOnAccent: '#fff',     mutedOnAccent: 'rgba(255,255,255,0.72)' },
  finance:   { initials: 'FN', accent: '#9B8BFF', textOnAccent: '#fff',     mutedOnAccent: 'rgba(255,255,255,0.72)' },
  hr:        { initials: 'HR', accent: '#FF6B6B', textOnAccent: '#fff',     mutedOnAccent: 'rgba(255,255,255,0.72)' },
}

function AgentProfileShowcase({ agentMap }: { agentMap: Record<string, AgentStatus> }) {
  const featured = (['marketing', 'sales', 'cx', 'finance', 'hr'] as const)
    .map(id => ({ id, agent: agentMap[id], meta: AGENT_META[id], cfg: AGENT_PROFILE_CONFIG[id] }))
    .filter(a => a.agent && a.meta && a.cfg)

  if (featured.length === 0) return null

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
        Your AI Team
      </div>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
        {featured.map(({ id, agent, meta, cfg }) => (
          <RevealCardContainer
            key={id}
            accent={cfg.accent}
            textOnAccent={cfg.textOnAccent}
            mutedOnAccent={cfg.mutedOnAccent}
            style={{ width: 280, flexShrink: 0 }}
            base={
              <IdentityCardBody
                fullName={agent.name}
                place={meta.category}
                about={meta.tagline}
                avatarUrl=""
                avatarText={cfg.initials}
                scheme="plain"
                displayAvatar={false}
                socials={[]}
                titleCss={{ fontSize: '1.35rem' }}
              />
            }
            overlay={
              <IdentityCardBody
                fullName={agent.name}
                place={meta.category}
                about={meta.capabilities.slice(0, 3).join(' · ')}
                avatarUrl=""
                avatarText={cfg.initials}
                scheme="accented"
                displayAvatar={true}
                socials={[]}
                cardCss={{ backgroundColor: cfg.accent, minHeight: '100%' }}
                titleCss={{ fontSize: '1.35rem' }}
              />
            }
          />
        ))}
      </div>
    </div>
  )
}

// ── Integrations Hub ─────────────────────────────────────────────────────────
function IntegrationsHub({
  integrations, onConnect, onDisconnect, agentMap,
}: {
  integrations: Integration[]
  onConnect: (integration: Integration) => void
  onDisconnect: (id: string) => void
  agentMap: Record<string, AgentStatus>
}) {
  const [activeCategory, setActiveCategory] = useState<Integration['category']>('creative')
  const filtered = integrations.filter(i => i.category === activeCategory)
  const nanaBanana = integrations.find(i => i.id === 'nano_banana_pro')

  const catDescriptions: Record<string, { color: string; icon: React.FC<any>; text: string }> = {
    creative:     { color: '#FABC05', icon: Palette,        text: 'Nano Banana Pro (Google Gemini) is your creative AI engine. It auto-generates campaign visuals, ad copy, social content, and brand storytelling for Marketing, SEO, Reputation, and Comms agents.' },
    mcp:          { color: '#7C74FF', icon: Cpu,            text: 'MCPs give agents direct tool access — file systems, browsers, Slack, email, GitHub — so they can take real actions in your environment without leaving the platform.' },
    payments:     { color: '#00E5A0', icon: CreditCard,     text: 'Connect payment processors and accounting tools so the Finance and Sales agents can handle invoicing, reconciliation, and cash flow forecasting without you touching a spreadsheet.' },
    spreadsheets: { color: '#0F9D58', icon: FileSpreadsheet, text: 'Agents read from and write to your spreadsheets automatically — pulling live data for BI reports, syncing HR rosters, or pushing ML predictions directly into your sheets.' },
    social:       { color: '#1DA1F2', icon: Share2,         text: 'Marketing and Reputation agents publish content, respond to comments, monitor mentions, and run ad campaigns across your connected channels — fully autonomously.' },
  }

  const desc = catDescriptions[activeCategory]
  const DescIcon = desc.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Hub header */}
      <div style={{ padding: '18px 22px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: 'rgba(79,70,255,0.14)', border: '1px solid rgba(79,70,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plug size={20} style={{ color: '#7C74FF' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>Integration Hub</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Connect your tools so agents act on your behalf — no manual work.&nbsp;
            <span style={{ color: '#00E5A0', fontWeight: 600 }}>{integrations.filter(i => i.connected).length} connected</span> of {integrations.length} available.
          </div>
        </div>
        {nanaBanana?.connected && (
          <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(250,188,5,0.08)', border: '1px solid rgba(250,188,5,0.25)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', width: 22, height: 22 }}><BrandLogoIcon id="nano_banana_pro" size={22} /></span>
            <div><div style={{ fontSize: 11, fontWeight: 700, color: '#FABC05' }}>Nano Banana Pro</div><div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Google Gemini · Active</div></div>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#00E5A018', border: '1px solid #00E5A030', color: '#00E5A0' }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {INTEGRATION_CATEGORIES.map(cat => {
          const count = integrations.filter(i => i.category === cat.id && i.connected).length
          const total = integrations.filter(i => i.category === cat.id).length
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 9, border: '1px solid', borderColor: isActive ? `${cat.color}50` : 'var(--color-border)', background: isActive ? `${cat.color}14` : 'var(--color-bg-elevated)', color: isActive ? cat.color : 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              <Icon size={13} />{cat.label}
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: isActive ? `${cat.color}20` : 'rgba(255,255,255,0.06)', color: isActive ? cat.color : 'var(--color-text-muted)', fontWeight: 700 }}>{count}/{total}</span>
            </button>
          )
        })}
      </div>

      {/* Category description */}
      <div style={{ padding: '13px 17px', background: `${desc.color}06`, border: `1px solid ${desc.color}20`, borderRadius: 11, display: 'flex', gap: 12, alignItems: 'flex-start', animation: 'dash-enter 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
        {activeCategory === 'creative'
          ? <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 22, height: 22 }}><BrandLogoIcon id="nano_banana_pro" size={22} /></span>
          : <DescIcon size={18} style={{ color: desc.color, flexShrink: 0, marginTop: 2 }} />}
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc.text}</div>
      </div>

      {/* Integration grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gridAutoRows: '250px', gap: 13 }}>
        {filtered.map((intg, i) => (
          <div key={intg.id} style={{ animation: `dash-enter 0.38s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s both`, height: '100%' }}>
            <IntegrationCard
              integration={intg}
              onConnect={() => onConnect(intg)}
              onDisconnect={() => onDisconnect(intg.id)}
              agentMap={agentMap}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())
  const [activeResult, setActiveResult] = useState<AgentRunResult | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [trainResult, setTrainResult] = useState<any>(null)
  const [view, setView] = useState<'agents' | 'integrations' | 'analytics'>('agents')
  const [analyticsData, setAnalyticsData] = useState<Record<string, AgentAnalyticsSeries>>({})
  const [dailyTotal, setDailyTotal] = useState<{ date: string; label: string; runs: number }[]>([])
  const [twitterData, setTwitterData] = useState<TwitterMetricsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>(
    INTEGRATIONS_META.map(m => ({ ...m, connected: false }))
  )
  const [connectingIntegration, setConnectingIntegration] = useState<Integration | null>(null)

  // Load train result from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('train_result')
    const goal = localStorage.getItem('goal')
    if (raw) { try { setTrainResult({ ...JSON.parse(raw), goal }) } catch {} }
  }, [])

  // Load integration connection state from backend
  useEffect(() => {
    getConnectedIntegrations()
      .then(connected => {
        const connectedSet = new Set(connected)
        setIntegrations(prev => prev.map(i => ({ ...i, connected: connectedSet.has(i.id) })))
      })
      .catch(() => {}) // silent — backend may be offline
  }, [])

  const loadAgents = useCallback(async () => {
    try {
      const data = await getAgents()
      setAgents(data)
      setError(null)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAgents() }, [loadAgents])

  useEffect(() => {
    if (view !== 'analytics') return
    setAnalyticsLoading(true)
    Promise.all([
      getAgentAnalytics().then(d => { setAnalyticsData(d.agents); setDailyTotal(d.daily_total) }).catch(() => {}),
      getTwitterMetrics().then(d => setTwitterData(d)).catch(() => {}),
    ]).finally(() => setAnalyticsLoading(false))
  }, [view])

  const handleToggle = async (agentId: string, currentEnabled: boolean) => {
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, enabled: !currentEnabled } : a))
    try { await toggleAgent(agentId, !currentEnabled) }
    catch { setAgents(prev => prev.map(a => a.id === agentId ? { ...a, enabled: currentEnabled } : a)) }
  }

  const handleRun = async (agentId: string) => {
    setRunningAgents(prev => new Set(prev).add(agentId))
    try {
      const context: AgentRunContext = {}
      if (trainResult) {
        context.goal = trainResult.goal; context.accuracy = trainResult.accuracy
        context.training_rows = trainResult.training_rows; context.high_risk_count = trainResult.high_risk_count
        context.customers_scored = trainResult.customers_scored
        context.actual_rev = trainResult.forecast_series?.filter((p: any) => p.actual != null)?.reduce((acc: number, p: any) => acc + p.actual, 0)
        context.top_feature = trainResult.shap_global?.[0]?.label
      }
      const result = await runAgent(agentId, context)
      setActiveResult(result)
      await loadAgents()
    } catch (e: any) { alert(`Agent run failed: ${e.message}`) }
    finally { setRunningAgents(prev => { const s = new Set(prev); s.delete(agentId); return s }) }
  }

  const handleIntegrationConnected = useCallback((id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i))
  }, [])

  const handleIntegrationDisconnect = useCallback(async (id: string) => {
    await disconnectIntegration(id)
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false } : i))
  }, [])

  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))
  const filtered = selectedCategory === 'All' ? agents : agents.filter(a => AGENT_META[a.id]?.category === selectedCategory)
  const totalEnabled = agents.filter(a => a.enabled).length
  const totalActive  = agents.filter(a => a.enabled && a.last_run !== 'never').length
  const totalTasks   = agents.filter(a => a.enabled).reduce((s, a) => s + a.tasks_today, 0)
  const connectedCount = integrations.filter(i => i.connected).length

  return (
    <div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 28, animation: 'dash-enter 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: 6 }}>Agent Control Panel</h1>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(255,200,92,0.08)', border: '1px solid rgba(255,200,92,0.3)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'dash-enter 0.4s both' }}>
          <AlertTriangle size={15} style={{ color: '#FFC85C', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#FFC85C', marginBottom: 2 }}>Could not reach backend</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { icon: Bot,         label: 'Total Agents',  value: agents.length || 12, color: '#4F46FF', sub: 'in catalog' },
          { icon: Play,        label: 'Enabled',       value: totalEnabled,        color: '#00E5A0', sub: 'currently on' },
          { icon: Zap,         label: 'Run Today',     value: totalActive,         color: '#FFC85C', sub: 'have activity' },
          { icon: CheckCircle, label: 'Tasks Today',   value: totalTasks,          color: '#9B8BFF', sub: 'completed' },
          { icon: Plug,        label: 'Integrations',  value: connectedCount,      color: '#FABC05', sub: 'connected' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              borderRadius: 12,
              padding: '16px 18px',
              background: 'rgba(22,24,32,0.97)',
              border: '1px solid var(--color-border)',
              animation: `dash-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.06 + i * 0.05}s both`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={14} style={{ color: s.color }} /></div>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 26, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* View switcher + filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 3, gap: 2 }}>
          {([
            { v: 'agents',       icon: Bot,       label: 'Agents'       },
            { v: 'integrations', icon: Plug,      label: 'Integrations' },
            { v: 'analytics',    icon: BarChart2, label: 'Analytics'    },
          ] as const).map(({ v, icon: Icon, label }) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', background: view === v ? 'rgba(79,70,255,0.2)' : 'transparent', color: view === v ? 'var(--color-accent-light)' : 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={13} />
              {label}
              {v === 'integrations' && connectedCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: 'rgba(250,188,5,0.2)', color: '#FABC05' }}>{connectedCount}</span>}
            </button>
          ))}
        </div>
        {view === 'agents' && (
          <>
            {AGENT_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid', borderColor: selectedCategory === cat ? 'rgba(79,70,255,0.5)' : 'var(--color-border)', background: selectedCategory === cat ? 'rgba(79,70,255,0.12)' : 'var(--color-bg-elevated)', color: selectedCategory === cat ? 'var(--color-accent-light)' : 'var(--color-text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>{cat}</button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => { setAgents(p => p.map(a => ({ ...a, enabled: true }))); Promise.allSettled(agents.map(a => toggleAgent(a.id, true))) }} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(0,229,160,0.25)', background: 'rgba(0,229,160,0.08)', color: '#00E5A0', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Play size={11} /> Enable All</button>
            <button onClick={() => { setAgents(p => p.map(a => ({ ...a, enabled: false }))); Promise.allSettled(agents.map(a => toggleAgent(a.id, false))) }} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.25)', background: 'rgba(255,107,107,0.08)', color: '#FF6B6B', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Pause size={11} /> Disable All</button>
          </>
        )}
      </div>

      {/* Agents view */}
      {view === 'agents' && (
        <>
          {/* Profile card showcase */}
          {!loading && <AgentProfileShowcase agentMap={agentMap} />}

          {/* System monitor — inline overview card */}
          <LayoutGroup>
            <motion.div layout style={{ marginBottom: 20 }}>
              <SystemMonitor />
            </motion.div>
          </LayoutGroup>

          {loading && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>{Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px', height: 260, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />)}</div>}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {filtered.map((agent, i) => {
                const meta = AGENT_META[agent.id]
                if (!meta) return null
                return <AgentCard key={agent.id} agent={agent} meta={meta} onToggle={() => handleToggle(agent.id, agent.enabled)} onRun={() => handleRun(agent.id)} running={runningAgents.has(agent.id)} delay={0.18 + i * 0.04} activeIntegrations={integrations} />
              })}
            </div>
          )}
        </>
      )}

      {/* Integrations view */}
      {view === 'integrations' && (
        <IntegrationsHub
          integrations={integrations}
          onConnect={setConnectingIntegration}
          onDisconnect={handleIntegrationDisconnect}
          agentMap={agentMap}
        />
      )}

      {/* ── Analytics view ── */}
      {view === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {analyticsLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 60, color: 'var(--color-text-muted)', fontSize: 14 }}>
              <div style={{ width: 16, height: 16, border: '2px solid var(--color-accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Loading analytics…
            </div>
          )}

          {!analyticsLoading && (
            <>
              {/* ── Overall activity: all agents daily run count ── */}
              <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 3 }}>Agent Activity — Last 14 Days</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total agent runs per day across all agents</div>
                </div>
                {dailyTotal.some(d => d.runs > 0) ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={dailyTotal} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [v, 'Runs']} />
                      <Bar dataKey="runs" fill="#4F46FF" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    No agent runs yet — run an agent from the Agents tab to see activity here.
                  </div>
                )}
              </div>

              {/* ── Twitter / X real engagement chart (when connected) ── */}
              {twitterData?.connected && (
                <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid rgba(29,161,242,0.3)', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', width: 18, height: 18, background: '#fff', borderRadius: 4, padding: 2, flexShrink: 0 }}><BrandLogoIcon id="twitter" size={14} /></span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Twitter / X Engagement</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(29,161,242,0.12)', color: '#1DA1F2', border: '1px solid rgba(29,161,242,0.3)' }}>LIVE</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        Real tweet engagement data for @{twitterData.username}
                        {twitterData.profile_metrics?.followers_count != null && ` · ${twitterData.profile_metrics.followers_count.toLocaleString()} followers`}
                      </div>
                    </div>
                    {twitterData.profile_metrics && (
                      <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                        {[
                          { label: 'Followers', value: twitterData.profile_metrics.followers_count },
                          { label: 'Tweets', value: twitterData.profile_metrics.tweet_count },
                        ].filter(s => s.value != null).map(s => (
                          <div key={s.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#1DA1F2' }}>{s.value?.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {twitterData.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={twitterData.data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="twGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1DA1F2" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1DA1F2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any, name: any) => [v, name === 'engagement' ? 'Total Engagement' : String(name).charAt(0).toUpperCase() + String(name).slice(1)]} />
                        <Area type="monotone" dataKey="engagement" stroke="#1DA1F2" strokeWidth={2} fill="url(#twGrad)" />
                        <Line type="monotone" dataKey="likes" stroke="#FF6B6B" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="retweets" stroke="#00E5A0" strokeWidth={1.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {twitterData.error ?? 'No tweet data found for this account.'}
                    </div>
                  )}
                </div>
              )}

              {/* ── Per-agent KPI sparklines ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gridAutoRows: '190px', gap: 16 }}>
                {Object.entries(analyticsData)
                  .filter(([, d]) => d.total_runs > 0 || d.series.some(s => s.metric > 0))
                  .sort((a, b) => b[1].total_runs - a[1].total_runs)
                  .map(([agentId, data]) => {
                    const hasData = data.series.some(s => s.metric > 0)
                    const maxMetric = Math.max(...data.series.map(s => s.metric), 1)
                    return (
                      <div key={agentId} style={{ background: 'rgba(22,24,32,0.97)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 20px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: `${data.color}18`, border: `1px solid ${data.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Bot size={16} style={{ color: data.color }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{data.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{data.metric_label} · {data.total_runs} total runs</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: data.color }}>
                              {data.series.reduce((s, d) => s + d.metric, 0).toFixed(0)}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>14d total</div>
                          </div>
                        </div>
                        {hasData ? (
                          <div style={{ flex: 1, minHeight: 0 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                              <defs>
                                <linearGradient id={`ag-${agentId}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={data.color} stopOpacity={0.25} />
                                  <stop offset="95%" stopColor={data.color} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' as string }} axisLine={false} tickLine={false} interval={3} />
                              <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 11 }} formatter={(v: any) => [v, data.metric_label]} />
                              <Area type="monotone" dataKey="metric" stroke={data.color} strokeWidth={1.8} fill={`url(#ag-${agentId})`} dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                          </div>
                        ) : (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                            Run this agent to see {data.metric_label.toLowerCase()} data
                          </div>
                        )}
                      </div>
                    )
                  })}

                {/* Agents that haven't run yet */}
                {Object.entries(analyticsData)
                  .filter(([, d]) => d.total_runs === 0 && !d.series.some(s => s.metric > 0))
                  .slice(0, 4)
                  .map(([agentId, data]) => (
                    <div key={agentId} style={{ background: 'rgba(22,24,32,0.97)', border: '1px dashed var(--color-border)', borderRadius: 14, padding: '18px 20px', opacity: 0.5, height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${data.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bot size={16} style={{ color: data.color }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{data.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>No runs yet · Go to Agents tab to run</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Governance footer */}
      <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'rgba(79,70,255,0.12)', border: '1px solid rgba(79,70,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={16} style={{ color: 'var(--color-accent-light)' }} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>Human-in-the-loop governance active</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>High-stakes actions (payments, contract sends, bulk emails) require your approval. All agent runs are logged to the activity feed.</div>
        </div>
        <Link href="/dashboard/reports" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--color-accent-light)', background: 'rgba(79,70,255,0.1)', border: '1px solid rgba(79,70,255,0.22)', borderRadius: 8, padding: '7px 14px', textDecoration: 'none', transition: 'background 0.15s' }}>
          View reports <ArrowRight size={11} />
        </Link>
      </div>

      {/* Run result panel */}
      {activeResult && (
        <>
          <div onClick={() => setActiveResult(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)' }} />
          <RunPanel result={activeResult} onClose={() => setActiveResult(null)} />
        </>
      )}

      {/* Connect modal */}
      <AnimatePresence>
        {connectingIntegration && (
          <ConnectModal
            integration={connectingIntegration}
            onClose={() => setConnectingIntegration(null)}
            onConnected={() => handleIntegrationConnected(connectingIntegration.id)}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
