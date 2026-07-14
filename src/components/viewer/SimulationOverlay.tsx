import { useMemo, useRef } from 'react'
import type { DragHandleId, Point2D, SelectableId, ZPlastyGeometryResult } from '../../types/geometry'
import { activeFlaps } from '../../animation/flapTransforms'
import { useSimulationStore } from '../../store/simulationStore'
import { midpoint } from '../../geometry/vectorMath'

export function SimulationOverlay({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const animation = useSimulationStore((state) => state.animation)
  const overlays = useSimulationStore((state) => state.overlays)
  const selectedId = useSimulationStore((state) => state.selectedId)
  const hover = useSimulationStore((state) => state.hover)
  const select = useSimulationStore((state) => state.select)
  const dragHandle = useSimulationStore((state) => state.dragHandle)
  const phase = animation.phase
  const transpositionProgress = phase === 'transposition' ? animation.phaseProgress : ['approximation', 'closure', 'comparison'].includes(phase) ? 1 : 0
  const flaps = useMemo(() => activeFlaps(geometry, transpositionProgress), [geometry, transpositionProgress])
  const p = geometry.points
  const incisionProgress = phase === 'incision' ? animation.phaseProgress : phase === 'native' ? 0.55 : 1
  const showClosure = ['approximation', 'closure', 'comparison'].includes(phase)

  const toSvgPoint = (event: React.PointerEvent<SVGElement>) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * 180 - 90,
      y: ((event.clientY - rect.top) / rect.height) * 140 - 70,
    }
  }

  const onDrag = (id: DragHandleId, event: React.PointerEvent<SVGCircleElement>) => {
    if (event.buttons !== 1) return
    const point = toSvgPoint(event)
    dragHandle(id, point.x, point.y)
  }

  return (
    <div className="absolute inset-8 z-30 overflow-hidden rounded-md border border-[#c98b78] bg-[#e9b09f] shadow-[0_18px_42px_rgba(98,55,36,0.16)]">
      <svg
        aria-label="Interactive Z-plasty plan simulation"
        className="h-full w-full"
        ref={svgRef}
        role="img"
        viewBox="-90 -70 180 140"
      >
      <rect x="-78" y="-50" width="156" height="100" rx="5" fill="#eeb1a2" stroke="#b86f5d" strokeWidth="1.2" />
      <rect x="-70" y="-42" width="140" height="84" rx="2" fill="none" stroke="#9e604f" strokeOpacity="0.34" strokeWidth="1.2" />
      <line x1="-70" y1="-42" x2="70" y2="-42" stroke="#fff2df" strokeOpacity="0.28" strokeWidth="2" />
      <line x1="-70" y1="42" x2="70" y2="42" stroke="#8f5a49" strokeOpacity="0.18" strokeWidth="2" />
      {Array.from({ length: 15 }).map((_, index) => {
        const x = -70 + index * 10
        return <line key={`top-tick-${index}`} x1={x} x2={x} y1="-42" y2="-38" stroke="#8f5a49" strokeOpacity="0.3" strokeWidth="0.7" />
      })}
      {Array.from({ length: 9 }).map((_, index) => {
        const y = -40 + index * 10
        return <line key={`side-tick-${index}`} x1="-70" x2="-66" y1={y} y2={y} stroke="#8f5a49" strokeOpacity="0.3" strokeWidth="0.7" />
      })}
      {overlays.grid && <Grid />}

      {phase === 'comparison' && (
        <line x1={p.centralStart.x} y1={p.centralStart.y} x2={p.centralEnd.x} y2={p.centralEnd.y} stroke="#8d2130" strokeDasharray="3 3" strokeWidth="2" opacity="0.5" />
      )}

      <FlapPolygon id="UpperFlap" points={flaps.upper} color="#f3a0a8" selected={selectedId === 'UpperFlap'} onHover={hover} onSelect={select} />
      <FlapPolygon id="LowerFlap" points={flaps.lower} color="#7ac9c2" selected={selectedId === 'LowerFlap'} onHover={hover} onSelect={select} />

      <PlanLine id="CentralLimb" from={p.centralStart} to={lerpPoint(p.centralStart, p.centralEnd, incisionProgress)} selected={selectedId === 'CentralLimb'} color="#8d2130" onHover={hover} onSelect={select} />
      <PlanLine id="UpperLateralLimb" from={p.centralEnd} to={lerpPoint(p.centralEnd, p.upperEndpoint, incisionProgress)} selected={selectedId === 'UpperLateralLimb'} color="#d95d5d" onHover={hover} onSelect={select} />
      <PlanLine id="LowerLateralLimb" from={p.centralStart} to={lerpPoint(p.centralStart, p.lowerEndpoint, incisionProgress)} selected={selectedId === 'LowerLateralLimb'} color="#d95d5d" onHover={hover} onSelect={select} />

      {overlays.edgeCorrespondence && (
        <>
          <path d={`M ${p.upperEndpoint.x} ${p.upperEndpoint.y} C ${p.upperEndpoint.x + 15} ${p.upperEndpoint.y - 18}, ${p.lowerDestination.x - 15} ${p.lowerDestination.y + 18}, ${p.lowerDestination.x} ${p.lowerDestination.y}`} fill="none" stroke="#7464c8" strokeDasharray="3 3" strokeWidth="1.5" />
          <path d={`M ${p.lowerEndpoint.x} ${p.lowerEndpoint.y} C ${p.lowerEndpoint.x - 15} ${p.lowerEndpoint.y + 18}, ${p.upperDestination.x + 15} ${p.upperDestination.y - 18}, ${p.upperDestination.x} ${p.upperDestination.y}`} fill="none" stroke="#d28b30" strokeDasharray="3 3" strokeWidth="1.5" />
        </>
      )}

      {showClosure && overlays.closureVectors && (
        <>
          <Arrow from={p.upperDestination} to={p.centralStart} />
          <Arrow from={p.lowerDestination} to={p.centralEnd} />
        </>
      )}

      {showClosure && overlays.sutures && Array.from({ length: 7 }).map((_, index) => {
        const point = lerpPoint(p.centralStart, p.centralEnd, index / 6)
        return <circle cx={point.x} cy={point.y} fill="#fff7df" key={index} r="2.2" stroke="#5a3d2c" strokeWidth="0.8" />
      })}

      <Handle id="centralStart" point={p.centralStart} label="A" onDrag={onDrag} onSelect={select} />
      <Handle id="centralEnd" point={p.centralEnd} label="B" onDrag={onDrag} onSelect={select} />
      <Handle id="upperEndpoint" point={p.upperEndpoint} label="C" onDrag={onDrag} onSelect={select} />
      <Handle id="lowerEndpoint" point={p.lowerEndpoint} label="D" onDrag={onDrag} onSelect={select} />

      {overlays.centralLength && <Label at={midpoint(p.centralStart, p.centralEnd)} text={`${geometry.preoperativeAxisLength.toFixed(1)} mm`} />}
      {overlays.angles && <Label at={{ x: p.centralEnd.x - 23, y: p.centralEnd.y - 12 }} text={`${geometry.upperAngleDeg.toFixed(0)} deg`} />}
      {overlays.angles && <Label at={{ x: p.centralStart.x + 23, y: p.centralStart.y + 12 }} text={`${geometry.lowerAngleDeg.toFixed(0)} deg`} />}
      {overlays.gain && <Label at={{ x: 37, y: -44 }} text={`gain ${geometry.theoreticalLengthGainPercent.toFixed(0)}%`} />}
      {overlays.orientation && (
        <>
          <Label at={{ x: -74, y: -44 }} text="Superior" />
          <Label at={{ x: 62, y: 46 }} text="Lateral" />
        </>
      )}
      <g transform="translate(-76,52)">
        <rect width="68" height="14" rx="7" fill="#fff8e8" stroke="#c79b63" strokeWidth="0.7" />
        <text
          x="34"
          y="9.5"
          fill="#5e3f1e"
          fontSize="4.2"
          fontWeight="800"
          onClick={() => select('UpperFlap')}
          onPointerDown={() => select('UpperFlap')}
          textAnchor="middle"
        >
          Select upper flap
        </text>
      </g>
      <g transform="translate(8,52)">
        <rect width="68" height="14" rx="7" fill="#fff8e8" stroke="#c79b63" strokeWidth="0.7" />
        <text
          x="34"
          y="9.5"
          fill="#5e3f1e"
          fontSize="4.2"
          fontWeight="800"
          onClick={() => select('LowerFlap')}
          onPointerDown={() => select('LowerFlap')}
          textAnchor="middle"
        >
          Select lower flap
        </text>
      </g>
    </svg>
    </div>
  )
}

