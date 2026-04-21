'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// ─── Design token colors ───────────────────────────────────────────────────
const C = {
  bgBase:    0x080614,
  bgSurf:    0x0D0B1E,
  bgElev:    0x141128,
  border:    0x252248,
  accent:    0x4F46FF,
  accentLt:  0x6E67FF,
  accentDim: 0x2E2A99,
}

// ─── Camera rail ─────────────────────────────────────────────────────────────
const RAIL: { p: [number,number,number]; l: [number,number,number] }[] = [
  { p: [0,  22, 60],  l: [0,  2,  20]  }, // 0%   – aerial overview
  { p: [4,   5, 35],  l: [0,  3,  12]  }, // 20%  – street level
  { p: [-2, 10, 14],  l: [0,  6,  -4]  }, // 40%  – interior atrium
  { p: [3,   7, -6],  l: [0,  4, -28]  }, // 60%  – bridge crossing
  { p: [0,  16, -30], l: [0, 11, -52]  }, // 80%  – rooftop ascent
  { p: [0,  19, -46], l: [0, 14, -64]  }, // 100% – rooftop settled
]

function smoothstep(t: number) { return t * t * (3 - 2 * t) }

function railPoint(progress: number): { pos: [number,number,number]; look: [number,number,number] } {
  const n = RAIL.length - 1
  const raw = Math.max(0, Math.min(1, progress)) * n
  const i = Math.min(Math.floor(raw), n - 1)
  const f = smoothstep(raw - i)
  const { p: ap, l: al } = RAIL[i]
  const { p: bp, l: bl } = RAIL[i + 1]
  return {
    pos:  [ap[0] + (bp[0] - ap[0]) * f, ap[1] + (bp[1] - ap[1]) * f, ap[2] + (bp[2] - ap[2]) * f],
    look: [al[0] + (bl[0] - al[0]) * f, al[1] + (bl[1] - al[1]) * f, al[2] + (bl[2] - al[2]) * f],
  }
}

// ─── Procedural city ─────────────────────────────────────────────────────────
function lcg(seed: number) {
  let s = seed | 0
  return () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 0x100000000 }
}

interface BuildingDef {
  baseX: number; xVar: number; zStride: number
  hMin: number; hMax: number; wMin: number; wMax: number; dMin: number; dMax: number
  emBase: number; emVar: number; edgeColor: number; bodyColor: number
}

const BANDS: BuildingDef[] = [
  { baseX:  10, xVar: 4, zStride: 9,  hMin:  6, hMax: 22, wMin: 3, wMax:  7, dMin: 4, dMax:  8, emBase: 0.35, emVar: 0.40, edgeColor: C.accent,    bodyColor: C.bgElev },
  { baseX: -10, xVar: 4, zStride: 9,  hMin:  6, hMax: 22, wMin: 3, wMax:  7, dMin: 4, dMax:  8, emBase: 0.35, emVar: 0.40, edgeColor: C.accentLt,  bodyColor: C.bgElev },
  { baseX:  21, xVar: 6, zStride: 8,  hMin: 10, hMax: 32, wMin: 5, wMax:  9, dMin: 5, dMax: 10, emBase: 0.10, emVar: 0.15, edgeColor: C.accentDim, bodyColor: C.bgSurf },
  { baseX: -21, xVar: 6, zStride: 8,  hMin: 10, hMax: 32, wMin: 5, wMax:  9, dMin: 5, dMax: 10, emBase: 0.10, emVar: 0.15, edgeColor: C.accentDim, bodyColor: C.bgSurf },
  { baseX:  42, xVar:10, zStride: 7,  hMin: 12, hMax: 45, wMin: 7, wMax: 14, dMin: 7, dMax: 14, emBase: 0.02, emVar: 0.04, edgeColor: C.border,    bodyColor: C.bgBase },
  { baseX: -42, xVar:10, zStride: 7,  hMin: 12, hMax: 45, wMin: 7, wMax: 14, dMin: 7, dMax: 14, emBase: 0.02, emVar: 0.04, edgeColor: C.border,    bodyColor: C.bgBase },
]

interface CityBuilding {
  pos: [number,number,number]
  boxGeo: THREE.BoxGeometry
  edgeGeo: THREE.EdgesGeometry
  bodyColor: number
  edgeColor: number
  emissiveIntensity: number
}

