import { useMemo } from 'react'
import * as THREE from 'three'
import type { ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { deformationWeight, strainColor } from '../../geometry/meshDeformation'

export function SkinSurface({ geometryResult }: { geometryResult: ZPlastyGeometryResult }) {
  const params = useSimulationStore((state) => state.params)
  const surfaceMode = useSimulationStore((state) => state.surfaceMode)
  const overlays = useSimulationStore((state) => state.overlays)
  const colorBlindSafe = useSimulationStore((state) => state.accessibility.colorBlindSafe)

  const skinGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(150, 110, 48, 36)
    const positions = geometry.attributes.position
    const colors: number[] = []
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const curve =
        surfaceMode === 'flat'
          ? 0
          : surfaceMode === 'cylindrical'
            ? Math.sin((x / 150) * Math.PI) * params.surfaceCurvature * 24
            : surfaceMode === 'joint'
              ? Math.exp(-(x * x) / 1800) * params.surfaceCurvature * 28
              : (Math.sin((x / 150) * Math.PI) + Math.cos((y / 110) * Math.PI)) * params.surfaceCurvature * 8
      positions.setZ(i, curve)
      const weight = overlays.heatmap ? deformationWeight({ x, y }, geometryResult, params) : 0
      const color = new THREE.Color(weight > 0 ? strainColor(weight, colorBlindSafe) : '#f2b6a8')
      colors.push(color.r, color.g, color.b)
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    return geometry
  }, [colorBlindSafe, geometryResult, overlays.heatmap, params, surfaceMode])

  return (
    <group>
      <mesh geometry={skinGeometry} name="SkinSurface" receiveShadow>
        <meshStandardMaterial color="#f2b6a8" roughness={0.62} vertexColors={overlays.heatmap} />
      </mesh>
      <mesh name="DeepTissuePlane" position={[0, 0, -3]}>
        <planeGeometry args={[150, 110, 8, 8]} />
        <meshStandardMaterial color="#d98e7d" opacity={0.3} transparent />
      </mesh>
      {overlays.grid && <gridHelper args={[150, 15, '#8f6b43', '#dfc39d']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.6]} name="GridPlane" />}
    </group>
  )
}