function Grid() {
  return (
    <g opacity="0.22">
      {Array.from({ length: 17 }).map((_, index) => <line key={`v-${index}`} x1={-80 + index * 10} y1="-54" x2={-80 + index * 10} y2="54" stroke="#8f6b43" strokeWidth="0.4" />)}
      {Array.from({ length: 12 }).map((_, index) => <line key={`h-${index}`} x1="-80" y1={-54 + index * 10} x2="80" y2={-54 + index * 10} stroke="#8f6b43" strokeWidth="0.4" />)}
    </g>
  )
}

function FlapPolygon({ id, points, color, selected, onHover, onSelect }: { id: SelectableId; points: Point2D[]; color: string; selected: boolean; onHover: (id: SelectableId | null) => void; onSelect: (id: SelectableId | null) => void }) {
  return (
    <polygon
      data-selectable-id={id}
      fill={selected ? '#fff0a3' : color}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      onPointerLeave={() => onHover(null)}
      onPointerMove={() => onHover(id)}
      opacity={selected ? 0.86 : 0.58}
      points={points.map((point) => `${point.x},${point.y}`).join(' ')}
      stroke={selected ? '#7c2d12' : '#8b6250'}
      strokeWidth={selected ? 2.4 : 1.1}
    />
  )
}

function PlanLine({ id, from, to, color, selected, onHover, onSelect }: { id: SelectableId; from: Point2D; to: Point2D; color: string; selected: boolean; onHover: (id: SelectableId | null) => void; onSelect: (id: SelectableId | null) => void }) {
  return (
    <line
      data-selectable-id={id}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      onPointerDown={(event) => {
        event.stopPropagation()
        onSelect(id)
      }}
      onPointerLeave={() => onHover(null)}
      onPointerMove={() => onHover(id)}
      stroke={selected ? '#fff0a3' : color}
      strokeLinecap="round"
      strokeWidth={selected ? 4.6 : 3}
      x1={from.x}
      x2={to.x}
      y1={from.y}
      y2={to.y}
    />
  )
}

