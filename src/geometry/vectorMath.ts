import type { Point2D } from '../types/geometry'

export const degToRad = (degrees: number) => (degrees * Math.PI) / 180
export const radToDeg = (radians: number) => (radians * 180) / Math.PI

export function add(a: Point2D, b: Point2D): Point2D {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function subtract(a: Point2D, b: Point2D): Point2D {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function scale(v: Point2D, factor: number): Point2D {
  return { x: v.x * factor, y: v.y * factor }
}

export function length(v: Point2D): number {
  return Math.hypot(v.x, v.y)
}

export function distance(a: Point2D, b: Point2D): number {
  return length(subtract(a, b))
}

export function normalize(v: Point2D): Point2D {
  const magnitude = length(v)
  return magnitude === 0 ? { x: 0, y: 0 } : scale(v, 1 / magnitude)
}

export function rotate(v: Point2D, degrees: number): Point2D {
  const radians = degToRad(degrees)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}

export function fromAngle(degrees: number, magnitude = 1): Point2D {
  const radians = degToRad(degrees)
  return { x: Math.cos(radians) * magnitude, y: Math.sin(radians) * magnitude }
}

export function angleOf(v: Point2D): number {
  return radToDeg(Math.atan2(v.y, v.x))
}

export function angleBetween(a: Point2D, b: Point2D): number {
  const na = normalize(a)
  const nb = normalize(b)
  const dot = Math.min(1, Math.max(-1, na.x * nb.x + na.y * nb.y))
  return radToDeg(Math.acos(dot))
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function lerp(a: Point2D, b: Point2D, t: number): Point2D {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function snap(value: number, step: number): number {
  return Math.round(value / step) * step
}
