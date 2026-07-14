import { useRef, useState } from 'react'
import type { DragHandleId, Point2D, SelectableId, ZPlastyGeometryResult } from '../../types/geometry'
import { useSimulationStore } from '../../store/simulationStore'
import { add, fromAngle, midpoint, subtract } from '../../geometry/vectorMath'
import { formatLength } from '../../geometry/measurements'
import { fitViewBox, type ViewBox } from '../../geometry/viewBox'

export function SimulationOverlay({ geometry }: { geometry: ZPlastyGeometryResult }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<DragHandleId | null>(null)
  const [lockedViewBox, setLockedViewBox] = useState<ViewBox | null>(null)
  const animation = useSimulationStore((state) => state.animation)
  const overlays = useSimulationStore((state) => state.overlays)
  const selectedId = useSimulationStore((state) => state.selectedId)
  const params = useSimulationStore((state) => state.params)
  const unit = useSimulationStore((state) => state.unit)
  const hover = useSimulationStore((state) => state.hover)
  const select = useSimulationStore((state) => state.select)
  const dragHandle = useSimulationStore((state) => state.dragHandle)
  const phase = animation.phase
  const phaseAfterTransposition = ['approximation', 'closure', 'comparison'].includes(phase)
  const finalProgress = phase === 'transposition' ? animation.phaseProgress : phaseAfterTransposition ? 1 : 0
  const initialOpacity = phase === 'native' ? 0 : phase === 'transposition' ? 1 - finalProgress : phaseAfterTransposition ? 0 : 1
  const finalOpacity = finalProgress
  const showDesign = phase !== 'native'
  const p = geometry.points
  const incisionProgress = phase === 'incision' ? animation.phaseProgress : phase === 'native' ? 0 : 1
  const referenceHalfLength = Math.max(74, geometry.totalConstructionSpan * 0.7)
  const contracture = fromAngle(params.contractureAxisDeg, referenceHalfLength)
  const contractureStart = { x: params.centerX - contracture.x, y: params.centerY - contracture.y }
  const contractureEnd = { x: params.centerX + contracture.x, y: params.centerY + contracture.y }
  const angleLabelOffset = fromAngle(params.orientationDeg, Math.max(12, Math.min(18, geometry.originalAxisLength * 0.3)))
  const upperAngleLabel = add(p.centralEnd, angleLabelOffset)
  const lowerAngleLabel = subtract(p.centralStart, angleLabelOffset)
  const fittedViewBox = fitViewBox([...Object.values(geometry.points), contractureStart, contractureEnd])
  const viewBox = lockedViewBox ?? fittedViewBox

  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (svg && matrix) {
      const point = svg.createSVGPoint()
      point.x = clientX
      point.y = clientY
      const transformed = point.matrixTransform(matrix.inverse())
      return { x: transformed.x, y: transformed.y }
    }
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.width,
      y: viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.height,
    }
  }

  const finishDragging = () => {
    setDragging(null)
    setLockedViewBox(null)
  }

  const moveDraggingHandle = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    event.preventDefault()
    const point = toSvgPoint(event.clientX, event.clientY)
    dragHandle(dragging, point.x, point.y)
  }

  const beginDragging = (id: DragHandleId) => {
    setLockedViewBox(fittedViewBox)
    setDragging(id)
  }

  const moveWithKeyboard = (id: DragHandleId, point: Point2D, event: React.KeyboardEvent<SVGCircleElement>) => {
    const step = event.shiftKey ? 5 : 1
    const delta = event.key === 'ArrowLeft' ? { x: -step, y: 0 }
      : event.key === 'ArrowRight' ? { x: step, y: 0 }
        : event.key === 'ArrowUp' ? { x: 0, y: -step }
          : event.key === 'ArrowDown' ? { x: 0, y: step }
            : null
    if (!delta) return
    event.preventDefault()
    dragHandle(id, point.x + delta.x, point.y + delta.y)
  }

  const stagePadding = Math.max(5, Math.min(viewBox.width, viewBox.height) * 0.025)
  const validMeasurements = geometry.isValid

  return (
    <div className="plan-stage">
      <p className="sr-only" id="plan-instructions">Interactive planar construction. Tab to a point and use arrow keys to move it in two dimensions. Hold Shift for five-millimeter steps.</p>
      <svg
        aria-describedby="plan-instructions"
        aria-label="Interactive Z-plasty planar geometry editor"
        className="plan-svg"
        onPointerLeave={finishDragging}
        onPointerMove={moveDraggingHandle}
        onPointerUp={finishDragging}
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        <defs>
          <pattern height="10" id="minor-grid" patternUnits="userSpaceOnUse" width="10">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#9f8266" strokeOpacity="0.16" strokeWidth="0.45" />
          </pattern>
          <marker id="arrowhead" markerHeight="7" markerWidth="7" orient="auto" refX="5" refY="3.5">
            <path d="M0,0 L0,7 L6,3.5 z" fill="#167d78" />
          </marker>
          <filter id="handle-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="1" floodColor="#442c20" floodOpacity="0.25" stdDeviation="1.5" />
          </filter>
        </defs>

        <rect className="stage-surface" height={viewBox.height - stagePadding * 2} rx="8" width={viewBox.width - stagePadding * 2} x={viewBox.x + stagePadding} y={viewBox.y + stagePadding} />
        {overlays.grid && <rect fill="url(#minor-grid)" height={viewBox.height - stagePadding * 3} rx="5" width={viewBox.width - stagePadding * 3} x={viewBox.x + stagePadding * 1.5} y={viewBox.y + stagePadding * 1.5} />}

        {overlays.originalAxis && (
          <>
            <line className="contracture-axis" x1={contractureStart.x} x2={contractureEnd.x} y1={contractureStart.y} y2={contractureEnd.y} />
            <text className="axis-label" x={contractureStart.x + 3} y={contractureStart.y - 4}>entered scar / contracture reference</text>
          </>
        )}

        {initialOpacity > 0 && (
          <g opacity={initialOpacity}>
            <FlapPolygon color="#e89a94" id="UpperFlap" onHover={hover} onSelect={select} points={geometry.upperFlap} selected={selectedId === 'UpperFlap'} />
            <FlapPolygon color="#6bb7ae" id="LowerFlap" onHover={hover} onSelect={select} points={geometry.lowerFlap} selected={selectedId === 'LowerFlap'} />
          </g>
        )}
        {finalOpacity > 0 && (
          <g opacity={finalOpacity}>
            <FlapPolygon color="#e89a94" id="UpperFlap" onHover={hover} onSelect={select} points={geometry.transformedUpperFlap} selected={selectedId === 'UpperFlap'} />
            <FlapPolygon color="#6bb7ae" id="LowerFlap" onHover={hover} onSelect={select} points={geometry.transformedLowerFlap} selected={selectedId === 'LowerFlap'} />
          </g>
        )}

        {phase === 'native' ? (
          <PlanLine color="#8e2f3d" from={p.centralStart} id="CentralLimb" onHover={hover} onSelect={select} selected={selectedId === 'CentralLimb'} to={p.centralEnd} />
        ) : initialOpacity > 0 ? (
          <g opacity={initialOpacity}>
            <PlanLine color="#8e2f3d" from={p.centralStart} id="CentralLimb" onHover={hover} onSelect={select} selected={selectedId === 'CentralLimb'} to={lerpPoint(p.centralStart, p.centralEnd, incisionProgress)} />
            <PlanLine color="#c94f4f" from={p.centralEnd} id="UpperLateralLimb" onHover={hover} onSelect={select} selected={selectedId === 'UpperLateralLimb'} to={lerpPoint(p.centralEnd, p.upperEndpoint, incisionProgress)} />
            <PlanLine color="#c94f4f" from={p.centralStart} id="LowerLateralLimb" onHover={hover} onSelect={select} selected={selectedId === 'LowerLateralLimb'} to={lerpPoint(p.centralStart, p.lowerEndpoint, incisionProgress)} />
          </g>
        ) : null}

        {finalOpacity > 0 && (
          <g opacity={finalOpacity}>
            <PlanLine color="#c94f4f" from={p.centralEnd} id="UpperLateralLimb" onHover={hover} onSelect={select} selected={selectedId === 'UpperLateralLimb'} to={p.upperEndpoint} />
            {overlays.finalAxis && <line className="final-axis" x1={geometry.finalAxisStart.x} x2={geometry.finalAxisEnd.x} y1={geometry.finalAxisStart.y} y2={geometry.finalAxisEnd.y} />}
            <PlanLine color="#c94f4f" from={p.lowerEndpoint} id="LowerLateralLimb" onHover={hover} onSelect={select} selected={selectedId === 'LowerLateralLimb'} to={p.centralStart} />
          </g>
        )}
        {phase === 'transposition' && overlays.exchangeGuides && (
          <>
            <line className="movement-arrow" markerEnd="url(#arrowhead)" x1={p.centralStart.x} x2={p.upperEndpoint.x} y1={p.centralStart.y} y2={p.upperEndpoint.y} />
            <line className="movement-arrow" markerEnd="url(#arrowhead)" x1={p.centralEnd.x} x2={p.lowerEndpoint.x} y1={p.centralEnd.y} y2={p.lowerEndpoint.y} />
          </>
        )}

        {showDesign && (
          <>
            <Handle id="centralStart" label="A" onKeyDown={moveWithKeyboard} onPointerDown={beginDragging} onSelect={select} point={p.centralStart} />
            <Handle id="centralEnd" label="B" onKeyDown={moveWithKeyboard} onPointerDown={beginDragging} onSelect={select} point={p.centralEnd} />
            <Handle id="upperEndpoint" label="C" onKeyDown={moveWithKeyboard} onPointerDown={beginDragging} onSelect={select} point={p.upperEndpoint} />
            <Handle id="lowerEndpoint" label="D" onKeyDown={moveWithKeyboard} onPointerDown={beginDragging} onSelect={select} point={p.lowerEndpoint} />
            <Handle id="center" label="MOVE" onKeyDown={moveWithKeyboard} onPointerDown={beginDragging} onSelect={select} point={{ x: params.centerX, y: params.centerY }} subtle />
          </>
        )}

        {showDesign && validMeasurements && overlays.centralLength && <MeasureLabel at={midpoint(p.centralStart, p.centralEnd)} text={formatLength(geometry.originalAxisLength, unit)} />}
        {showDesign && validMeasurements && overlays.limbLengths && <MeasureLabel at={midpoint(p.centralEnd, p.upperEndpoint)} text={formatLength(params.upperLimbLength, unit)} />}
        {showDesign && validMeasurements && overlays.limbLengths && <MeasureLabel at={midpoint(p.centralStart, p.lowerEndpoint)} text={formatLength(params.lowerLimbLength, unit)} />}
        {showDesign && validMeasurements && overlays.angles && <MeasureLabel at={upperAngleLabel} text={`${geometry.upperAngleDeg.toFixed(0)}°`} />}
        {showDesign && validMeasurements && overlays.angles && <MeasureLabel at={lowerAngleLabel} text={`${geometry.lowerAngleDeg.toFixed(0)}°`} />}
        {showDesign && validMeasurements && overlays.gain && (
          <MeasureLabel
            at={{ x: viewBox.x + viewBox.width - 42, y: viewBox.y + 18 }}
            emphasis
            text={`${geometry.theoreticalLengthChangePercent >= 0 ? '+' : ''}${geometry.theoreticalLengthChangePercent.toFixed(1)}% length`}
          />
        )}

        {!geometry.isValid && (
          <g transform={`translate(${viewBox.x + viewBox.width / 2 - 70},${viewBox.y + viewBox.height - 25})`}>
            <rect className="invalid-banner" height="13" rx="6.5" width="140" />
            <text className="invalid-text" textAnchor="middle" x="70" y="8.7">Invalid inputs — calculations withheld</text>
          </g>
        )}
      </svg>
      <div className="stage-legend" aria-hidden="true">
        <span><i className="legend-swatch incision" /> Entered incision geometry</span>
        <span><i className="legend-swatch movement" /> Schematic tip correspondence</span>
        <span><i className="legend-swatch reference" /> Reference axis</span>
      </div>
    </div>
  )
}