function generateCity(): CityBuilding[] {
  const rand = lcg(0x48879)
  const buildings: CityBuilding[] = []
  for (const band of BANDS) {
    for (let z = -95; z <= 115; z += band.zStride) {
      if (rand() < 0.12) continue
      const h = band.hMin + rand() * (band.hMax - band.hMin)
      const w = band.wMin + rand() * (band.wMax - band.wMin)
      const d = band.dMin + rand() * (band.dMax - band.dMin)
      const x = band.baseX + (rand() - 0.5) * band.xVar * 2
      const zPos = z + (rand() - 0.5) * band.zStride * 0.7
      const boxGeo = new THREE.BoxGeometry(w, h, d)
      const edgeGeo = new THREE.EdgesGeometry(boxGeo)
      buildings.push({
        pos: [x, h / 2, zPos],
        boxGeo, edgeGeo,
        bodyColor: band.bodyColor,
        edgeColor: band.edgeColor,
        emissiveIntensity: band.emBase + rand() * band.emVar,
      })
    }
  }
  return buildings
}

// ─── Named landmark buildings ─────────────────────────────────────────────────
const LANDMARKS = [
  { name: 'NEXUS TOWER',      x:  13, h: 38, z:  56, w: 5, d: 5, hasAntenna: true,  antH: 12 },
  { name: 'SKYLINE FUND',     x: -14, h: 30, z:  48, w: 4, d: 4, hasAntenna: false, antH: 0  },
  { name: 'ALPHA CAPITAL',    x:  11, h: 34, z:  28, w: 6, d: 5, hasAntenna: true,  antH: 10 },
  { name: 'FLOW HQ',          x: -12, h: 26, z:  20, w: 5, d: 5, hasAntenna: true,  antH: 8  },
  { name: 'DATA FORTRESS',    x:  11, h: 42, z:   4, w: 6, d: 6, hasAntenna: true,  antH: 14 },
  { name: 'BRIDGE EXCHANGE',  x: -11, h: 32, z:  -12, w: 5, d: 5, hasAntenna: false, antH: 0 },
  { name: 'BEACON ANALYTICS', x:  13, h: 36, z:  -30, w: 5, d: 5, hasAntenna: true,  antH: 11 },
  { name: 'VERTEX PLAZA',     x: -11, h: 30, z:  -48, w: 6, d: 5, hasAntenna: false, antH: 0 },
]

// ─── Antenna tower component ──────────────────────────────────────────────────
function AntennaTower({ x, h, z, antH, idx }: { x: number; h: number; z: number; antH: number; idx: number }) {
  const lightRef = useRef<THREE.Mesh>(null)
  const glowRef  = useRef<THREE.PointLight>(null)

  // Each antenna blinks at a different phase
  const phase = idx * 1.3

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Slow blink: 0.6s on, 0.6s off style with a sharp sine
    const blink = Math.sin(t * 1.6 + phase) > 0.6 ? 1 : 0.05
    if (lightRef.current) {
      const mat = lightRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = blink
    }
    if (glowRef.current) {
      glowRef.current.intensity = blink * 4
    }
  })

  // Mast base: sits on top of building (y=h), mast center is at h + antH/2
  const mastY = h + antH / 2
  const tipY  = h + antH

  return (
    <group>
      {/* Mast */}
      <mesh position={[x, mastY, z]}>
        <cylinderGeometry args={[0.08, 0.14, antH, 5]} />
        <meshStandardMaterial color={C.border} emissive={C.accentDim} emissiveIntensity={0.2} roughness={0.9} />
      </mesh>
      {/* Cross-arm */}
      <mesh position={[x, tipY - antH * 0.3, z]}>
        <boxGeometry args={[1.4, 0.08, 0.08]} />
        <meshStandardMaterial color={C.border} roughness={0.9} />
      </mesh>
      {/* Blink light sphere */}
      <mesh ref={lightRef} position={[x, tipY + 0.15, z]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial
          color={0xFF2222}
          emissive={0xFF1111}
          emissiveIntensity={1}
          roughness={0.3}
        />
      </mesh>
      {/* Glow point light at tip */}
      <pointLight
        ref={glowRef}
        position={[x, tipY + 0.15, z]}
        color={0xFF3333}
        intensity={4}
        distance={12}
        decay={2}
      />
    </group>
  )
}

// ─── City scene ────────────────────────────────────────────────────────────────
interface CitySceneProps {
  scrollRef: { current: number }
}

