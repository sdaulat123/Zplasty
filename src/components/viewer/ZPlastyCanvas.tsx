import { ContactShadows, Environment, OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { SkinSurface } from './SkinSurface'
import { IncisionLines } from './IncisionLines'
import { FlapMesh } from './FlapMesh'
import { TensionOverlay } from './TensionOverlay'
import { ControlHandles } from './ControlHandles'
import { CrossSectionView } from './CrossSectionView'
import { phaseOrder } from '../../animation/phaseDefinitions'

export function ZPlastyCanvas({ geometry }: { geometry: ZPlastyGeometryResult }) {
  return (
    <Canvas className="h-full w-full" gl={{ antialias: true, preserveDrawingBuffer: true }} shadows onPointerMissed={() => useSimulationStore.getState().select(null)}>
      <color attach="background" args={['#f6e8cc']} />
      <SceneCamera />
      <SceneAnimator />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={['#fff8df', '#b47d62', 1.1]} />
      <directionalLight castShadow intensity={3.2} position={[4, 7, 5]} shadow-mapSize={[2048, 2048]} />
      <pointLight intensity={0.8} position={[-4, 2, -3]} color="#ffd29e" />
      <group scale={0.035}>
        <SkinSurface geometryResult={geometry} />
        <FlapMesh geometryResult={geometry} />
        <IncisionLines geometryResult={geometry} />
        <TensionOverlay geometryResult={geometry} />
        <ControlHandles geometryResult={geometry} />
      </group>
      <CrossSectionView geometryResult={geometry} />
      <ContactShadows position={[0, 0, -0.18]} opacity={0.2} scale={8} blur={2.3} far={4} />
      <Environment preset="studio" environmentIntensity={0.45} />
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

function SceneAnimator() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const { camera, gl } = useThree()
  const animation = useSimulationStore((state) => state.animation)
  const accessibility = useSimulationStore((state) => state.accessibility)
  const autoRotate = useSimulationStore((state) => state.autoRotate)

  useFrame((_, delta) => {
    if (animation.isPlaying && !accessibility.reducedMotion) {
      const next = animation.phaseProgress + delta * 0.26 * animation.playbackSpeed
      if (next >= 1) {
        const index = phaseOrder.indexOf(animation.phase)
        if (animation.loopMode === 'phase') {
          useSimulationStore.getState().setPhaseProgress(0)
        } else if (animation.loopMode === 'full' || index < phaseOrder.length - 1) {
          useSimulationStore.getState().setPhase(phaseOrder[(index + 1) % phaseOrder.length])
        } else {
          useSimulationStore.getState().setPlaying(false)
          useSimulationStore.getState().setPhaseProgress(1)
        }
      } else {
        useSimulationStore.getState().setPhaseProgress(next)
      }
    }
    controlsRef.current?.update()
  })

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
    if (camera instanceof THREE.PerspectiveCamera) camera.position.set(0, -3.5, 4.5)
    if (camera instanceof THREE.OrthographicCamera) camera.lookAt(0, 0, 0)
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update()
  }, [camera])

  return <OrbitControls ref={controlsRef} autoRotate={autoRotate} autoRotateSpeed={0.5} enableDamping makeDefault />
}