function FlapPolygon({ id, points, color, selected, onHover, onSelect }: { id: SelectableId; points: Point2D[]; color: string; selected: boolean; onHover: (id: SelectableId | null) => void; onSelect: (id: SelectableId | null) => void }) {
  return (
    <polygon
      aria-label={`Select ${id.replace(/([A-Z])/g, ' $1').trim()}`}
      className="flap"
      data-selectable-id={id}
      fill={selected ? '#f8d77a' : color}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(id)
        }
      }}
      onPointerLeave={() => onHover(null)}
      onPointerMove={() => onHover(id)}
      points={points.map((point) => `${point.x},${point.y}`).join(' ')}
      role="button"
      tabIndex={0}
    />
  )
}

function PlanLine({ id, from, to, color, selected, onHover, onSelect }: { id: SelectableId; from: Point2D; to: Point2D; color: string; selected: boolean; onHover: (id: SelectableId | null) => void; onSelect: (id: SelectableId | null) => void }) {
  return (
    <line
      aria-label={`Select ${id.replace(/([A-Z])/g, ' $1').trim()}`}
      className="plan-line"
      data-selectable-id={id}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(id)
        }
      }}
      onPointerLeave={() => onHover(null)}
      onPointerMove={() => onHover(id)}
      role="button"
      stroke={selected ? '#f8d77a' : color}
      strokeWidth={selected ? 4.5 : 3}
      tabIndex={0}
      x1={from.x}
      x2={to.x}
      y1={from.y}
      y2={to.y}
    />
  )
}

