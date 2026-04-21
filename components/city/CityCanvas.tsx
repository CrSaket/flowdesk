'use client'

import { Canvas } from '@react-three/fiber'
import CityScene from './CityScene'

interface CityCanvasProps {
  scrollRef: { current: number }
}

export function CityCanvas({ scrollRef }: CityCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 22, 60], fov: 60, near: 0.1, far: 500 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      role="img"
      aria-label="Animated 3D cityscape that responds to scrolling — decorative"
    >
      <CityScene scrollRef={scrollRef} />
    </Canvas>
  )
}
