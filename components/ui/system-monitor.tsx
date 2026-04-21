"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, HardDrive, Wifi, Zap, Activity, ChevronDown } from "lucide-react"

interface DataPoint {
  value: number
  timestamp: number
  isSpike?: boolean
}

interface ResourceData {
  cpu: DataPoint[]
  gpu: DataPoint[]
  vram: DataPoint[]
  network: DataPoint[]
  memory: DataPoint[]
}

interface Agent {
  id: string
  name: string
  memory: DataPoint[]
  color: string
}

interface SystemMonitorProps {
  isExpanded?: boolean
  onToggle?: (next: boolean) => void
}

const generateDataPoint = (baseValue: number, variance: number, spikeChance = 0.05): DataPoint => {
  const isSpike = Math.random() < spikeChance
  const multiplier = isSpike ? 1.5 + Math.random() * 0.5 : 1
  const value = Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance * multiplier))
  return { value, timestamp: Date.now(), isSpike: isSpike && value > 70 }
}

const Sparkline = ({
  data, color = "#3b82f6", spikeColor = "#ef4444", width = 60, height = 20,
}: {
  data: DataPoint[]
  color?: string
  spikeColor?: string
  width?: number
  height?: number
}) => {
  const pathRef = useRef<SVGPathElement>(null)
  if (data.length < 2) return <svg width={width} height={height} />

  const points = data.map((point, index) => ({
    x: (index / Math.max(data.length - 1, 1)) * width,
    y: height - (point.value / 100) * height,
    isSpike: point.isSpike,
  }))
  const path = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "")
  const hasSpikes = points.some((p) => p.isSpike)
  const gradId = `sg-${color.replace("#", "")}-${width}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={hasSpikes ? spikeColor : color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={hasSpikes ? spikeColor : color} stopOpacity={0.06} />
        </linearGradient>
      </defs>
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#${gradId})`} />
      <motion.path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={hasSpikes ? spikeColor : color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      {points.map((p, i) =>
        p.isSpike ? (
          <motion.circle
            key={i} cx={p.x} cy={p.y} r={2} fill={spikeColor}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 10 }}
          />
        ) : null
      )}
    </svg>
  )
}

// fill=true → taller padding + bigger sparkline used in collapsed fill-height mode
const ResourceCard = ({
  icon: Icon, label, value, data, color, unit = "%", fill = false,
}: {
  icon: React.ElementType
  label: string
  value: number
  data: DataPoint[]
  color: string
  unit?: string
  fill?: boolean
}) => {
  const hasSpikes = data.some((d) => d.isSpike)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: fill ? '10px 6px' : '6px 4px',
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
        background: hasSpikes ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
      }}>
        <Icon size={13} style={{ color: hasSpikes ? '#ef4444' : 'var(--color-text-muted)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: fill ? 6 : 4 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-muted)' }}>{label}</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: hasSpikes ? '#ef4444' : 'var(--color-text-secondary)' }}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        <Sparkline data={data} color={color} height={fill ? 28 : 20} />
      </div>
    </div>
  )
}

