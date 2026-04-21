'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  born: number
  lifetime: number // ms
}

const MAX_DOTS = 30
const DOT_LIFETIME = 600
const DOT_RADIUS = 2.5
const SPAWN_INTERVAL = 16 // ~1 per rAF

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const lastSpawnRef = useRef(0)
  const mouseRef = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number>()
  const isMoving = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      isMoving.current = true
    }
    window.addEventListener('mousemove', onMove)

    const draw = (now: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Spawn dot on move
      if (isMoving.current && now - lastSpawnRef.current > SPAWN_INTERVAL) {
        lastSpawnRef.current = now
        isMoving.current = false
        dotsRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          born: now,
          lifetime: DOT_LIFETIME,
        })
        // Trim oldest if over limit
        if (dotsRef.current.length > MAX_DOTS) {
          dotsRef.current.shift()
        }
      }

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and prune
      dotsRef.current = dotsRef.current.filter(dot => {
        const age = now - dot.born
        if (age >= dot.lifetime) return false

        const t = age / dot.lifetime           // 0 → 1
        const fadeT = 1 - t                    // 1 → 0
        const scale = 0.5 + fadeT * 0.5        // shrinks as it fades

        const opacity = fadeT * 0.7
        const r = DOT_RADIUS * scale

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(110, 103, 255, ${opacity})`
        ctx.shadowColor = 'rgba(79, 70, 255, 0.8)'
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0

        return true
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
