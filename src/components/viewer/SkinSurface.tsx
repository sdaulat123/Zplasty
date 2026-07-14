import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { deformationWeight, illustrativeDeformationColor } from '../../geometry/meshDeformation'
import { conceptualSurfaceHeight, type SurfaceLayout } from '../../geometry/surfaceMath'
import type { SurfaceMode } from '../../types/simulation'

export function SkinSurface({ geometryResult, layout }: { geometryResult: ZPlastyGeometryResult; layout: SurfaceLayout }) {
  const params = useSimulationStore((state) => state.params)
  const surfaceMode = useSimulationStore((state) => state.surfaceMode)
  const overlays = useSimulationStore((state) => state.overlays)
  const colorBlindSafe = useSimulationStore((state) => state.accessibility.colorBlindSafe)

  const skinGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(layout.width, layout.height, 48, 36)
    const positions = geometry.attributes.position
    const colors: number[] = []
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i) + layout.centerX
      const y = positions.getY(i) + layout.centerY
      const curve = conceptualSurfaceHeight({ x, y }, surfaceMode, params.surfaceCurvature, layout)
      positions.setZ(i, curve)
      const weight = overlays.heatmap ? deformationWeight({ x, y }, geometryResult, params) : 0
      const color = new THREE.Color(weight > 0 ? illustrativeDeformationColor(weight, colorBlindSafe) : '#f2b6a8')
      colors.push(color.r, color.g, color.b)
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    return geometry
  }, [colorBlindSafe, geometryResult, layout, overlays.heatmap, params, surfaceMode])
  useEffect(() => () => skinGeometry.dispose(), [skinGeometry])

  return (
    <group>
      <mesh geometry={skinGeometry} name="SkinSurface" position={[layout.centerX, layout.centerY, 0]} receiveShadow>
        <meshStandardMaterial color="#edc2b5" roughness={0.62} vertexColors={overlays.heatmap} />
      </mesh>
      <mesh name="DeepTissuePlane" position={[layout.centerX, layout.centerY, -3]}>
        <planeGeometry args={[layout.width, layout.height, 8, 8]} />
        <meshStandardMaterial color="#d98e7d" opacity={0.3} transparent />
      </mesh>
      {overlays.grid && (
        <SurfaceGrid
          curvature={params.surfaceCurvature}
          layout={layout}
          mode={surfaceMode}
        />
      )}
    </group>
  )
}

function SurfaceGrid({ curvature, layout, mode }: { curvature: number; layout: SurfaceLayout; mode: SurfaceMode }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const left = layout.centerX - layout.width / 2
    const right = layout.centerX + layout.width / 2
    const top = layout.centerY - layout.height / 2
    const bottom = layout.centerY + layout.height / 2
    const step = 10
    const addSegment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      positions.push(
        a.x, a.y, conceptualSurfaceHeight(a, mode, curvature, layout) + 0.75,
        b.x, b.y, conceptualSurfaceHeight(b, mode, curvature, layout) + 0.75,
      )
    }
    for (let x = Math.ceil(left / step) * step; x <= right; x += step) {
      for (let y = top; y < bottom; y += step) addSegment({ x, y }, { x, y: Math.min(y + step, bottom) })
    }
    for (let y = Math.ceil(top / step) * step; y <= bottom; y += step) {
      for (let x = left; x < right; x += step) addSegment({ x, y }, { x: Math.min(x + step, right), y })
    }
    const grid = new THREE.BufferGeometry()
    grid.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return grid
  }, [curvature, layout, mode])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <lineSegments geometry={geometry} name="GridPlane">
      <lineBasicMaterial color="#9f7a51" opacity={0.42} transparent />
    </lineSegments>
  )
}