const AgentMemoryCard = ({ agent, compact = false }: { agent: Agent; compact?: boolean }) => {
  const currentValue = agent.memory[agent.memory.length - 1]?.value || 0
  const hasSpikes = agent.memory.some((d) => d.isSpike)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: compact ? '3px 4px' : '5px 4px' }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: hasSpikes ? '#ef4444' : agent.color }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.name}
          </span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginLeft: 8, flexShrink: 0, color: hasSpikes ? '#ef4444' : 'var(--color-text-secondary)' }}>
            {currentValue.toFixed(0)}MB
          </span>
        </div>
        {!compact && (
          <div style={{ marginTop: 2 }}>
            <Sparkline data={agent.memory} color={agent.color} width={40} height={10} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function SystemMonitor({ isExpanded: controlledExpanded, onToggle }: SystemMonitorProps = {}) {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    const next = !isExpanded
    if (onToggle) onToggle(next)
    else setInternalExpanded(next)
  }

  const [resourceData, setResourceData] = useState<ResourceData>({ cpu: [], gpu: [], vram: [], network: [], memory: [] })
  const [agents] = useState<Agent[]>([
    { id: "1", name: "Web Agent",           memory: [], color: "#3b82f6" },
    { id: "2", name: "Unit Test Agent",     memory: [], color: "#10b981" },
    { id: "3", name: "PR Agent #1",         memory: [], color: "#f59e0b" },
    { id: "4", name: "Video Editing Agent", memory: [], color: "#8b5cf6" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setResourceData((prev) => {
        const max = 20
        return {
          cpu:     [...prev.cpu,     generateDataPoint(45, 30, 0.08)].slice(-max),
          gpu:     [...prev.gpu,     generateDataPoint(35, 25, 0.06)].slice(-max),
          vram:    [...prev.vram,    generateDataPoint(60, 20, 0.05)].slice(-max),
          network: [...prev.network, generateDataPoint(25, 40, 0.1)].slice(-max),
          memory:  [...prev.memory,  generateDataPoint(70, 15, 0.04)].slice(-max),
        }
      })
      agents.forEach((agent) => {
        const base = agent.id === "1" ? 150 : agent.id === "2" ? 200 : agent.id === "3" ? 80 : 120
        agent.memory = [...agent.memory, generateDataPoint(base, 50, 0.06)].slice(-15)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [agents])

  const cur = {
    cpu:     resourceData.cpu[resourceData.cpu.length - 1]?.value || 0,
    gpu:     resourceData.gpu[resourceData.gpu.length - 1]?.value || 0,
    vram:    resourceData.vram[resourceData.vram.length - 1]?.value || 0,
    network: resourceData.network[resourceData.network.length - 1]?.value || 0,
    memory:  resourceData.memory[resourceData.memory.length - 1]?.value || 0,
  }

  const hasAnySpikes = [
    ...resourceData.cpu, ...resourceData.gpu, ...resourceData.vram,
    ...resourceData.network, ...resourceData.memory, ...agents.flatMap((a) => a.memory),
  ].some((d) => d.isSpike)

  return (
    // flex: 1 lets the parent (left column) stretch this card to fill remaining height
    <div style={{
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>

      {/* ── Collapsed section: title bar + resource grid ── */}
      {/* flex: 1 when collapsed so grid fills height; shrinks to header strip when expanded */}
      <motion.div
        onClick={handleToggle}
        animate={{ flex: isExpanded ? '0 0 auto' : '1' }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <motion.div animate={{ rotate: hasAnySpikes ? 360 : 0 }} transition={{ duration: 0.5 }}>
              <Activity size={14} style={{ color: hasAnySpikes ? '#ef4444' : 'var(--color-text-muted)' }} />
            </motion.div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>System Monitor</span>
            <AnimatePresence>
              {hasAnySpikes && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: '#ef4444', background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, padding: '2px 6px',
                  }}
                >Spike</motion.span>
              )}
            </AnimatePresence>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}>
            <ChevronDown size={13} style={{ color: 'var(--color-text-muted)' }} />
          </motion.div>
        </div>

        {/* Resource grid — flex:1 so it fills the remaining height of the collapsed section */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridAutoRows: '1fr',
          alignItems: 'stretch',
        }}>
          <ResourceCard icon={Cpu}       label="CPU"     value={cur.cpu}     data={resourceData.cpu}     color="#3b82f6" fill={!isExpanded} />
          <ResourceCard icon={Zap}       label="GPU"     value={cur.gpu}     data={resourceData.gpu}     color="#10b981" fill={!isExpanded} />
          <ResourceCard icon={HardDrive} label="VRAM"    value={cur.vram}    data={resourceData.vram}    color="#f59e0b" fill={!isExpanded} />
          <ResourceCard icon={Wifi}      label="Network" value={cur.network} data={resourceData.network} color="#8b5cf6" unit="MB/s" fill={!isExpanded} />
        </div>
      </motion.div>

      {/* ── Expanded section — flex:1 to fill the remaining column height ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ flex: 1, opacity: 1 }}
            exit={{ flex: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div style={{
              flex: 1, minHeight: 0, overflowY: 'auto',
              padding: '12px 16px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {/* System memory row */}
              <ResourceCard
                icon={HardDrive} label="System Memory" value={cur.memory}
                data={resourceData.memory} color="#ef4444" unit="GB"
              />

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                  Per-Agent Memory
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {agents.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ x: -14, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                    >
                      <AgentMemoryCard agent={agent} compact />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