function Handle({ id, point, label, onDrag, onSelect }: { id: DragHandleId; point: Point2D; label: string; onDrag: (id: DragHandleId, event: React.PointerEvent<SVGCircleElement>) => void; onSelect: (id: DragHandleId | null) => void }) {
  return (
    <g>
      <circle
        data-selectable-id={id}
        cx={point.x}
        cy={point.y}
        fill="#fff0a3"
        onClick={(event) => {
          event.stopPropagation()
          onSelect(id)
        }}
        onPointerDown={(event) => {
          try {
            event.currentTarget.setPointerCapture(event.pointerId)
          } catch {
            // Synthetic browser checks may not create an active pointer capture target.
          }
          onSelect(id)
        }}
        onPointerMove={(event) => onDrag(id, event)}
        r="4.2"
        stroke="#7c2d12"
        strokeWidth="1.3"
      />
      <text x={point.x + 5} y={point.y - 5} fill="#5e3f1e" fontSize="5" fontWeight="800">{label}</text>
    </g>
  )
}

function Label({ at, text }: { at: Point2D; text: string }) {
  return (
    <g>
      <rect x={at.x - 15} y={at.y - 6} width="30" height="10" rx="5" fill="#fff8e8" stroke="#c79b63" strokeWidth="0.6" />
      <text x={at.x} y={at.y + 2} fill="#5e3f1e" fontSize="4.2" fontWeight="800" textAnchor="middle">{text}</text>
    </g>
  )
}

function Arrow({ from, to }: { from: Point2D; to: Point2D }) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#258a84" strokeLinecap="round" strokeWidth="2.2" />
}

function lerpPoint(a: Point2D, b: Point2D, t: number): Point2D {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}