type HandleProps = {
  id: DragHandleId
  point: Point2D
  label: string
  subtle?: boolean
  onPointerDown: (id: DragHandleId) => void
  onSelect: (id: DragHandleId) => void
  onKeyDown: (id: DragHandleId, point: Point2D, event: React.KeyboardEvent<SVGCircleElement>) => void
}

function Handle({ id, point, label, subtle, onPointerDown, onSelect, onKeyDown }: HandleProps) {
  return (
    <g className={subtle ? 'plan-handle subtle' : 'plan-handle'}>
      <circle
        aria-label={id === 'center' ? 'Move entire construction' : `Move point ${label}`}
        className="handle-hit"
        cx={point.x}
        cy={point.y}
        onClick={() => onSelect(id)}
        onKeyDown={(event) => onKeyDown(id, point, event)}
        onPointerDown={(event) => {
          event.preventDefault()
          event.currentTarget.setPointerCapture?.(event.pointerId)
          onPointerDown(id)
          onSelect(id)
        }}
        r={subtle ? 10 : 16}
        role="button"
        tabIndex={0}
      />
      <circle aria-hidden="true" className="handle-dot" cx={point.x} cy={point.y} filter="url(#handle-shadow)" pointerEvents="none" r={subtle ? 4.8 : 6.2} />
      {!subtle && <text aria-hidden="true" x={point.x + 9} y={point.y - 8}>{label}</text>}
    </g>
  )
}

function MeasureLabel({ at, text, emphasis }: { at: Point2D; text: string; emphasis?: boolean }) {
  const width = Math.max(28, text.length * 3.2 + 8)
  return (
    <g className={emphasis ? 'measure-label emphasis' : 'measure-label'}>
      <rect height="11" rx="5.5" width={width} x={at.x - width / 2} y={at.y - 6.5} />
      <text textAnchor="middle" x={at.x} y={at.y + 1}>{text}</text>
    </g>
  )
}

function lerpPoint(a: Point2D, b: Point2D, t: number): Point2D {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}
