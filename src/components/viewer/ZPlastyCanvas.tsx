import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { SkinSurface } from './SkinSurface'
import { IncisionLines } from './IncisionLines'
import { FlapMesh } from './FlapMesh'
import { TensionOverlay } from './TensionOverlay'
import type { SurfaceLayout } from '../../geometry/surfaceMath'

export function ZPlastyCanvas({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const layout = sceneLayout(geometry)
  const scale = Math.min(4.15 / layout.width, 2.75 / layout.height)
  return (
    <Canvas className="h-full w-full" gl={{ antialias: true, preserveDrawingBuffer: true }} onPointerMissed={() => useSimulationStore.getState().select(null)}>
      <color attach="background" args={['#f6e8cc']} />
      <SceneCamera />
      <SceneControls />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={['#fff8df', '#b47d62', 1.1]} />
      <directionalLight intensity={3.2} position={[4, 7, 5]} />
      <pointLight intensity={0.8} position={[-4, 2, -3]} color="#ffd29e" />
      <group scale={[scale, -scale, scale]}>
        <group position={[-layout.centerX, -layout.centerY, 0]}>
          <SkinSurface geometryResult={geometry} layout={layout} />
          <FlapMesh geometryResult={geometry} layout={layout} />
          <IncisionLines geometryResult={geometry} layout={layout} />
          <TensionOverlay geometryResult={geometry} layout={layout} />
        </group>
      </group>
    </Canvas>
  )
}

function SceneCamera() {
  const cameraMode = useSimulationStore((state) => state.cameraMode)
  if (cameraMode === 'perspective' || cameraMode === 'oblique') {
    return <PerspectiveCamera makeDefault position={cameraMode === 'oblique' ? [2.7, -3.2, 4.2] : [0, -3.5, 4.5]} fov={42} />
  }
  if (cameraMode === 'side') return <OrthographicCamera makeDefault position={[0, -6, 1.2]} zoom={115} />
  return <OrthographicCamera makeDefault position={[0, 0, 6]} zoom={108} />
}

function SceneControls() {
  const { camera, gl } = useThree()
  const animation = useSimulationStore((state) => state.animation)
  const accessibility = useSimulationStore((state) => state.accessibility)
  const autoRotate = useSimulationStore((state) => state.autoRotate)

  useEffect(() => {
    const handler = () => {
      const canvas = gl.domElement
      const link = document.createElement('a')
      link.download = `zplasty-${animation.phase}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    window.addEventListener('zplasty:screenshot', handler)
    return () => window.removeEventListener('zplasty:screenshot', handler)
  }, [animation.phase, gl.domElement])

  useEffect(() => {
    camera.lookAt(0, 0, 0)
  }, [camera])

  return <OrbitControls autoRotate={autoRotate && !accessibility.reducedMotion} autoRotateSpeed={0.5} enableDamping makeDefault />
}

function sceneLayout(geometry: ZPlastyGeometryResult): SurfaceLayout {
  const points = Object.values(geometry.points)
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: Math.max(150, maxX - minX + 40),
    height: Math.max(110, maxY - minY + 40),
  }
}
