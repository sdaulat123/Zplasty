export function EdgeCorrespondenceDiagram() {
  return (
    <svg className="mt-3 h-24 w-full" viewBox="0 0 240 90" role="img" aria-label="Edge correspondence diagram">
      <rect width="240" height="90" rx="10" fill="#fff7df" />
      <path d="M48 65 L96 24 L118 65 Z" fill="#f3a0a8" opacity="0.45" stroke="#b55246" />
      <path d="M122 24 L144 65 L194 24 Z" fill="#7ac9c2" opacity="0.45" stroke="#258a84" />
      <path d="M95 24 C120 6 147 8 194 24" stroke="#7464c8" strokeDasharray="4 4" fill="none" />
      <path d="M48 65 C87 84 117 85 144 65" stroke="#d28b30" strokeDasharray="4 4" fill="none" />
      <text x="18" y="18" fill="#6f4d27" fontSize="10" fontWeight="700">Matching borders</text>
    </svg>
  )
}