export default function CityScene({ scrollRef }: CitySceneProps) {
  const { camera } = useThree()
  const smoothProgress = useRef(0)
  const camPosVec = useRef(new THREE.Vector3(0, 22, 60))
  const targetPosVec = useRef(new THREE.Vector3())

  const buildings = useMemo(() => generateCity(), [])

  useFrame((_, delta) => {
    const raw = scrollRef.current
    smoothProgress.current += (raw - smoothProgress.current) * 0.055

    const { pos, look } = railPoint(smoothProgress.current)
    targetPosVec.current.set(...pos)
    camPosVec.current.lerp(targetPosVec.current, 0.08)
    camera.position.copy(camPosVec.current)
    camera.lookAt(look[0], look[1], look[2])
  })

  return (
    <>
      <color attach="background" args={['#080614']} />
      <fog attach="fog" args={[0x080614, 38, 160]} />

      {/* Lighting */}
      <hemisphereLight args={[0x141128, 0x080614, 0.6]} />
      <directionalLight position={[0, 60, 20]} intensity={0.4} color={0x4F46FF} />
      <pointLight position={[0,  6,  28]} intensity={3} color={0x4F46FF} distance={70} decay={2} />
      <pointLight position={[0,  6,   0]} intensity={2} color={0x6E67FF} distance={55} decay={2} />
      <pointLight position={[0,  8, -28]} intensity={3} color={0x4F46FF} distance={70} decay={2} />
      <pointLight position={[-8, 12, -52]} intensity={2} color={0x6E67FF} distance={45} decay={2} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]}>
        <planeGeometry args={[220, 260]} />
        <meshStandardMaterial color={0x080614} emissive={0x090720} emissiveIntensity={0.4} roughness={1} />
      </mesh>

      {/* Road lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]}>
        <planeGeometry args={[0.3, 260]} />
        <meshBasicMaterial color={0x4F46FF} opacity={0.55} transparent />
      </mesh>
      {[-3.5, 3.5].map((xOff, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[xOff, 0.01, 10]}>
          <planeGeometry args={[0.12, 260]} />
          <meshBasicMaterial color={0x252248} opacity={0.4} transparent />
        </mesh>
      ))}

      {/* Procedural background buildings */}
      {buildings.map((b, idx) => (
        <group key={idx} position={b.pos}>
          <mesh geometry={b.boxGeo}>
            <meshStandardMaterial
              color={b.bodyColor}
              emissive={b.edgeColor}
              emissiveIntensity={b.emissiveIntensity}
              roughness={0.88}
              metalness={0.12}
            />
          </mesh>
          <lineSegments geometry={b.edgeGeo}>
            <lineBasicMaterial
              color={b.edgeColor}
              opacity={b.edgeColor === C.accent || b.edgeColor === C.accentLt ? 0.65 : 0.3}
              transparent
            />
          </lineSegments>
        </group>
      ))}

      {/* Named landmark buildings with labels */}
      {LANDMARKS.map((lm) => {
        const boxGeo = new THREE.BoxGeometry(lm.w, lm.h, lm.d)
        const edgeGeo = new THREE.EdgesGeometry(boxGeo)
        return (
          <group key={lm.name}>
            {/* Building body */}
            <group position={[lm.x, lm.h / 2, lm.z]}>
              <mesh geometry={boxGeo}>
                <meshStandardMaterial
                  color={C.bgElev}
                  emissive={C.accent}
                  emissiveIntensity={0.45}
                  roughness={0.8}
                  metalness={0.18}
                />
              </mesh>
              <lineSegments geometry={edgeGeo}>
                <lineBasicMaterial color={C.accent} opacity={0.75} transparent />
              </lineSegments>
            </group>

            {/* Name label — fixed low y so it's in the aerial camera's FOV */}
            <Html
              position={[lm.x, 4.5, lm.z]}
              center
              zIndexRange={[200, 100]}
              occlude={false}
              style={{ pointerEvents: 'none' }}
            >
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.2em',
                color: 'rgba(140,133,255,0.95)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textShadow: '0 0 18px rgba(79,70,255,1), 0 0 6px rgba(79,70,255,0.8)',
                userSelect: 'none',
                padding: '5px 12px',
                background: 'rgba(8,6,20,0.75)',
                backdropFilter: 'blur(6px)',
                borderRadius: '6px',
                border: '1px solid rgba(79,70,255,0.4)',
                boxShadow: '0 0 16px rgba(79,70,255,0.2)',
              }}>
                {lm.name}
              </div>
            </Html>
          </group>
        )
      })}

      {/* Antenna towers on select landmarks */}
      {LANDMARKS.filter(lm => lm.hasAntenna).map((lm, idx) => (
        <AntennaTower key={lm.name} x={lm.x} h={lm.h} z={lm.z} antH={lm.antH} idx={idx} />
      ))}
    </>
  )
}
